import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/applicants">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t("allApplicants")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
        {/* Status Badge & Status Changer */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <StatusBadge status={applicant.visa_status} className="shrink-0" />

          {/* Quick Status Changer */}
          <div className="flex-1 sm:flex-initial">
            <Select
              value={applicant.status_id ?? ""}
              onValueChange={onStatusChange}
              disabled={isChangingStatus || isEditing}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onEditToggle}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              <X className="mr-1.5 h-4 w-4" /> {t("cancel")}
            </Button>
          ) : (
            <>
              {applicant.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 flex-1 sm:flex-none"
                  asChild
                >
                  <a
                    href={`https://wa.me/${applicant.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="mr-1.5 h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                    </svg>
                    WhatsApp
                  </a>
                </Button>
              )}
              <Button size="sm" onClick={onEditToggle} className="flex-1 sm:flex-none">
                <Edit className="mr-1.5 h-4 w-4" /> {t("edit")}
              </Button>
            </>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="flex-1 sm:flex-none">
                <Trash2 className="mr-1.5 h-4 w-4" /> {t("delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("deleteTitle", { name: applicant.full_name })}
                </AlertDialogTitle>
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
    </div>
  );
}
