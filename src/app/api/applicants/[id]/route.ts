import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApplicantById, updateApplicant, deleteApplicant } from "@/lib/applicants";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const applicant = await getApplicantById(id);
    if (!applicant) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }
    return NextResponse.json(applicant);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch applicant" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const { performed_by, ...updates } = body;

    const applicant = await updateApplicant(id, updates, performed_by as string | undefined);
    return NextResponse.json(applicant);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update applicant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteApplicant(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete applicant" }, { status: 500 });
  }
}
