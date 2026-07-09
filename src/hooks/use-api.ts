import { useQuery } from "@tanstack/react-query";
import type {
  Applicant,
  VisaStatus,
  PaginatedResult,
  ApplicantChecklist,
  ApplicantDocument,
  ApplicantNote,
  ActivityLog,
  GeneratedLetter,
} from "@/types";

// ─── Dashboard ────────────────────────────────────────────────────────────────

interface DashboardData {
  total: number;
  waiting_documents: number;
  submitted: number;
  approved: number;
  rejected: number;
  cancelled: number;
  passport_returned: number;
  byStatus: { status: string; count: number; color: string }[];
  byCountry: { country: string; count: number }[];
  byMonth: { month: string; count: number }[];
  recentApplicants?: {
    id: string;
    full_name: string;
    destination_country: string;
    status: string;
    created_at: string;
  }[];
}

export type { DashboardData };

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json() as Promise<DashboardData>;
    },
  });
}

// ─── Visa Statuses ────────────────────────────────────────────────────────────

export function useStatuses() {
  return useQuery<VisaStatus[]>({
    queryKey: ["statuses"],
    queryFn: async () => {
      const res = await fetch("/api/settings/statuses");
      if (!res.ok) throw new Error("Failed to load statuses");
      return res.json() as Promise<VisaStatus[]>;
    },
  });
}

// ─── Applicants List ──────────────────────────────────────────────────────────

interface UseApplicantsParams {
  search?: string;
  statusFilter?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export function useApplicants(params: UseApplicantsParams) {
  const { search, statusFilter, page = 1, pageSize = 20, sortBy, sortDir } = params;

  return useQuery<PaginatedResult<Applicant>>({
    queryKey: ["applicants", { search, statusFilter, page, pageSize, sortBy, sortDir }],
    queryFn: async () => {
      const urlParams = new URLSearchParams();
      if (search) urlParams.set("search", search);
      if (statusFilter && statusFilter !== "all") urlParams.set("status_id", statusFilter);
      urlParams.set("page", String(page));
      urlParams.set("pageSize", String(pageSize));
      if (sortBy) {
        urlParams.set("sortBy", sortBy);
        urlParams.set("sortDir", sortDir ?? "asc");
      }

      const res = await fetch(`/api/applicants?${urlParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load applicants");
      return res.json() as Promise<PaginatedResult<Applicant>>;
    },
  });
}

// ─── Single Applicant ─────────────────────────────────────────────────────────

export function useApplicant(id: string) {
  return useQuery<Applicant>({
    queryKey: ["applicant", id],
    queryFn: async () => {
      const res = await fetch(`/api/applicants/${id}`);
      if (!res.ok) throw new Error("Applicant not found");
      return res.json() as Promise<Applicant>;
    },
    enabled: !!id,
  });
}

// ─── Applicant Documents ──────────────────────────────────────────────────────

export function useApplicantDocuments(applicantId: string) {
  return useQuery<ApplicantDocument[]>({
    queryKey: ["applicant-documents", applicantId],
    queryFn: async () => {
      const res = await fetch(`/api/applicants/${applicantId}/documents`);
      if (!res.ok) throw new Error("Failed to load documents");
      return res.json() as Promise<ApplicantDocument[]>;
    },
    enabled: !!applicantId,
  });
}

// ─── Applicant Checklists ─────────────────────────────────────────────────────

export function useApplicantChecklists(applicantId: string) {
  return useQuery<ApplicantChecklist[]>({
    queryKey: ["applicant-checklists", applicantId],
    queryFn: async () => {
      const res = await fetch(`/api/applicants/${applicantId}/checklists`);
      if (!res.ok) throw new Error("Failed to load checklists");
      return res.json() as Promise<ApplicantChecklist[]>;
    },
    enabled: !!applicantId,
  });
}

// ─── Applicant Notes ──────────────────────────────────────────────────────────

export function useApplicantNotes(applicantId: string) {
  return useQuery<ApplicantNote[]>({
    queryKey: ["applicant-notes", applicantId],
    queryFn: async () => {
      const res = await fetch(`/api/applicants/${applicantId}/notes`);
      if (!res.ok) throw new Error("Failed to load notes");
      return res.json() as Promise<ApplicantNote[]>;
    },
    enabled: !!applicantId,
  });
}

// ─── Applicant Activity ───────────────────────────────────────────────────────

export function useApplicantActivity(applicantId: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ["applicant-activity", applicantId],
    queryFn: async () => {
      const res = await fetch(`/api/applicants/${applicantId}/activity`);
      if (!res.ok) throw new Error("Failed to load activity");
      return res.json() as Promise<ActivityLog[]>;
    },
    enabled: !!applicantId,
  });
}

// ─── API Config ───────────────────────────────────────────────────────────────

interface ApiConfig {
  apiKeyConfigured?: boolean;
}

export function useApiConfig() {
  return useQuery<ApiConfig>({
    queryKey: ["api-config"],
    queryFn: async () => {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to load config");
      return res.json() as Promise<ApiConfig>;
    },
    staleTime: Infinity,
  });
}

// ─── Checklist Templates (Admin) ──────────────────────────────────────────────

export function useChecklistTemplates() {
  return useQuery({
    queryKey: ["checklist-templates"],
    queryFn: async () => {
      const res = await fetch("/api/settings/checklists");
      if (!res.ok) throw new Error("Failed to load checklist templates");
      return res.json();
    },
  });
}

// ─── Local History ────────────────────────────────────────────────────────────

export function useHistory() {
  return useQuery<GeneratedLetter[]>({
    queryKey: ["history"],
    queryFn: () => {
      const { getHistory } = require("@/lib/storage");
      return getHistory() as GeneratedLetter[];
    },
    enabled: typeof window !== "undefined",
    initialData: [],
  });
}
