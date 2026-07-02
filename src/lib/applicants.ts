import { createAdminClient } from "@/lib/supabase/server";
import type {
  Applicant,
  ApplicantChecklist,
  ApplicantDocument,
  ApplicantFilters,
  ApplicantNote,
  ActivityAction,
  ActivityLog,
  PaginatedResult,
} from "@/types";

// ============================================================
// Applicants CRUD
// ============================================================

export async function getApplicants(
  filters: ApplicantFilters = {}
): Promise<PaginatedResult<Applicant>> {
  const supabase = createAdminClient();
  const {
    search,
    status_id,
    destination_country,
    assigned_employee,
    page = 1,
    pageSize = 20,
    sortBy = "created_at",
    sortDir = "desc",
  } = filters;

  let query = supabase
    .from("applicants")
    .select("*, visa_status:visa_statuses(*)", { count: "exact" });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,passport_number.ilike.%${search}%,nationality.ilike.%${search}%`
    );
  }
  if (status_id) query = query.eq("status_id", status_id);
  if (destination_country) query = query.ilike("destination_country", `%${destination_country}%`);
  if (assigned_employee) query = query.ilike("assigned_employee", `%${assigned_employee}%`);

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order(sortBy, { ascending: sortDir === "asc" }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data as Applicant[]) ?? [],
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getApplicantById(id: string): Promise<Applicant | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicants")
    .select("*, visa_status:visa_statuses(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Applicant;
}

export async function createApplicant(
  applicantData: Partial<Applicant>,
  performedBy?: string
): Promise<Applicant> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("applicants")
    .insert(applicantData)
    .select("*, visa_status:visa_statuses(*)")
    .single();

  if (error) throw new Error(error.message);
  const applicant = data as Applicant;

  // Associate all active checklist templates
  const { data: templates } = await supabase
    .from("checklist_templates")
    .select("id")
    .eq("is_active", true);

  if (templates && templates.length > 0) {
    const checklistItems = templates.map((t) => ({
      applicant_id: applicant.id,
      template_id: t.id,
      is_completed: false,
    }));
    await supabase.from("applicant_checklists").insert(checklistItems);
  }

  // Log activity
  await logActivity(
    applicant.id,
    "applicant_created",
    `Applicant ${applicant.full_name} was created`,
    performedBy
  );

  return applicant;
}

export async function updateApplicant(
  id: string,
  updates: Partial<Applicant>,
  performedBy?: string
): Promise<Applicant> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("applicants")
    .update(updates)
    .eq("id", id)
    .select("*, visa_status:visa_statuses(*)")
    .single();

  if (error) throw new Error(error.message);
  const applicant = data as Applicant;

  await logActivity(
    id,
    "applicant_updated",
    `Applicant information was updated`,
    performedBy,
    updates as Record<string, unknown>
  );

  return applicant;
}

export async function deleteApplicant(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("applicants").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function bulkDeleteApplicants(ids: string[]): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("applicants").delete().in("id", ids);
  if (error) throw new Error(error.message);
}

export async function bulkUpdateStatus(
  ids: string[],
  statusId: string,
  performedBy?: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("applicants").update({ status_id: statusId }).in("id", ids);
  if (error) throw new Error(error.message);

  // Log for each
  for (const id of ids) {
    await logActivity(id, "status_changed", `Status was bulk updated`, performedBy);
  }
}

// ============================================================
// Documents
// ============================================================

export async function getApplicantDocuments(applicantId: string): Promise<ApplicantDocument[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicant_documents")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("uploaded_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ApplicantDocument[]) ?? [];
}

export async function addDocument(
  doc: Omit<ApplicantDocument, "id" | "uploaded_at">,
  performedBy?: string
): Promise<ApplicantDocument> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("applicant_documents").insert(doc).select().single();

  if (error) throw new Error(error.message);

  await logActivity(
    doc.applicant_id,
    "file_uploaded",
    `File "${doc.file_name}" was uploaded (${doc.document_type})`,
    performedBy
  );

  return data as ApplicantDocument;
}

export async function deleteDocument(
  documentId: string,
  applicantId: string,
  fileName: string,
  performedBy?: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("applicant_documents").delete().eq("id", documentId);

  if (error) throw new Error(error.message);

  await logActivity(applicantId, "file_deleted", `File "${fileName}" was deleted`, performedBy);
}

// ============================================================
// Checklists
// ============================================================

export async function getApplicantChecklists(applicantId: string): Promise<ApplicantChecklist[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicant_checklists")
    .select("*, template:checklist_templates(*)")
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ApplicantChecklist[]) ?? [];
}

export async function updateChecklistItem(
  checklistId: string,
  applicantId: string,
  updates: {
    is_completed: boolean;
    completed_by?: string;
    notes?: string;
  },
  performedBy?: string
): Promise<void> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    is_completed: updates.is_completed,
    notes: updates.notes ?? null,
    completed_by: updates.is_completed ? (updates.completed_by ?? performedBy ?? null) : null,
    completed_at: updates.is_completed ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from("applicant_checklists")
    .update(updateData)
    .eq("id", checklistId);

  if (error) throw new Error(error.message);

  // Recalculate and update progress
  await recalculateProgress(applicantId);

  await logActivity(
    applicantId,
    "checklist_updated",
    `Checklist item was marked as ${updates.is_completed ? "completed" : "incomplete"}`,
    performedBy
  );
}

export async function recalculateProgress(applicantId: string): Promise<number> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("applicant_checklists")
    .select("is_completed")
    .eq("applicant_id", applicantId);

  if (!data || data.length === 0) return 0;

  const completed = data.filter((item) => item.is_completed).length;
  const percentage = Math.round((completed / data.length) * 100);

  await supabase
    .from("applicants")
    .update({ progress_percentage: percentage })
    .eq("id", applicantId);

  return percentage;
}

// ============================================================
// Notes
// ============================================================

export async function getApplicantNotes(applicantId: string): Promise<ApplicantNote[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicant_notes")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ApplicantNote[]) ?? [];
}

export async function addNote(
  note: { applicant_id: string; author: string; content: string },
  performedBy?: string
): Promise<ApplicantNote> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("applicant_notes").insert(note).select().single();

  if (error) throw new Error(error.message);

  await logActivity(
    note.applicant_id,
    "note_added",
    `A note was added by ${note.author}`,
    performedBy
  );

  return data as ApplicantNote;
}

// ============================================================
// Activity Log
// ============================================================

export async function getActivityLogs(applicantId: string): Promise<ActivityLog[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applicant_activity_logs")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ActivityLog[]) ?? [];
}

async function logActivity(
  applicantId: string,
  action: ActivityAction,
  description: string,
  performedBy?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("applicant_activity_logs").insert({
    applicant_id: applicantId,
    action,
    description,
    performed_by: performedBy ?? null,
    metadata: metadata ?? null,
  });
}

// ============================================================
// Dashboard Stats
// ============================================================

export async function getDashboardStats() {
  const supabase = createAdminClient();

  const { data: applicants } = await supabase
    .from("applicants")
    .select(
      "id, full_name, status_id, visa_status:visa_statuses(name), destination_country, created_at"
    );

  if (!applicants) return null;

  const total = applicants.length;

  const statusCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  const monthlyCounts: Record<string, number> = {};

  for (const a of applicants) {
    const statusName = (a.visa_status as { name?: string } | null)?.name ?? "Unknown";
    statusCounts[statusName] = (statusCounts[statusName] ?? 0) + 1;

    const country = a.destination_country ?? "Unknown";
    countryCounts[country] = (countryCounts[country] ?? 0) + 1;

    const month = new Date(a.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    monthlyCounts[month] = (monthlyCounts[month] ?? 0) + 1;
  }

  // Get recent applicants
  const recentApplicants = applicants
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      full_name: a.full_name,
      destination_country: a.destination_country ?? "Unknown",
      status: (a.visa_status as { name?: string } | null)?.name ?? "Unknown",
      created_at: a.created_at,
    }));

  return {
    total,
    waiting_documents: statusCounts["Waiting Documents"] ?? 0,
    submitted: statusCounts["Submitted"] ?? 0,
    approved: statusCounts["Approved"] ?? 0,
    rejected: statusCounts["Rejected"] ?? 0,
    cancelled: statusCounts["Cancelled"] ?? 0,
    passport_returned: statusCounts["Passport Returned"] ?? 0,
    byStatus: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    })),
    byCountry: Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count })),
    byMonth: Object.entries(monthlyCounts)
      .sort((a, b) => new Date(`1 ${a[0]}`).getTime() - new Date(`1 ${b[0]}`).getTime())
      .map(([month, count]) => ({ month, count })),
    recentApplicants,
  };
}
