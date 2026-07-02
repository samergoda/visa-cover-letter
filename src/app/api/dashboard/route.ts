import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/applicants";
import { getVisaStatuses } from "@/lib/settings";

export async function GET() {
  try {
    const [stats, statuses] = await Promise.all([
      getDashboardStats(),
      getVisaStatuses(),
    ]);

    // Attach color info to byStatus
    const byStatusWithColor = stats?.byStatus.map((s) => {
      const statusDef = statuses.find((vs) => vs.name === s.status);
      return { ...s, color: statusDef?.color ?? "#6b7280" };
    });

    return NextResponse.json({ ...stats, byStatus: byStatusWithColor });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
