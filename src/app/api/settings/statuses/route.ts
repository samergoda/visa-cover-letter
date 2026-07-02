import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getVisaStatuses,
  createVisaStatus,
  reorderVisaStatuses,
} from "@/lib/settings";

export async function GET() {
  try {
    const statuses = await getVisaStatuses();
    return NextResponse.json(statuses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch statuses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;

    if (body.action === "reorder") {
      await reorderVisaStatuses(body.orderedIds as string[]);
      return NextResponse.json({ success: true });
    }

    const status = await createVisaStatus({
      name: body.name as string,
      color: body.color as string,
      order_index: (body.order_index as number) ?? 0,
    });
    return NextResponse.json(status, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create status" },
      { status: 500 }
    );
  }
}
