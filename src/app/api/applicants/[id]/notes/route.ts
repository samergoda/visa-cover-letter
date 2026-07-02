import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApplicantNotes, addNote } from "@/lib/applicants";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const notes = await getApplicantNotes(id);
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      author: string;
      content: string;
    };

    if (!body.author || !body.content) {
      return NextResponse.json({ error: "author and content are required" }, { status: 400 });
    }

    const note = await addNote({ applicant_id: id, ...body }, body.author);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}
