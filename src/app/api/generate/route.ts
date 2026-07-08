import { NextResponse } from "next/server";
import { getOpenRouterApiKey } from "@/lib/env";
import { createChatCompletion, OpenRouterError } from "@/lib/openrouter";
import { buildCoverLetterPrompt } from "@/lib/prompts";
import type { ClientInformation, OpenRouterModel } from "@/types";
import { DEFAULT_MODEL } from "@/types";

interface GenerateRequestBody {
  client: ClientInformation;
  model?: OpenRouterModel;
  tone?: string;
}

const VALID_MODELS: OpenRouterModel[] = [
  "deepseek/deepseek-chat-v3",
  "openai/gpt-4o-mini",
  "qwen/qwen-3-235b-a22b",
  "google/gemini-2.5-flash",
];

export async function POST(request: Request) {
  try {
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your environment variables.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as GenerateRequestBody;

    if (!body.client?.fullName || !body.client?.destinationCountry) {
      return NextResponse.json({ error: "Client information is incomplete." }, { status: 400 });
    }

    const model = body.model && VALID_MODELS.includes(body.model) ? body.model : DEFAULT_MODEL;

    const prompt = buildCoverLetterPrompt(body.client, body.tone);

    const result = await createChatCompletion({
      apiKey,
      model,
      messages: [
        {
          role: "system",
          content:
            "You write formal visa cover letters for embassy submissions. Follow instructions exactly and never invent facts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating the letter." },
      { status: 500 }
    );
  }
}
