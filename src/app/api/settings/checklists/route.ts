import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getChecklistTemplates,
  createChecklistTemplate,
  reorderChecklistTemplates,
} from "@/lib/settings";

export async function GET() {
  try {
    const templates = await getChecklistTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch checklist templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (body.action === "reorder") {
      await reorderChecklistTemplates(body.orderedIds as string[]);
      return NextResponse.json({ success: true });
    }

    const template = await createChecklistTemplate({
      name: body.name as string,
      description: (body.description as string) ?? null,
      order_index: (body.order_index as number) ?? 0,
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create template" },
      { status: 500 }
    );
  }
}
