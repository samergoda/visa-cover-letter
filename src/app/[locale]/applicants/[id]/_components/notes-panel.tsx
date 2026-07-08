import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useApplicantNotes } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export function NotesPanel({ applicantId }: { applicantId: string }) {
  const t = useTranslations("ApplicantProfile.notes");
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading } = useApplicantNotes(applicantId);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!author.trim() || !content.trim()) {
      toast.error(t("required"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applicants/${applicantId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) {
        toast.success(t("added"));
        setContent("");
        void queryClient.invalidateQueries({ queryKey: ["applicant-notes", applicantId] });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
        <h3 className="text-sm font-semibold">{t("addNote")}</h3>
        <div className="space-y-1.5">
          <Label htmlFor="note-author">{t("yourName")}</Label>
          <Input
            id="note-author"
            placeholder={t("namePlaceholder")}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note-content">{t("notes.addNote")}</Label>
          <Textarea
            id="note-content"
            placeholder={t("notePlaceholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <Button onClick={handleAdd} disabled={submitting} size="sm">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          {submitting ? t("adding") : t("addButton")}
        </Button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("noNotes")}</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{note.author}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
