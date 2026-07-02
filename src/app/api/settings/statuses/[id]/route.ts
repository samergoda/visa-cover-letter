import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateVisaStatus, deleteVisaStatus } from "@/lib/settings";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const status = await updateVisaStatus(id, body);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteVisaStatus(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete status" }, { status: 500 });
  }
}
