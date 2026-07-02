"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";
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
import type {
  Applicant,
  ApplicantChecklist,
  ApplicantDocument,
  ApplicantNote,
  ActivityLog,
  OpenRouterModel,
} from "@/types";
import { DOCUMENT_TYPE_LABELS, ACTIVITY_ACTION_LABELS, OPENROUTER_MODELS, DEFAULT_MODEL } from "@/types";

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
  const [docs, setDocs] = useState<ApplicantDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<string>("");

  const fetchDocs = useCallback(async () => {
    const res = await fetch(`/api/applicants/${applicantId}/documents`);
    const data = await res.json() as ApplicantDocument[];
    setDocs(data);
    setIsLoading(false);
  }, [applicantId]);

  useEffect(() => { void fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docType) { toast.error("Select a document type first"); return; }
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
        const err = await res.json() as { error: string };
        toast.error(err.error ?? "Upload failed");
        return;
      }
      toast.success("File uploaded");
      void fetchDocs();
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
    void fetchDocs();
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
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="file-upload" className="sr-only">Choose file</Label>
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
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : docs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {DOCUMENT_TYPE_LABELS[doc.document_type as keyof typeof DOCUMENT_TYPE_LABELS] ?? doc.document_type}
                  {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(1)} KB` : ""}
                  {" · "}{format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" aria-label="Open document">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete document?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete &ldquo;{doc.file_name}&rdquo;.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(doc)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
function ChecklistPanel({ applicantId, onProgressChange }: { applicantId: string; onProgressChange: (p: number) => void }) {
  const [items, setItems] = useState<ApplicantChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const fetchItems = useCallback(async () => {
    const res = await fetch(`/api/applicants/${applicantId}/checklists`);
    const data = await res.json() as ApplicantChecklist[];
    setItems(data);
    setIsLoading(false);
  }, [applicantId]);

  useEffect(() => { void fetchItems(); }, [fetchItems]);

  const handleToggle = async (item: ApplicantChecklist, checked: boolean) => {
    setItems((prev) => prev.map((it) => it.id === item.id ? { ...it, is_completed: checked } : it));
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
      const completed = items.filter((it) => (it.id === item.id ? checked : it.is_completed)).length;
      onProgressChange(Math.round((completed / items.length) * 100));
      void fetchItems();
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
    setEditingNotes((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
    void fetchItems();
  };

  const completed = items.filter((i) => i.is_completed).length;
  const percentage = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No checklist items configured.</p>;

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
        <Badge variant="outline">{completed}/{items.length} completed</Badge>
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
                <label htmlFor={`cl-${item.id}`} className={`text-sm font-medium cursor-pointer ${item.is_completed ? "line-through text-muted-foreground" : ""}`}>
                  {item.template?.name ?? "Unknown"}
                </label>
                {item.template?.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.template.description}</p>
                )}
                {item.is_completed && item.completed_by && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed by {item.completed_by}{item.completed_at ? ` on ${format(new Date(item.completed_at), "MMM d, yyyy")}` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="pl-7 space-y-1.5">
              <Textarea
                placeholder="Internal notes..."
                value={editingNotes[item.id] ?? item.notes ?? ""}
                onChange={(e) => setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
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
  const [notes, setNotes] = useState<ApplicantNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    const res = await fetch(`/api/applicants/${applicantId}/notes`);
    const data = await res.json() as ApplicantNote[];
    setNotes(data);
    setIsLoading(false);
  }, [applicantId]);

  useEffect(() => { void fetchNotes(); }, [fetchNotes]);

  const handleAdd = async () => {
    if (!author.trim() || !content.trim()) { toast.error("Author and content are required"); return; }
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
        void fetchNotes();
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
          <Input id="note-author" placeholder="John Smith" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note-content">Note</Label>
          <Textarea id="note-content" placeholder="Write a note..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[80px]" />
        </div>
        <Button onClick={handleAdd} disabled={submitting} size="sm">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          {submitting ? "Adding..." : "Add Note"}
        </Button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : notes.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{note.author}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(note.created_at), "MMM d, yyyy HH:mm")}</span>
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
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/applicants/${applicantId}/activity`)
      .then((r) => r.json())
      .then((d: ActivityLog[]) => { setLogs(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [applicantId]);

  const actionColors: Record<string, string> = {
    applicant_created: "bg-green-500",
    applicant_updated: "bg-blue-500",
    checklist_updated: "bg-violet-500",
    status_changed: "bg-amber-500",
    file_uploaded: "bg-cyan-500",
    file_deleted: "bg-red-500",
    note_added: "bg-slate-500",
  };

  if (isLoading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  if (logs.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No activity logged yet.</p>;

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
      {logs.map((log) => (
        <div key={log.id} className="relative flex gap-4 pb-4">
          <div className={`relative z-10 mt-1 h-[10px] w-[10px] shrink-0 rounded-full ${actionColors[log.action] ?? "bg-muted-foreground"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">
                {ACTIVITY_ACTION_LABELS[log.action as keyof typeof ACTIVITY_ACTION_LABELS] ?? log.action}
              </span>
              {log.performed_by && <span className="text-xs text-muted-foreground">by {log.performed_by}</span>}
            </div>
            <p className="text-xs text-muted-foreground">{log.description}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(log.created_at), "MMM d, yyyy HH:mm")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cover Letter Panel ───────────────────────────────────────────────────────
function CoverLetterPanel({ applicant }: { applicant: Applicant }) {
  const [letter, setLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [model, setModel] = useState<OpenRouterModel>(DEFAULT_MODEL);

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
        body: JSON.stringify({ client: buildClientPayload(), model }),
      });
      const data = await res.json() as { content?: string; error?: string };
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
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating
            ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Generating...</>
            : <><Wand2 className="mr-2 h-4 w-4" />{letter ? "Regenerate" : "Generate Cover Letter"}</>
          }
        </Button>
      </div>

      {/* Preview */}
      {isGenerating && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
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
                <Button size="sm" variant="outline" onClick={async () => {
                  await copyToClipboard(letter);
                  toast.success("Copied to clipboard");
                }}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportToDocx(letter, applicant.full_name, applicant.destination_country)}>
                  <FileDown className="mr-1.5 h-3.5 w-3.5" /> DOCX
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportToPdf(letter, applicant.full_name, applicant.destination_country)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            </div>
            <CardDescription>
              You can edit the letter directly before exporting.
            </CardDescription>
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
          <p className="text-sm">Click &ldquo;Generate Cover Letter&rdquo; to create a letter using this applicant&apos;s data.</p>
          <p className="text-xs">Requires an OpenRouter API key in <code className="text-xs bg-muted px-1 rounded">.env.local</code></p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApplicantProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchApplicant = useCallback(async () => {
    const res = await fetch(`/api/applicants/${id}`);
    if (!res.ok) { toast.error("Applicant not found"); router.push("/applicants"); return; }
    const data = await res.json() as Applicant;
    setApplicant(data);
    setProgress(data.progress_percentage);
    setIsLoading(false);
  }, [id, router]);

  useEffect(() => { void fetchApplicant(); }, [fetchApplicant]);

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
      if (!res.ok) { toast.error("Failed to save changes"); return; }
      toast.success("Applicant updated");
      setIsEditing(false);
      void fetchApplicant();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/applicants/${id}`, { method: "DELETE" });
    toast.success("Applicant deleted");
    router.push("/applicants");
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
            <Link href="/applicants"><ArrowLeft className="mr-2 h-4 w-4" /> All Applicants</Link>
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <StatusBadge status={applicant.visa_status} />

            {isEditing ? (
              <>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
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
                    This permanently deletes the applicant and all associated documents, notes, and activity logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
                initialValues={applicantToFormValues(applicant as unknown as Record<string, unknown>)}
                onSubmit={handleSave}
                isSubmitting={isSaving}
                submitLabel="Save Changes"
              />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="info">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="info"><User className="mr-1.5 h-4 w-4" />Personal</TabsTrigger>
              <TabsTrigger value="travel"><Plane className="mr-1.5 h-4 w-4" />Travel</TabsTrigger>
              <TabsTrigger value="documents"><FileText className="mr-1.5 h-4 w-4" />Documents</TabsTrigger>
              <TabsTrigger value="checklist"><CheckSquare className="mr-1.5 h-4 w-4" />Checklist</TabsTrigger>
              <TabsTrigger value="notes"><MessageSquarePlus className="mr-1.5 h-4 w-4" />Notes</TabsTrigger>
              <TabsTrigger value="activity"><Activity className="mr-1.5 h-4 w-4" />Activity</TabsTrigger>
              <TabsTrigger value="cover-letter"><Wand2 className="mr-1.5 h-4 w-4" />Cover Letter</TabsTrigger>
            </TabsList>

            {/* Personal + Passport */}
            <TabsContent value="info" className="mt-4 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow label="Full Name" value={applicant.full_name} />
                  <InfoRow label="Nationality" value={applicant.nationality} />
                  <InfoRow label="Gender" value={applicant.gender} />
                  <InfoRow label="Date of Birth" value={applicant.date_of_birth ? format(new Date(applicant.date_of_birth), "MMM d, yyyy") : null} />
                  <InfoRow label="Place of Birth" value={applicant.place_of_birth} />
                  <InfoRow label="Marital Status" value={applicant.marital_status} />
                  <InfoRow label="Occupation" value={applicant.occupation} />
                  <InfoRow label="Employer" value={applicant.employer} />
                  <InfoRow label="Phone" value={applicant.phone} />
                  <InfoRow label="Email" value={applicant.email} />
                  <div className="col-span-2 sm:col-span-3"><InfoRow label="Home Address" value={applicant.home_address} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Passport Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow label="Passport Number" value={applicant.passport_number} />
                  <InfoRow label="Issuing Country" value={applicant.passport_issuing_country} />
                  <InfoRow label="Issue Date" value={applicant.passport_issue_date ? format(new Date(applicant.passport_issue_date), "MMM d, yyyy") : null} />
                  <InfoRow label="Expiry Date" value={applicant.passport_expiry_date ? format(new Date(applicant.passport_expiry_date), "MMM d, yyyy") : null} />
                </CardContent>
              </Card>
              {(applicant.sponsor_name || applicant.sponsor_relationship) && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Sponsor Information</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <InfoRow label="Sponsor Name" value={applicant.sponsor_name} />
                    <InfoRow label="Relationship" value={applicant.sponsor_relationship} />
                    <InfoRow label="Sponsor Phone" value={applicant.sponsor_phone} />
                    <div className="col-span-2 sm:col-span-3"><InfoRow label="Sponsor Address" value={applicant.sponsor_address} /></div>
                  </CardContent>
                </Card>
              )}
              {(applicant.insurance_company || applicant.insurance_number) && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Insurance</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <InfoRow label="Insurance Company" value={applicant.insurance_company} />
                    <InfoRow label="Policy Number" value={applicant.insurance_number} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Travel */}
            <TabsContent value="travel" className="mt-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Travel Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <InfoRow label="Destination Country" value={applicant.destination_country} />
                  <InfoRow label="Entry Country" value={applicant.entry_country} />
                  <InfoRow label="Purpose of Travel" value={applicant.purpose_of_travel} />
                  <InfoRow label="Arrival Date" value={applicant.arrival_date ? format(new Date(applicant.arrival_date), "MMM d, yyyy") : null} />
                  <InfoRow label="Departure Date" value={applicant.departure_date ? format(new Date(applicant.departure_date), "MMM d, yyyy") : null} />
                  <InfoRow label="Number of Entries" value={applicant.number_of_entries} />
                  <InfoRow label="Duration of Stay" value={applicant.duration_of_stay ? `${applicant.duration_of_stay} days` : null} />
                  <InfoRow label="Hotel Name" value={applicant.hotel_name} />
                  <div className="col-span-2 sm:col-span-3"><InfoRow label="Hotel Address" value={applicant.hotel_address} /></div>
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
                <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
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
