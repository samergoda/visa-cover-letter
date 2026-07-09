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
  ArrowRight,
  Globe,
  Award,
  AlertCircle,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
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

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const { data, isLoading, error } = useDashboard();

  // Helper to extract initials for applicant avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const statusColors: Record<string, string> = {
    "Waiting Documents": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Submitted: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    Approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Passport Returned": "bg-lime-500/10 text-lime-500 border-lime-500/20",
    Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    Cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  return (
    <DashboardLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        {/* Top Header Row with quick action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t("overviewTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("overviewSubtitle")}</p>
          </div>
          <Button
            asChild
            className="shrink-0 shadow-xs hover:shadow-md transition-all duration-300"
          >
            <Link href="/applicants/new">
              <Plus className="h-4 w-4 mr-1.5" />
              {t("newApplicant")}
            </Link>
          </Button>
        </div>

        {/* Hero Metrics Cards Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : error || !data ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{t("failedLoad")}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Success Rate */}
            <Card className="relative overflow-hidden bg-linear-to-br from-indigo-500/5 to-blue-600/5 dark:from-indigo-950/20 dark:to-blue-900/20 border-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {t("successRate")}
                  </span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                    <Award className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0}%
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t("approvedOf", { approved: data.approved, total: data.total })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* In Progress */}
            <Card className="relative overflow-hidden bg-linear-to-br from-amber-500/5 to-orange-600/5 dark:from-amber-950/20 dark:to-orange-900/20 border-amber-500/10 hover:border-amber-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {t("inProgress")}
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                    <FileCheck2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {data.waiting_documents + data.submitted || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{t("processing")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Completed */}
            <Card className="relative overflow-hidden bg-linear-to-br from-emerald-500/5 to-teal-600/5 dark:from-emerald-950/20 dark:to-teal-900/20 border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {t("completed")}
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {data.approved + data.passport_returned || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{t("processed")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            <Card className="relative overflow-hidden bg-linear-to-br from-rose-500/5 to-red-600/5 dark:from-rose-950/20 dark:to-red-900/20 border-rose-500/10 hover:border-rose-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
              <CardContent className="p-5 flex flex-col justify-between h-full min-h-[100px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    {t("issues")}
                  </span>
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {data.rejected + data.cancelled || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{t("issuesDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Columns Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Visual Analytics Column (Spans 2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Charts Card */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {t("performanceAnalytics")}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t("performanceDescription")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="timeline" className="space-y-4">
                  <TabsList className="grid grid-cols-3 w-full max-w-xs">
                    <TabsTrigger value="timeline" className="text-xs">
                      {t("tabTimeline")}
                    </TabsTrigger>
                    <TabsTrigger value="status" className="text-xs">
                      {t("tabStatusShare")}
                    </TabsTrigger>
                    <TabsTrigger value="country" className="text-xs">
                      {t("tabDestinations")}
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Monthly Timeline */}
                  <TabsContent value="timeline" className="mt-2">
                    {isLoading ? (
                      <Skeleton className="h-[240px] w-full rounded-lg" />
                    ) : !data?.byMonth?.length ? (
                      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                        {t("noData")}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={data.byMonth} margin={{ left: -15, right: 10, top: 10 }}>
                          <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10, fill: "#fff" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 10, fill: "#fff" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                              backgroundColor: "var(--card)",
                              color: "var(--foreground)",
                              fontSize: "11px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#areaGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </TabsContent>

                  {/* Tab 2: Status Share */}
                  <TabsContent value="status" className="mt-2">
                    {isLoading ? (
                      <Skeleton className="h-[240px] w-full rounded-lg" />
                    ) : !data?.byStatus?.length ? (
                      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                        {t("noData")}
                      </div>
                    ) : (
                      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6">
                        <div className="relative">
                          <ResponsiveContainer width={220} height={220}>
                            <PieChart>
                              <Pie
                                data={data.byStatus}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={3}
                                cornerRadius={4}
                                labelLine={false}
                              >
                                {data.byStatus.map((entry, index) => (
                                  <Cell key={index} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "8px",
                                  border: "1px solid var(--border)",
                                  backgroundColor: "var(--card)",
                                  fontSize: "11px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-extrabold text-foreground">
                              {data.total}
                            </span>
                            <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider">
                              {t("total")}
                            </span>
                          </div>
                        </div>

                        {/* Legends grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 max-w-sm">
                          {data.byStatus.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <span
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground truncate max-w-[100px]">
                                {entry.status}
                              </span>
                              <span className="font-semibold ml-auto">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab 3: Destinations */}
                  <TabsContent value="country" className="mt-2">
                    {isLoading ? (
                      <Skeleton className="h-[240px] w-full rounded-lg" />
                    ) : !data?.byCountry?.length ? (
                      <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">
                        {t("noData")}
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart
                          data={data.byCountry}
                          layout="vertical"
                          margin={{ left: -10, right: 10 }}
                        >
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#34d399" stopOpacity={0.3} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 10, fill: "#fff" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="country"
                            type="category"
                            width={80}
                            tick={{ fontSize: 10, fill: "#fff" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Bar
                            dataKey="count"
                            fill="url(#barGradient)"
                            radius={[0, 4, 4, 0]}
                            barSize={14}
                            label={{
                              position: "right",
                              fontSize: 10,
                              fill: "var(--foreground)",
                              fontWeight: 600,
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Applicants Card */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {t("recentApplications")}
                  </CardTitle>
                  <CardDescription className="text-xs">{t("recentDescription")}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs h-8 px-2">
                  <Link href="/applicants" className="flex items-center gap-1">
                    {t("viewAll")} <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : !data?.recentApplicants?.length ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">{t("noRecent")}</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.recentApplicants.map((applicant) => (
                      <Link
                        key={applicant.id}
                        href={`/applicants/${applicant.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/30 hover:border-primary/20 transition-all duration-300"
                      >
                        {/* Avatar */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          {getInitials(applicant.full_name)}
                        </div>

                        {/* Name and destination */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {applicant.full_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Globe className="h-3 w-3 text-muted-foreground/75" />
                            {applicant.destination_country}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 border shrink-0 rounded-full font-medium ${
                            statusColors[applicant.status] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {applicant.status}
                        </Badge>

                        {/* Hover Action Indicator */}
                        <div className="h-6 w-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary/5 text-primary transition-all duration-300">
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Columns (Spans 1/3 on large screens) */}
          <div className="space-y-6">
            {/* Visual Funnel/Pipeline Breakdown */}
            <Card className="shadow-xs border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t("funnelTitle")}</CardTitle>
                <CardDescription className="text-xs">{t("funnelSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : !data ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">{t("noData")}</p>
                ) : (
                  <div className="space-y-3.5 pt-2">
                    {[
                      {
                        label: t("funnelDraft"),
                        count: data.waiting_documents,
                        color: "bg-amber-500",
                      },
                      { label: t("funnelSubmitted"), count: data.submitted, color: "bg-cyan-500" },
                      { label: t("funnelApproved"), count: data.approved, color: "bg-emerald-500" },
                      {
                        label: t("funnelReturned"),
                        count: data.passport_returned,
                        color: "bg-lime-500",
                      },
                      { label: t("funnelRejected"), count: data.rejected, color: "bg-red-500" },
                      { label: t("funnelCancelled"), count: data.cancelled, color: "bg-slate-500" },
                    ].map((item, idx) => {
                      const percentage = data.total > 0 ? (item.count / data.total) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground/80">{item.label}</span>
                            <span className="font-bold text-foreground">{item.count}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color} transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions & Tips Card */}
            <Card className="shadow-xs border-border/80 bg-linear-to-br from-card to-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{t("shortcutsTitle")}</CardTitle>
                <CardDescription className="text-xs">{t("shortcutsSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full justify-start text-xs border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <Link href="/applicants" className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    {t("manageApplicants")}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full justify-start text-xs border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <Link href="/admin/settings" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-violet-500" />
                    {t("configureChecklists")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
