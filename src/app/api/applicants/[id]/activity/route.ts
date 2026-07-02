import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getActivityLogs } from "@/lib/applicants";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logs = await getActivityLogs(id);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
