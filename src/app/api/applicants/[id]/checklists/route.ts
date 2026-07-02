import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApplicantChecklists, updateChecklistItem } from "@/lib/applicants";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const checklists = await getApplicantChecklists(id);
    return NextResponse.json(checklists);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      checklist_id: string;
      is_completed: boolean;
      completed_by?: string;
      notes?: string;
      performed_by?: string;
    };

    if (!body.checklist_id) {
      return NextResponse.json({ error: "checklist_id is required" }, { status: 400 });
    }

    await updateChecklistItem(
      body.checklist_id,
      id,
      {
        is_completed: body.is_completed,
        completed_by: body.completed_by,
        notes: body.notes,
      },
      body.performed_by
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}
