import { NextResponse } from "next/server";
import { getOpenRouterApiKey } from "@/lib/env";
import { createChatCompletion } from "@/lib/openrouter";
import { getApplicantById, updateApplicant } from "@/lib/applicants";
import { DEFAULT_MODEL } from "@/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const applicant = await getApplicantById(id);
    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key not configured. Set OPENROUTER_API_KEY in your environment variables." },
        { status: 401 }
      );
    }

    const duration = applicant.duration_of_stay || 5;
    const purpose = applicant.purpose_of_travel || "Tourism";
    const hotelName = applicant.hotel_name || "N/A";
    const hotelAddress = applicant.hotel_address || "N/A";

    const prompt = `
Create a detailed day-by-day travel itinerary for a visa application cover letter.
Applicant Details:
- Name: ${applicant.full_name}
- Destination: ${applicant.destination_country}
- First Entry: ${applicant.entry_country || applicant.destination_country}
- Travel Dates: ${applicant.arrival_date || "N/A"} to ${applicant.departure_date || "N/A"}
- Duration of Stay: ${duration} days
- Purpose: ${purpose}
- Accommodation: ${hotelName} (${hotelAddress})

Instructions:
- Return a list of ${duration} days.
- For each day, write a realistic, embassy-appropriate travel plan (morning/afternoon/evening activities).
- Ensure activities match the purpose of travel (e.g. tourism vs. business meetings).
- You MUST output ONLY a valid JSON array of objects, with no extra text, notes, or explanations before or after.
- The JSON objects must match this exact structure:
[
  {
    "day": 1,
    "date": "YYYY-MM-DD (or 'Day 1' if travel dates are not provided)",
    "activities": "Activities description..."
  }
]
`;

    const aiResponse = await createChatCompletion({
      apiKey,
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that outputs strictly valid JSON arrays of travel itineraries for visa applications. Do not include markdown code block syntax.",
        },
        { role: "user", content: prompt },
      ],
      maxTokens: 2000,
    });

    let cleanContent = aiResponse.content.trim();

    // Sanitize any markdown code block wrapping
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }

    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }

    cleanContent = cleanContent.trim();

    let parsedItinerary;
    try {
      parsedItinerary = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse LLM itinerary JSON:", cleanContent);
      return NextResponse.json(
        { error: "Failed to parse itinerary format from AI" },
        { status: 502 }
      );
    }

    // Save back to Supabase
    await updateApplicant(id, { travel_itinerary: parsedItinerary });

    return NextResponse.json({ itinerary: parsedItinerary });
  } catch (error) {
    console.error("POST /api/applicants/[id]/itinerary error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
