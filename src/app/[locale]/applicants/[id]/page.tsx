"use client";

import { useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import {
  User,
  Plane,
  FileText,
  CheckSquare,
  MessageSquarePlus,
  Activity,
  Wand2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ApplicantForm } from "@/components/applicants/applicant-form";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/error-boundary";
import { applicantToFormValues, type ApplicantFormValues } from "@/schemas/applicant-form";
import { useApplicant, useStatuses } from "@/hooks/use-api";

// Sub-components
import { ApplicantHeader } from "./_components/applicant-header";
import { PersonalInfoTab } from "./_components/personal-info-tab";
import { TravelInfoTab } from "./_components/travel-info-tab";
import { DocumentsPanel } from "./_components/documents-panel";
import { ChecklistPanel } from "./_components/checklist-panel";
import { NotesPanel } from "./_components/notes-panel";
import { ActivityPanel } from "./_components/activity-panel";
import { CoverLetterPanel } from "./_components/cover-letter-panel";

export default function ApplicantProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("ApplicantProfile");

  const { data: applicant = null, isLoading } = useApplicant(id);
  const { data: statusesData } = useStatuses();
  const statuses = (statusesData ?? []).filter((s) => s.is_active);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const progress = applicant?.progress_percentage ?? 0;

  const handleSave = async (values: ApplicantFormValues) => {
    setIsSaving(true);
    try {
      // Strip empty strings to keep DB clean
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(values)) {
        payload[k] = v === "" ? null : v;
      }
      const res = await fetch(`/api/applicants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        toast.error(t("toasts.saveFailed"));
        return;
      }
      toast.success(t("toasts.saveSuccess"));
      setIsEditing(false);
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["applicant", id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-activity", id] });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/applicants/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(t("toasts.deleteFailed"));
        return;
      }
      toast.success(t("toasts.deleteSuccess"));
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["applicants"] });
      router.push("/applicants");
    } catch {
      toast.error(t("toasts.deleteFailed"));
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (!applicant) return;
    setIsChangingStatus(true);
    try {
      const res = await fetch(`/api/applicants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status_id: newStatusId }),
      });
      if (!res.ok) {
        toast.error(t("toasts.statusFailed"));
        return;
      }
      toast.success(t("toasts.statusUpdated"));
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["applicant", id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-activity", id] });
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Applicant Profile">
        <div className="space-y-4 max-w-5xl">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!applicant) return null;

  return (
    <DashboardLayout
      title={applicant.full_name}
      description={`${applicant.nationality} · ${applicant.destination_country}`}
    >
      <div className="space-y-6 max-w-5xl">
        {/* Header toolbar */}
        <ApplicantHeader
          applicant={applicant}
          statuses={statuses}
          isEditing={isEditing}
          isSaving={isSaving}
          isChangingStatus={isChangingStatus}
          onEditToggle={() => setIsEditing(!isEditing)}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />

        {/* Progress bar */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t("progress.checklistProgress")}</span>
                <span className="tabular-nums font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>
            {applicant.assigned_employee && (
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">{t("progress.assignedTo")}</p>
                <p className="text-sm font-medium">{applicant.assigned_employee}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit form OR tabbed view */}
        {isEditing ? (
          <div className="rounded-lg border p-1 bg-card">
            <div className="p-4 border-b flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{t("header.editApplicant")}</span>
            </div>
            <div className="p-4">
              <ApplicantForm
                initialValues={applicantToFormValues(applicant)}
                onSubmit={handleSave}
                isSubmitting={isSaving}
                submitLabel={t("header.edit")}
              />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="info">
                <User className="mr-1.5 h-4 w-4" />
                {t("tabs.personal")}
              </TabsTrigger>
              <TabsTrigger value="travel">
                <Plane className="mr-1.5 h-4 w-4" />
                {t("tabs.travel")}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="mr-1.5 h-4 w-4" />
                {t("tabs.documents")}
              </TabsTrigger>
              <TabsTrigger value="checklist">
                <CheckSquare className="mr-1.5 h-4 w-4" />
                {t("tabs.checklist")}
              </TabsTrigger>
              <TabsTrigger value="notes">
                <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                {t("tabs.notes")}
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="mr-1.5 h-4 w-4" />
                {t("tabs.activity")}
              </TabsTrigger>
              <TabsTrigger value="cover-letter">
                <Wand2 className="mr-1.5 h-4 w-4" />
                {t("tabs.coverLetter")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <PersonalInfoTab applicant={applicant} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="travel" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <TravelInfoTab applicant={applicant} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <DocumentsPanel applicantId={id} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="checklist" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <ChecklistPanel applicantId={id} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <NotesPanel applicantId={id} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <Card>
                    <CardContent className="pt-6">
                      <ActivityPanel applicantId={id} />
                    </CardContent>
                  </Card>
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-4">
              <ErrorBoundary>
                <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                  <CoverLetterPanel applicant={applicant} />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
