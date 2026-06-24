import { NextResponse } from "next/server";
import { isOpenRouterConfigured } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    apiKeyConfigured: isOpenRouterConfigured(),
  });
}
