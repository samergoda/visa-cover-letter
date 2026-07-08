import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { useApplicantActivity } from "@/hooks/use-api";
import { isUpdateMetadata, isNoteMetadata } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const ACTION_COLORS: Record<string, string> = {
  applicant_created: "bg-green-500",
  applicant_updated: "bg-blue-500",
  checklist_updated: "bg-violet-500",
  status_changed: "bg-amber-500",
  file_uploaded: "bg-cyan-500",
  file_deleted: "bg-red-500",
  note_added: "bg-slate-500",
};

export function ActivityPanel({ applicantId }: { applicantId: string }) {
  const t = useTranslations("ApplicantProfile.activity");
  const { data: logs = [], isLoading } = useApplicantActivity(applicantId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { value: "all", label: t("all") },
    { value: "profile", label: t("profile") },
    { value: "status", label: t("status") },
    { value: "checklist", label: t("checklists") },
    { value: "files", label: t("documents") },
    { value: "notes", label: t("notes") },
  ];

  const matchCategory = (action: string, category: string): boolean => {
    if (category === "all") return true;
    if (category === "profile")
      return action === "applicant_created" || action === "applicant_updated";
    if (category === "status") return action === "status_changed";
    if (category === "checklist") return action === "checklist_updated";
    if (category === "files") return action === "file_uploaded" || action === "file_deleted";
    if (category === "notes") return action === "note_added";
    return false;
  };

  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );

  const filteredLogs = logs.filter((log) => {
    const matchesCat = matchCategory(log.action, selectedCategory);
    if (!matchesCat) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const desc = log.description?.toLowerCase() || "";
    const author = log.performed_by?.toLowerCase() || "";
    const actionLabel = (t(`actions.${log.action}`) || log.action).toLowerCase();

    // Check if metadata changes contain search terms
    let metadataMatch = false;
    if (log.metadata && typeof log.metadata === "object") {
      const metadataStr = JSON.stringify(log.metadata).toLowerCase();
      metadataMatch = metadataStr.includes(query);
    }

    return (
      desc.includes(query) || author.includes(query) || actionLabel.includes(query) || metadataMatch
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="h-8 text-[11px] px-2.5"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noActivity")}</p>
      ) : filteredLogs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noMatches")}</p>
      ) : (
        <div className="relative pl-6 space-y-5 pt-2">
          <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-border" />
          {filteredLogs.map((log) => {
            const hasChanges = log.action === "applicant_updated" && isUpdateMetadata(log.metadata);
            const hasNoteContent = log.action === "note_added" && isNoteMetadata(log.metadata);

            return (
              <div key={log.id} className="relative group">
                {/* Timeline dot */}
                <div
                  className={`absolute left-[-23px] top-1 h-3 w-3 rounded-full border-2 border-background shrink-0 ${ACTION_COLORS[log.action] ?? "bg-muted-foreground"}`}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {t(`actions.${log.action}`) || log.action}
                      </span>
                      {log.performed_by && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-medium">
                          {log.performed_by}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/95">{log.description}</p>

                  {/* Note Content */}
                  {hasNoteContent && isNoteMetadata(log.metadata) && (
                    <div className="mt-1 pl-2.5 border-l-2 border-primary/30 text-xs italic text-muted-foreground bg-muted/20 py-1.5 pr-2 rounded-r-md whitespace-pre-wrap">
                      &quot;{log.metadata.content}&quot;
                    </div>
                  )}

                  {/* Diff View */}
                  {hasChanges && isUpdateMetadata(log.metadata) && (
                    <div className="mt-1.5 overflow-hidden rounded-md border border-border bg-muted/10 text-[11px]">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b bg-muted/40 text-[9px] uppercase font-semibold text-muted-foreground">
                            <th className="px-2.5 py-1 w-1/3">{t("field")}</th>
                            <th className="px-2.5 py-1 w-1/3">{t("from")}</th>
                            <th className="px-2.5 py-1 w-1/3">{t("to")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(log.metadata.changes).map(([field, diff]) => (
                            <tr key={field} className="border-b last:border-b-0 hover:bg-muted/15">
                              <td className="px-2.5 py-1 font-medium text-foreground">{field}</td>
                              <td
                                className="px-2.5 py-1 text-muted-foreground truncate max-w-[120px]"
                                title={String(diff.old)}
                              >
                                {diff.old === null ||
                                diff.old === "" ||
                                diff.old === "None" ||
                                diff.old === "undefined" ? (
                                  <span className="italic text-muted-foreground/50">
                                    {t("empty")}
                                  </span>
                                ) : (
                                  String(diff.old)
                                )}
                              </td>
                              <td
                                className="px-2.5 py-1 text-foreground font-medium truncate max-w-[120px]"
                                title={String(diff.new)}
                              >
                                {diff.new === null ||
                                diff.new === "" ||
                                diff.new === "None" ||
                                diff.new === "undefined" ? (
                                  <span className="italic text-muted-foreground/50">
                                    {t("empty")}
                                  </span>
                                ) : (
                                  String(diff.new)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
