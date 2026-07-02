"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileCheck2,
  Send,
  CheckCircle2,
  XCircle,
  Stamp,
  TrendingUp,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardData {
  total: number;
  waiting_documents: number;
  submitted: number;
  approved: number;
  rejected: number;
  passport_returned: number;
  byStatus: { status: string; count: number; color: string }[];
  byCountry: { country: string; count: number }[];
  byMonth: { month: string; count: number }[];
}

const statCards = [
  {
    key: "total" as keyof DashboardData,
    label: "Total Applicants",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    key: "waiting_documents" as keyof DashboardData,
    label: "Waiting Documents",
    icon: FileCheck2,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    key: "submitted" as keyof DashboardData,
    label: "Submitted",
    icon: Send,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950",
  },
  {
    key: "approved" as keyof DashboardData,
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    key: "rejected" as keyof DashboardData,
    label: "Rejected",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
  },
  {
    key: "passport_returned" as keyof DashboardData,
    label: "Passport Returned",
    icon: Stamp,
    color: "text-lime-500",
    bg: "bg-lime-50 dark:bg-lime-950",
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d: DashboardData) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data");
        setIsLoading(false);
      });
  }, []);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of all Schengen visa applications."
    >
      <div className="space-y-6">
        {/* Quick Action */}
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/applicants/new">
              <Plus className="h-4 w-4" />
              New Applicant
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map(({ key, label, icon: Icon, color, bg }) => (
            <Card key={key}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {(data?.[key] as number) ?? 0}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applications by Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Applications by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : !data?.byMonth?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No data available yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.byMonth}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Visa Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : !data?.byStatus?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No data available yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {data.byStatus.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Destination Country</CardTitle>
            <CardDescription>Top 10 destination countries</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !data?.byCountry?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No data available yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.byCountry} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="country" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
