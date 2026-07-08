"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  FileUp,
  Trash2,
  MessageSquarePlus,
  CheckSquare,
  Activity,
  User,
  Plane,
  FileText,
  ExternalLink,
  Wand2,
  Copy,
  RefreshCw,
  Download,
  FileDown,
  Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ApplicantForm } from "@/components/applicants/applicant-form";
import { StatusBadge } from "@/components/applicants/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { applicantToFormValues, type ApplicantFormValues } from "@/schemas/applicant-form";
import { exportToDocx, exportToPdf, copyToClipboard } from "@/lib/export";
import {
  useApplicant,
  useStatuses,
  useApplicantDocuments,
  useApplicantChecklists,
  useApplicantNotes,
  useApplicantActivity,
} from "@/hooks/use-api";
import type {
  Applicant,
  ApplicantChecklist,
  ApplicantDocument,
  ApplicantNote,
  ActivityLog,
  OpenRouterModel,
} from "@/types";
import {
  DOCUMENT_TYPE_LABELS,
  ACTIVITY_ACTION_LABELS,
  OPENROUTER_MODELS,
  DEFAULT_MODEL,
} from "@/types";

// ─── Info Row helper ─────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

// ─── Documents Panel ─────────────────────────────────────────────────────────
function DocumentsPanel({ applicantId }: { applicantId: string }) {
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
      toast.error("Select a document type first");
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
      toast.success("File uploaded");
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
    toast.success("Document deleted");
    invalidateDocs();
  };

  return (
    <div className="space-y-4">
      {/* Upload control */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4 bg-muted/30">
        <div className="space-y-1.5 flex-1 min-w-[180px]">
          <Label>Document Type</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="file-upload" className="sr-only">
            Choose file
          </Label>
          <Button asChild variant="outline" disabled={!docType || uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileUp className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload File"}
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
        <p className="py-8 text-center text-sm text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {DOCUMENT_TYPE_LABELS[doc.document_type as keyof typeof DOCUMENT_TYPE_LABELS] ??
                    doc.document_type}
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
                      <AlertDialogTitle>Delete document?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &ldquo;{doc.file_name}&rdquo;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(doc)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
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

// ─── Checklist Panel ─────────────────────────────────────────────────────────
function ChecklistPanel({
  applicantId,
  onProgressChange,
}: {
  applicantId: string;
  onProgressChange: (p: number) => void;
}) {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useApplicantChecklists(applicantId);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const invalidateChecklists = () => {
    void queryClient.invalidateQueries({ queryKey: ["applicant-checklists", applicantId] });
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
      const completed = items.filter((it) =>
        it.id === item.id ? checked : it.is_completed
      ).length;
      onProgressChange(Math.round((completed / items.length) * 100));
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
    toast.success("Note saved");
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
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No checklist items configured.
      </p>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm tabular-nums font-semibold">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <Badge variant="outline">
          {completed}/{items.length} completed
        </Badge>
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
                placeholder="Internal notes..."
                value={editingNotes[item.id] ?? item.notes ?? ""}
                onChange={(e) =>
                  setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                }
                className="min-h-[60px] text-xs"
              />
              {editingNotes[item.id] !== undefined && (
                <Button size="sm" variant="outline" onClick={() => handleNoteSave(item)}>
                  <Save className="mr-1.5 h-3 w-3" /> Save Note
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notes Panel ─────────────────────────────────────────────────────────────
function NotesPanel({ applicantId }: { applicantId: string }) {
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading } = useApplicantNotes(applicantId);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!author.trim() || !content.trim()) {
      toast.error("Author and content are required");
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
        toast.success("Note added");
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
        <h3 className="text-sm font-semibold">Add Note</h3>
        <div className="space-y-1.5">
          <Label htmlFor="note-author">Your Name</Label>
          <Input
            id="note-author"
            placeholder="John Smith"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note-content">Note</Label>
          <Textarea
            id="note-content"
            placeholder="Write a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <Button onClick={handleAdd} disabled={submitting} size="sm">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          {submitting ? "Adding..." : "Add Note"}
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
        <p className="py-8 text-center text-sm text-muted-foreground">No notes yet.</p>
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

// ─── Activity Panel ────────────────────────────────────────────────────────
function ActivityPanel({ applicantId }: { applicantId: string }) {
  const { data: logs = [], isLoading } = useApplicantActivity(applicantId);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const actionColors: Record<string, string> = {
    applicant_created: "bg-green-500",
    applicant_updated: "bg-blue-500",
    checklist_updated: "bg-violet-500",
    status_changed: "bg-amber-500",
    file_uploaded: "bg-cyan-500",
    file_deleted: "bg-red-500",
    note_added: "bg-slate-500",
  };

  const categories = [
    { value: "all", label: "All" },
    { value: "profile", label: "Profile" },
    { value: "status", label: "Status" },
    { value: "checklist", label: "Checklists" },
    { value: "files", label: "Documents" },
    { value: "notes", label: "Notes" },
  ];

  const matchCategory = (action: string, category: string): boolean => {
    if (category === "all") return true;
    if (category === "profile") return action === "applicant_created" || action === "applicant_updated";
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
    const actionLabel = (ACTIVITY_ACTION_LABELS[log.action as keyof typeof ACTIVITY_ACTION_LABELS] ?? log.action).toLowerCase();

    // Check if metadata changes contain search terms
    let metadataMatch = false;
    if (log.metadata && typeof log.metadata === "object") {
      const metadataStr = JSON.stringify(log.metadata).toLowerCase();
      metadataMatch = metadataStr.includes(query);
    }

    return desc.includes(query) || author.includes(query) || actionLabel.includes(query) || metadataMatch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
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
        <p className="py-8 text-center text-sm text-muted-foreground">No activity logged yet.</p>
      ) : filteredLogs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No activity matches your filters.</p>
      ) : (
        <div className="relative pl-6 space-y-5 pt-2">
          <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-border" />
          {filteredLogs.map((log) => {
            const metadataObj = log.metadata as any;
            const hasChanges = log.action === "applicant_updated" && metadataObj?.changes && Object.keys(metadataObj.changes).length > 0;
            const hasNoteContent = log.action === "note_added" && metadataObj?.content;

            return (
              <div key={log.id} className="relative group">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-background shrink-0 ${actionColors[log.action] ?? "bg-muted-foreground"}`}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        {ACTIVITY_ACTION_LABELS[log.action as keyof typeof ACTIVITY_ACTION_LABELS] ??
                          log.action}
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
                  {hasNoteContent && (
                    <div className="mt-1 pl-2.5 border-l-2 border-primary/30 text-xs italic text-muted-foreground bg-muted/20 py-1.5 pr-2 rounded-r-md whitespace-pre-wrap">
                      "{String(metadataObj.content)}"
                    </div>
                  )}

                  {/* Diff View */}
                  {hasChanges && (
                    <div className="mt-1.5 overflow-hidden rounded-md border border-border bg-muted/10 text-[11px]">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b bg-muted/40 text-[9px] uppercase font-semibold text-muted-foreground">
                            <th className="px-2.5 py-1 w-1/3">Field</th>
                            <th className="px-2.5 py-1 w-1/3">From</th>
                            <th className="px-2.5 py-1 w-1/3">To</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(metadataObj.changes).map(([field, diff]: [string, any]) => (
                            <tr key={field} className="border-b last:border-b-0 hover:bg-muted/15">
                              <td className="px-2.5 py-1 font-medium text-foreground">{field}</td>
                              <td className="px-2.5 py-1 text-muted-foreground truncate max-w-[120px]" title={String(diff.old)}>
                                {diff.old === null || diff.old === "" || diff.old === "None" || diff.old === "undefined" ? (
                                  <span className="italic text-muted-foreground/50">empty</span>
                                ) : (
                                  String(diff.old)
                                )}
                              </td>
                              <td className="px-2.5 py-1 text-foreground font-medium truncate max-w-[120px]" title={String(diff.new)}>
                                {diff.new === null || diff.new === "" || diff.new === "None" || diff.new === "undefined" ? (
                                  <span className="italic text-muted-foreground/50">empty</span>
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

// ─── Cover Letter Panel ───────────────────────────────────────────────────────
function CoverLetterPanel({ applicant }: { applicant: Applicant }) {
  const [letter, setLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState<OpenRouterModel>(DEFAULT_MODEL);
  const [tone, setTone] = useState("standard");

  // Map Applicant → ClientInformation shape expected by /api/generate
  const buildClientPayload = () => ({
    fullName: applicant.full_name,
    passportNumber: applicant.passport_number ?? "",
    nationality: applicant.nationality,
    dateOfBirth: applicant.date_of_birth ?? "",
    maritalStatus: applicant.marital_status ?? "",
    email: applicant.email ?? "",
    phone: applicant.phone ?? "",
    currentAddress: applicant.home_address ?? "",
    cityOfResidence: "",
    passportIssueDate: applicant.passport_issue_date ?? "",
    passportExpiryDate: applicant.passport_expiry_date ?? "",
    destinationCountry: applicant.destination_country,
    purposeOfTravel: applicant.purpose_of_travel ?? "",
    visaType: "Schengen Visa",
    embassyCity: applicant.entry_country ?? "",
    numberOfEntries: applicant.number_of_entries ?? "",
    travelStartDate: applicant.arrival_date ?? "",
    travelEndDate: applicant.departure_date ?? "",
    duration: applicant.duration_of_stay ? `${applicant.duration_of_stay} days` : "",
    hostName: applicant.hotel_name ?? "",
    hostAddress: applicant.hotel_address ?? "",
    itinerary: "",
    occupation: applicant.occupation ?? "",
    employerName: applicant.employer ?? "",
    employerAddress: "",
    employmentType: "",
    monthlySalary: "",
    annualIncome: "",
    employmentStartDate: "",
    bankBalance: "",
    tripFundedBy: applicant.sponsor_name ? "sponsor" : "self",
    travelInsuranceAvailable: !!applicant.insurance_company,
    otherAssets: "",
    previousVisas: false,
    countriesVisited: "",
    previousVisaRefusals: false,
    previousVisaRefusalDetails: "",
    schengenVisasHeld: "",
    hotelReservationAvailable: !!applicant.hotel_name,
    flightReservationAvailable: false,
    sponsorInformation: applicant.sponsor_name
      ? `${applicant.sponsor_name}${applicant.sponsor_relationship ? ` (${applicant.sponsor_relationship})` : ""}${applicant.sponsor_phone ? `, ${applicant.sponsor_phone}` : ""}`
      : "",
    familyTiesHomeCountry: "",
    reasonToReturn: "",
    consultantNotes: "",
    additionalNotes: "",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLetter("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: buildClientPayload(), model, tone }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || !data.content) {
        toast.error(data.error ?? "Failed to generate letter");
        return;
      }
      setLetter(data.content);
      toast.success("Cover letter generated");
    } catch {
      toast.error("Generation failed. Check your OpenRouter API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = letter.trim() ? letter.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4 bg-muted/30">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label>AI Model</Label>
          <Select value={model} onValueChange={(v) => setModel(v as OpenRouterModel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPENROUTER_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label>Letter Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Formal / Standard</SelectItem>
              <SelectItem value="executive">Professional / Executive</SelectItem>
              <SelectItem value="student">Student / Academic</SelectItem>
              <SelectItem value="urgent">Urgent Travel</SelectItem>
              <SelectItem value="family">Family Reunion / Warm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              {letter ? "Regenerate" : "Generate Cover Letter"}
            </>
          )}
        </Button>
      </div>

      {/* Preview */}
      {isGenerating && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {letter && !isGenerating && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Generated Letter</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{wordCount} words</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyToClipboard(letter);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportToDocx(letter, applicant.full_name, applicant.destination_country)
                  }
                >
                  <FileDown className="mr-1.5 h-3.5 w-3.5" /> DOCX
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportToPdf(letter, applicant.full_name, applicant.destination_country)
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            </div>
            <CardDescription>You can edit the letter directly before exporting.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="min-h-[480px] resize-y font-serif leading-relaxed text-sm"
            />
          </CardContent>
        </Card>
      )}

      {!letter && !isGenerating && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Wand2 className="h-10 w-10 opacity-20" />
          <p className="text-sm">
            Click &ldquo;Generate Cover Letter&rdquo; to create a letter using this applicant&apos;s
            data.
          </p>
          <p className="text-xs">
            Requires an OpenRouter API key in{" "}
            <code className="text-xs bg-muted px-1 rounded">.env.local</code>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicantProfilePage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id;
  const locale = params.locale;
  const t = useTranslations("ApplicantForm");

  const genderMap: Record<string, string> = {
    male: locale === "ar" ? "ذكر" : "Male",
    female: locale === "ar" ? "أنثى" : "Female",
    other: locale === "ar" ? "آخر" : "Other",
  };

  const maritalStatusMap: Record<string, string> = {
    single: locale === "ar" ? "عازب/ة" : "Single",
    married: locale === "ar" ? "متزوج/ة" : "Married",
    divorced: locale === "ar" ? "مطلق/ة" : "Divorced",
    widowed: locale === "ar" ? "أرمل/ة" : "Widowed",
    separated: locale === "ar" ? "منفصل/ة" : "Separated",
  };

  const { data: applicant = null, isLoading } = useApplicant(id);
  const { data: statusesData } = useStatuses();
  const statuses = (statusesData ?? []).filter((s) => s.is_active);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Sync progress from applicant data
  const applicantProgress = applicant?.progress_percentage ?? 0;
  if (progress !== applicantProgress && !isLoading && applicant) {
    setProgress(applicantProgress);
  }

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
        toast.error("Failed to save changes");
        return;
      }
      toast.success("Applicant updated");
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
      await fetch(`/api/applicants/${id}`, { method: "DELETE" });
      toast.success("Applicant deleted");
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["applicants"] });
      router.push("/applicants");
    } catch {
      toast.error("Failed to delete applicant");
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
        toast.error("Failed to update status");
        return;
      }
      toast.success("Status updated");
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
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applicants">
              <ArrowLeft className="mr-2 h-4 w-4" /> All Applicants
            </Link>
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <StatusBadge status={applicant.visa_status} />

            {/* Quick Status Changer */}
            <div className="flex items-center gap-2">
              <Select
                value={applicant.status_id ?? ""}
                onValueChange={handleStatusChange}
                disabled={isChangingStatus || isEditing}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change status..." />
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
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  <X className="mr-1.5 h-4 w-4" /> Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1.5 h-4 w-4" /> Edit
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {applicant.full_name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes the applicant and all associated documents, notes, and
                    activity logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Progress bar */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Checklist Progress</span>
                <span className="tabular-nums font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>
            {applicant.assigned_employee && (
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">Assigned to</p>
                <p className="text-sm font-medium">{applicant.assigned_employee}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit form OR tabbed view */}
        {isEditing ? (
          <div className="rounded-lg border p-1">
            <div className="p-4 border-b flex items-center gap-2">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Edit Applicant</span>
            </div>
            <div className="p-4">
              <ApplicantForm
                initialValues={applicantToFormValues(
                  applicant as unknown as Record<string, unknown>
                )}
                onSubmit={handleSave}
                isSubmitting={isSaving}
                submitLabel="Save Changes"
              />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="info">
                <User className="mr-1.5 h-4 w-4" />
                {t("steps.personal") || "Personal"}
              </TabsTrigger>
              <TabsTrigger value="travel">
                <Plane className="mr-1.5 h-4 w-4" />
                {t("steps.travel") || "Travel"}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="mr-1.5 h-4 w-4" />
                {locale === "ar" ? "المستندات" : "Documents"}
              </TabsTrigger>
              <TabsTrigger value="checklist">
                <CheckSquare className="mr-1.5 h-4 w-4" />
                {locale === "ar" ? "قائمة المهام" : "Checklist"}
              </TabsTrigger>
              <TabsTrigger value="notes">
                <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                {locale === "ar" ? "ملاحظات" : "Notes"}
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="mr-1.5 h-4 w-4" />
                {locale === "ar" ? "النشاطات" : "Activity"}
              </TabsTrigger>
              <TabsTrigger value="cover-letter">
                <Wand2 className="mr-1.5 h-4 w-4" />
                {locale === "ar" ? "رسالة التغطية" : "Cover Letter"}
              </TabsTrigger>
            </TabsList>

            {/* Personal + Passport */}
            <TabsContent value="info" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("personal.title") || "Personal Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow
                    label={t("personal.fullName") || "Full Name"}
                    value={applicant.full_name}
                  />
                  <InfoRow
                    label={t("personal.nationality") || "Nationality"}
                    value={applicant.nationality}
                  />
                  <InfoRow
                    label={t("personal.gender") || "Gender"}
                    value={
                      applicant.gender ? genderMap[applicant.gender] || applicant.gender : null
                    }
                  />
                  <InfoRow
                    label={t("personal.dateOfBirth") || "Date of Birth"}
                    value={
                      applicant.date_of_birth
                        ? format(new Date(applicant.date_of_birth), "MMM d, yyyy")
                        : null
                    }
                  />
                  <InfoRow
                    label={t("personal.placeOfBirth") || "Place of Birth"}
                    value={applicant.place_of_birth}
                  />
                  <InfoRow
                    label={t("personal.maritalStatus") || "Marital Status"}
                    value={
                      applicant.marital_status
                        ? maritalStatusMap[applicant.marital_status] || applicant.marital_status
                        : null
                    }
                  />
                  <InfoRow
                    label={t("personal.occupation") || "Occupation"}
                    value={applicant.occupation}
                  />
                  <InfoRow
                    label={t("personal.employer") || "Employer"}
                    value={applicant.employer}
                  />
                  <InfoRow label={t("personal.phone") || "Phone Number"} value={applicant.phone} />
                  <InfoRow label={t("personal.email") || "Email"} value={applicant.email} />
                  <InfoRow label={t("personal.city") || "City"} value={applicant.city} />
                  <InfoRow
                    label={t("personal.hasBankAccount") || "Active Bank Account"}
                    value={
                      applicant.has_bank_account !== undefined &&
                      applicant.has_bank_account !== null
                        ? applicant.has_bank_account
                          ? locale === "ar"
                            ? "نعم"
                            : "Yes"
                          : locale === "ar"
                            ? "لا"
                            : "No"
                        : "—"
                    }
                  />
                  <div className="col-span-2 sm:col-span-3">
                    <InfoRow
                      label={t("personal.homeAddress") || "Home Address"}
                      value={applicant.home_address}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("passport.title") || "Passport Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow
                    label={t("passport.number") || "Passport Number"}
                    value={applicant.passport_number}
                  />
                  <InfoRow
                    label={t("passport.issuingCountry") || "Issuing Country"}
                    value={applicant.passport_issuing_country}
                  />
                  <InfoRow
                    label={t("passport.issueDate") || "Issue Date"}
                    value={
                      applicant.passport_issue_date
                        ? format(new Date(applicant.passport_issue_date), "MMM d, yyyy")
                        : null
                    }
                  />
                  <InfoRow
                    label={t("passport.expiryDate") || "Expiry Date"}
                    value={
                      applicant.passport_expiry_date
                        ? format(new Date(applicant.passport_expiry_date), "MMM d, yyyy")
                        : null
                    }
                  />
                </CardContent>
              </Card>
              {(applicant.sponsor_name || applicant.sponsor_relationship) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("sponsor.title") || "Sponsor Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <InfoRow
                      label={t("sponsor.name") || "Sponsor Name"}
                      value={applicant.sponsor_name}
                    />
                    <InfoRow
                      label={t("sponsor.relationship") || "Relationship"}
                      value={applicant.sponsor_relationship}
                    />
                    <InfoRow
                      label={t("sponsor.phone") || "Sponsor Phone"}
                      value={applicant.sponsor_phone}
                    />
                    <div className="col-span-2 sm:col-span-3">
                      <InfoRow
                        label={t("sponsor.address") || "Sponsor Address"}
                        value={applicant.sponsor_address}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              {(applicant.insurance_company || applicant.insurance_number) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("insurance.title") || "Insurance"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <InfoRow
                      label={t("insurance.company") || "Insurance Company"}
                      value={applicant.insurance_company}
                    />
                    <InfoRow
                      label={t("insurance.policyNumber") || "Policy Number"}
                      value={applicant.insurance_number}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Travel */}
            <TabsContent value="travel" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("travel.title") || "Travel Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow
                    label={t("travel.destinationCountry") || "Destination Country"}
                    value={applicant.destination_country}
                  />
                  <InfoRow
                    label={t("travel.entryCountry") || "Entry Country"}
                    value={applicant.entry_country}
                  />
                  <InfoRow
                    label={t("travel.purpose") || "Purpose of Travel"}
                    value={applicant.purpose_of_travel}
                  />
                  <InfoRow
                    label={t("travel.arrivalDate") || "Arrival Date"}
                    value={
                      applicant.arrival_date
                        ? format(new Date(applicant.arrival_date), "MMM d, yyyy")
                        : null
                    }
                  />
                  <InfoRow
                    label={t("travel.departureDate") || "Departure Date"}
                    value={
                      applicant.departure_date
                        ? format(new Date(applicant.departure_date), "MMM d, yyyy")
                        : null
                    }
                  />
                  <InfoRow
                    label={t("travel.numEntries") || "Number of Entries"}
                    value={applicant.number_of_entries}
                  />
                  <InfoRow
                    label={t("travel.duration") || "Duration of Stay"}
                    value={
                      applicant.duration_of_stay
                        ? `${applicant.duration_of_stay} ${locale === "ar" ? "أيام" : "days"}`
                        : null
                    }
                  />
                  <InfoRow
                    label={locale === "ar" ? "اسم الفندق" : "Hotel Name"}
                    value={applicant.hotel_name}
                  />
                  <div className="col-span-2 sm:col-span-3">
                    <InfoRow
                      label={locale === "ar" ? "عنوان الفندق" : "Hotel Address"}
                      value={applicant.hotel_address}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DocumentsPanel applicantId={id} />
            </TabsContent>

            <TabsContent value="checklist" className="mt-4">
              <ChecklistPanel applicantId={id} onProgressChange={setProgress} />
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <NotesPanel applicantId={id} />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityPanel applicantId={id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cover-letter" className="mt-4">
              <CoverLetterPanel applicant={applicant} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
