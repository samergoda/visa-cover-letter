"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";
import { useDashboard, type DashboardData } from "@/hooks/use-api";

const statCards = [
  {
    key: "total" as keyof DashboardData,
    labelKey: "totalApplicants",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    key: "waiting_documents" as keyof DashboardData,
    labelKey: "waitingDocuments",
    icon: FileCheck2,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    key: "submitted" as keyof DashboardData,
    labelKey: "submitted",
    icon: Send,
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950",
  },
  {
    key: "approved" as keyof DashboardData,
    labelKey: "approved",
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    key: "rejected" as keyof DashboardData,
    labelKey: "rejected",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
  },
  {
    key: "cancelled" as keyof DashboardData,
    labelKey: "cancelled",
    icon: XCircle,
    color: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950",
  },
  {
    key: "passport_returned" as keyof DashboardData,
    labelKey: "passportReturned",
    icon: Stamp,
    color: "text-lime-500",
    bg: "bg-lime-50 dark:bg-lime-950",
  },
] as const;

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { data, isLoading, error } = useDashboard();

  return (
    <DashboardLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex justify-end items-center gap-3">
          <Button asChild>
            <Link href="/applicants/new">
              <Plus className="h-4 w-4" />
              {t("newApplicant")}
            </Link>
          </Button>
        </div>

        {/* Quick Stats Summary */}
        {!isLoading && data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {t("successRate")}
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0}%
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {t("approvedOf", { approved: data.approved, total: data.total })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {t("inProgress")}
                </div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {data.waiting_documents + data.submitted || 0}
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">{t("processing")}</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t("completed")}
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {data.approved + data.passport_returned || 0}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">{t("processed")}</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-red-700 dark:text-red-300">
                  {t("issues")}
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {data.rejected + data.cancelled || 0}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">{t("issuesDesc")}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statCards.map(({ key, labelKey, icon: Icon, color, bg }) => (
            <Card key={key}>
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}
                >
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t(labelKey)}</p>
                  {isLoading ? (
                    <Skeleton className="mt-1 h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{(data?.[key] as number) ?? 0}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Applicants */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentApplications")}</CardTitle>
            <CardDescription>{t("recentDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !data?.recentApplicants?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("noRecent")}</p>
            ) : (
              <div className="space-y-2">
                {data.recentApplicants.map((applicant) => (
                  <Link
                    key={applicant.id}
                    href={`/applicants/${applicant.id}`}
                    className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{applicant.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {applicant.destination_country}
                        </p>
                      </div>
                      <Badge variant="outline">{applicant.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applications by Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t("byMonth")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : !data?.byMonth?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("noData")}</p>
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
              <CardTitle>{t("statusDistribution")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : !data?.byStatus?.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("noData")}</p>
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
            <CardTitle>{t("byCountry")}</CardTitle>
            <CardDescription>{t("byCountryDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !data?.byCountry?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("noData")}</p>
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
            <CardContent className="p-4 text-sm text-destructive">{t("failedLoad")}</CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
