// ============================================================
// Existing types (cover letter generator)
// ============================================================

export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "separated";

export type EmploymentType =
  "full-time" | "part-time" | "self-employed" | "contract" | "unemployed" | "retired" | "student";

export type TripFundedBy = "self" | "employer" | "sponsor" | "family" | "other";

export interface ClientInformation {
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  maritalStatus: MaritalStatus;
  email: string;
  phone: string;
  currentAddress: string;
  cityOfResidence: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  destinationCountry: string;
  purposeOfTravel: string;
  visaType: string;
  embassyCity: string;
  numberOfEntries: string;
  travelStartDate: string;
  travelEndDate: string;
  duration: string;
  hostName: string;
  hostAddress: string;
  itinerary: string;
  occupation: string;
  employerName: string;
  employerAddress: string;
  employmentType: string;
  monthlySalary: string;
  annualIncome: string;
  employmentStartDate: string;
  bankBalance: string;
  tripFundedBy: string;
  travelInsuranceAvailable: boolean;
  otherAssets: string;
  previousVisas: boolean;
  countriesVisited: string;
  previousVisaRefusals: boolean;
  previousVisaRefusalDetails: string;
  schengenVisasHeld: string;
  hotelReservationAvailable: boolean;
  flightReservationAvailable: boolean;
  sponsorInformation: string;
  familyTiesHomeCountry: string;
  reasonToReturn: string;
  consultantNotes: string;
  additionalNotes: string;
}

export interface GeneratedLetter {
  id: string;
  clientName: string;
  destinationCountry: string;
  content: string;
  model: string;
  createdAt: string;
  client?: ClientInformation;
}

export interface AppSettings {
  model: OpenRouterModel;
}

export type OpenRouterModel =
  | "deepseek/deepseek-chat-v3"
  | "openai/gpt-4o-mini"
  | "qwen/qwen-3-235b-a22b"
  | "google/gemini-2.5-flash";

export const OPENROUTER_MODELS: {
  value: OpenRouterModel;
  label: string;
}[] = [
  { value: "deepseek/deepseek-chat-v3", label: "DeepSeek Chat V3 (Default)" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "qwen/qwen-3-235b-a22b", label: "Qwen 3 235B" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];

export const DEFAULT_MODEL: OpenRouterModel = "deepseek/deepseek-chat-v3";

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "self-employed", label: "Self-employed" },
  { value: "contract", label: "Contract" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
];

export const TRIP_FUNDED_BY_OPTIONS: { value: TripFundedBy; label: string }[] = [
  { value: "self", label: "Self-funded" },
  { value: "employer", label: "Employer" },
  { value: "sponsor", label: "Sponsor" },
  { value: "family", label: "Family" },
  { value: "other", label: "Other" },
];

// ============================================================
// Visa Application Management System types
// ============================================================

export interface VisaStatus {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Applicant {
  id: string;
  // Personal Information
  full_name: string;
  nationality: string;
  gender: "male" | "female" | "other" | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  marital_status: "single" | "married" | "divorced" | "widowed" | "separated" | null;
  occupation: string | null;
  employer: string | null;
  phone: string | null;
  email: string | null;
  home_address: string | null;
  // Passport Details
  passport_number: string | null;
  passport_issue_date: string | null;
  passport_expiry_date: string | null;
  passport_issuing_country: string | null;
  // Travel Information
  destination_country: string;
  entry_country: string | null;
  purpose_of_travel: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  number_of_entries: string | null;
  duration_of_stay: number | null;
  // Financial / Sponsor
  sponsor_name: string | null;
  sponsor_relationship: string | null;
  sponsor_phone: string | null;
  sponsor_address: string | null;
  // Accommodation
  hotel_name: string | null;
  hotel_address: string | null;
  // Insurance
  insurance_company: string | null;
  insurance_number: string | null;
  // Status & Assignment
  status_id: string | null;
  assigned_employee: string | null;
  progress_percentage: number;
  // Timestamps
  created_at: string;
  updated_at: string;
  // Joined
  visa_status?: VisaStatus | null;
}

export interface ApplicantDocument {
  id: string;
  applicant_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

export type DocumentType =
  | "passport_scan"
  | "bank_statement"
  | "salary_certificate"
  | "hotel_booking"
  | "flight_reservation"
  | "insurance_certificate"
  | "national_id"
  | "personal_photo"
  | "visa_application_form"
  | "invitation_letter"
  | "additional";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  passport_scan: "Passport Scan",
  bank_statement: "Bank Statement",
  salary_certificate: "Salary Certificate",
  hotel_booking: "Hotel Booking",
  flight_reservation: "Flight Reservation",
  insurance_certificate: "Insurance Certificate",
  national_id: "National ID",
  personal_photo: "Personal Photo",
  visa_application_form: "Visa Application Form",
  invitation_letter: "Invitation Letter",
  additional: "Additional Document",
};

export interface ApplicantChecklist {
  id: string;
  applicant_id: string;
  template_id: string;
  is_completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  template?: ChecklistTemplate;
}

export interface ApplicantNote {
  id: string;
  applicant_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  applicant_id: string;
  action: ActivityAction;
  description: string;
  performed_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type ActivityAction =
  | "applicant_created"
  | "applicant_updated"
  | "checklist_updated"
  | "status_changed"
  | "file_uploaded"
  | "file_deleted"
  | "note_added";

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  applicant_created: "Applicant Created",
  applicant_updated: "Applicant Updated",
  checklist_updated: "Checklist Updated",
  status_changed: "Status Changed",
  file_uploaded: "File Uploaded",
  file_deleted: "File Deleted",
  note_added: "Note Added",
};

// Pagination
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Applicant table filters
export interface ApplicantFilters {
  search?: string;
  status_id?: string;
  destination_country?: string;
  assigned_employee?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// Dashboard stats
export interface DashboardStats {
  total: number;
  waiting_documents: number;
  submitted: number;
  approved: number;
  rejected: number;
  passport_returned: number;
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface CountryData {
  country: string;
  count: number;
}

export interface StatusData {
  status: string;
  count: number;
  color: string;
}
