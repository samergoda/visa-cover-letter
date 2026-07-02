import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApplicants, getApplicantChecklists } from "@/lib/applicants";
import { exportApplicantsToExcel } from "@/lib/excel-export";
import type { Applicant } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      ids?: string[];
      includeChecklists?: boolean;
      filters?: Record<string, unknown>;
    };

    let applicants: Applicant[] = [];

    if (body.ids && body.ids.length > 0) {
      // Export selected
      const result = await getApplicants({
        pageSize: 10000,
      });
      applicants = result.data.filter((a) => body.ids!.includes(a.id));
    } else {
      // Export all / filtered
      const result = await getApplicants({
        ...body.filters,
        pageSize: 10000,
      });
      applicants = result.data;
    }

    let checklistsMap: Record<string, import("@/types").ApplicantChecklist[]> | undefined;

    if (body.includeChecklists) {
      checklistsMap = {};
      await Promise.all(
        applicants.map(async (a) => {
          checklistsMap![a.id] = await getApplicantChecklists(a.id);
        })
      );
    }

    const blob = await exportApplicantsToExcel(applicants, checklistsMap);
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="applicants-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
