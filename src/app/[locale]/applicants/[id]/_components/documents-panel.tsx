import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { toast } from "sonner";
import { FileUp, ExternalLink, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useApplicantDocuments } from "@/hooks/use-api";
import { DOCUMENT_TYPE_LABELS, type ApplicantDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

export function DocumentsPanel({ applicantId }: { applicantId: string }) {
  const t = useTranslations("ApplicantProfile.documents");
  const queryClient = useQueryClient();
  const { data: docs = [], isLoading } = useApplicantDocuments(applicantId);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<string>("");

  const invalidateDocs = () => {
    void queryClient.invalidateQueries({ queryKey: ["applicant-documents", applicantId] });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docType) {
      toast.error(t("selectFirst"));
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);
      const res = await fetch(`/api/applicants/${applicantId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = (await res.json()) as { error: string };
        toast.error(err.error ?? "Upload failed");
        return;
      }
      toast.success(t("uploaded"));
      invalidateDocs();
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (doc: ApplicantDocument) => {
    await fetch(`/api/applicants/${applicantId}/documents`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: doc.id, fileName: doc.file_name }),
    });
    toast.success(t("deleted"));
    invalidateDocs();
  };

  return (
    <div className="space-y-4">
      {/* Upload control */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4 bg-muted/30">
        <div className="space-y-1.5 flex-1 min-w-[180px]">
          <Label>{t("documentType")}</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger>
              <SelectValue placeholder={t("selectType")} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DOCUMENT_TYPE_LABELS).map((k) => (
                <SelectItem key={k} value={k}>
                  {t(`types.${k}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="file-upload" className="sr-only">
            {t("chooseFile")}
          </Label>
          <Button asChild variant="outline" disabled={!docType || uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileUp className="mr-2 h-4 w-4" />
              {uploading ? t("uploading") : t("uploadFile")}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={!docType || uploading}
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noDocuments")}</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`types.${doc.document_type}`) || doc.document_type}
                  {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(1)} KB` : ""}
                  {" · "}
                  {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open document"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("deleteDescription", { name: doc.file_name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doc)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
