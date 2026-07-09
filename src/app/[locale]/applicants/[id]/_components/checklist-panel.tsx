import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useApplicantChecklists } from "@/hooks/use-api";
import { type ApplicantChecklist } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ChecklistPanel({ applicantId }: { applicantId: string }) {
  const t = useTranslations("ApplicantProfile.checklist");
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useApplicantChecklists(applicantId);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const invalidateChecklists = () => {
    void queryClient.invalidateQueries({ queryKey: ["applicant-checklists", applicantId] });
    void queryClient.invalidateQueries({ queryKey: ["applicant", applicantId] });
  };

  const handleToggle = async (item: ApplicantChecklist, checked: boolean) => {
    const res = await fetch(`/api/applicants/${applicantId}/checklists`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checklist_id: item.id,
        is_completed: checked,
        notes: editingNotes[item.id] ?? item.notes,
      }),
    });
    if (res.ok) {
      invalidateChecklists();
    }
  };

  const handleNoteSave = async (item: ApplicantChecklist) => {
    await fetch(`/api/applicants/${applicantId}/checklists`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checklist_id: item.id,
        is_completed: item.is_completed,
        notes: editingNotes[item.id] ?? "",
      }),
    });
    toast.success(t("noteSaved"));
    setEditingNotes((prev) => {
      const n = { ...prev };
      delete n[item.id];
      return n;
    });
    invalidateChecklists();
  };

  const completed = items.filter((i) => i.is_completed).length;
  const percentage = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  if (items.length === 0)
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("noItems")}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium">{t("progress")}</span>
            <span className="text-sm tabular-nums font-semibold">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <Badge variant="outline">{t("completed", { completed, total: items.length })}</Badge>
      </div>

      <div className="divide-y rounded-lg border">
        {items.map((item) => (
          <div key={item.id} className="p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id={`cl-${item.id}`}
                checked={item.is_completed}
                onCheckedChange={(v) => handleToggle(item, !!v)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`cl-${item.id}`}
                  className={`text-sm font-medium cursor-pointer ${item.is_completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.template?.name ?? "Unknown"}
                </label>
                {item.template?.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.template.description}
                  </p>
                )}
                {item.is_completed && item.completed_by && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed by {item.completed_by}
                    {item.completed_at
                      ? ` on ${format(new Date(item.completed_at), "MMM d, yyyy")}`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="pl-7 space-y-1.5">
              <Textarea
                placeholder={t("internalNotes")}
                value={editingNotes[item.id] ?? item.notes ?? ""}
                onChange={(e) =>
                  setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
                className="min-h-[60px] text-xs"
              />
              {editingNotes[item.id] !== undefined && (
                <Button size="sm" variant="outline" onClick={() => handleNoteSave(item)}>
                  <Save className="mr-1.5 h-3 w-3" /> {t("saveNote")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
