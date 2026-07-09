import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Edit, Trash2, X } from "lucide-react";
import { type Applicant } from "@/types";
import { StatusBadge } from "@/components/applicants/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApplicantHeaderProps {
  applicant: Applicant;
  statuses: Array<{ id: string; name: string; color: string }>;
  isEditing: boolean;
  isSaving: boolean;
  isChangingStatus: boolean;
  onEditToggle: () => void;
  onDelete: () => Promise<void>;
  onStatusChange: (statusId: string) => Promise<void>;
}

export function ApplicantHeader({
  applicant,
  statuses,
  isEditing,
  isSaving,
  isChangingStatus,
  onEditToggle,
  onDelete,
  onStatusChange,
}: ApplicantHeaderProps) {
  const t = useTranslations("ApplicantProfile.header");
  const locale = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/applicants">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("allApplicants")}
        </Link>
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <StatusBadge status={applicant.visa_status} />

        {/* Quick Status Changer */}
        <div className="flex items-center gap-2">
          <Select
            value={applicant.status_id ?? ""}
            onValueChange={onStatusChange}
            disabled={isChangingStatus || isEditing}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("changeStatus")} />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    {status.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isEditing ? (
          <Button size="sm" variant="outline" onClick={onEditToggle} disabled={isSaving}>
            <X className="mr-1.5 h-4 w-4" /> {t("cancel")}
          </Button>
        ) : (
          <Button size="sm" onClick={onEditToggle}>
            <Edit className="mr-1.5 h-4 w-4" /> {t("edit")}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              <Trash2 className="mr-1.5 h-4 w-4" /> {t("delete")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deleteTitle", { name: applicant.full_name })}</AlertDialogTitle>
              <AlertDialogDescription>{t("deleteDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
