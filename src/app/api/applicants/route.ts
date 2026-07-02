import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getApplicants,
  createApplicant,
  bulkDeleteApplicants,
  bulkUpdateStatus,
} from "@/lib/applicants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters = {
      search: searchParams.get("search") ?? undefined,
      status_id: searchParams.get("status_id") ?? undefined,
      destination_country: searchParams.get("destination_country") ?? undefined,
      assigned_employee: searchParams.get("assigned_employee") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : 20,
      sortBy: searchParams.get("sortBy") ?? "created_at",
      sortDir: (searchParams.get("sortDir") as "asc" | "desc") ?? "desc",
    };

    const result = await getApplicants(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/applicants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;

    // Check for bulk actions
    if (body.action === "bulk_delete") {
      const ids = body.ids as string[];
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
      }
      await bulkDeleteApplicants(ids);
      return NextResponse.json({ success: true });
    }

    if (body.action === "bulk_status") {
      const ids = body.ids as string[];
      const status_id = body.status_id as string;
      if (!ids || !status_id) {
        return NextResponse.json(
          { error: "IDs and status_id required" },
          { status: 400 }
        );
      }
      await bulkUpdateStatus(ids, status_id, body.performed_by as string | undefined);
      return NextResponse.json({ success: true });
    }

    // Create applicant
    const { action: _action, ...applicantData } = body;
    if (!applicantData.full_name || !applicantData.destination_country) {
      return NextResponse.json(
        { error: "full_name and destination_country are required" },
        { status: 400 }
      );
    }

    const applicant = await createApplicant(
      applicantData,
      body.performed_by as string | undefined
    );
    return NextResponse.json(applicant, { status: 201 });
  } catch (error) {
    console.error("POST /api/applicants error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create applicant" },
      { status: 500 }
    );
  }
}
