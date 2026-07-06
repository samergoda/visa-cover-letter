import { z } from "zod";

const optionalDate = z
  .string()
  .optional()
  .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
    message: "Must be a valid date (YYYY-MM-DD)",
  });

export const applicantFormSchema = z.object({
  // Personal Information
  full_name: z.string().min(2, "Full name is required"),
  nationality: z.string().optional().or(z.literal("")),
  has_bank_account: z.boolean().optional(),
  city: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional().or(z.literal("")),
  date_of_birth: optionalDate,
  place_of_birth: z.string().optional(),
  marital_status: z
    .enum(["single", "married", "divorced", "widowed", "separated"])
    .optional()
    .or(z.literal("")),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: "Invalid email address",
    }),
  home_address: z.string().optional(),
  // Family Visa Information
  is_family_visa: z.boolean().optional(),
  spouse_full_name: z.string().optional(),
  spouse_date_of_birth: optionalDate,
  spouse_nationality: z.string().optional(),
  spouse_passport_number: z.string().optional(),
  number_of_children: z.coerce.number().optional().or(z.literal("")),
  children_info: z.string().optional(),
  // Passport
  passport_number: z.string().optional(),
  passport_issue_date: optionalDate,
  passport_expiry_date: optionalDate,
  passport_issuing_country: z.string().optional(),
  // Travel
  destination_country: z.string().optional().or(z.literal("")),
  entry_country: z.string().optional(),
  purpose_of_travel: z.string().optional(),
  arrival_date: optionalDate,
  departure_date: optionalDate,
  number_of_entries: z.string().optional(),
  duration_of_stay: z.coerce.number().optional().or(z.literal("")),
  // Financial / Sponsor
  sponsor_name: z.string().optional(),
  sponsor_relationship: z.string().optional(),
  sponsor_phone: z.string().optional(),
  sponsor_address: z.string().optional(),
  // Accommodation
  hotel_name: z.string().optional(),
  hotel_address: z.string().optional(),
  // Insurance
  insurance_company: z.string().optional(),
  insurance_number: z.string().optional(),
  // Assignment
  status_id: z.string().optional().or(z.literal("")),
  assigned_employee: z.string().optional(),
});

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>;

export function applicantToFormValues(
  applicant: Partial<Record<string, unknown>>
): ApplicantFormValues {
  return {
    full_name: (applicant.full_name as string) ?? "",
    nationality: (applicant.nationality as string) ?? "",
    has_bank_account: (applicant.has_bank_account as boolean) ?? false,
    city: (applicant.city as string) ?? "",
    gender: (applicant.gender as ApplicantFormValues["gender"]) ?? "",
    date_of_birth: (applicant.date_of_birth as string) ?? "",
    place_of_birth: (applicant.place_of_birth as string) ?? "",
    marital_status: (applicant.marital_status as ApplicantFormValues["marital_status"]) ?? "",
    occupation: (applicant.occupation as string) ?? "",
    employer: (applicant.employer as string) ?? "",
    phone: (applicant.phone as string) ?? "",
    email: (applicant.email as string) ?? "",
    home_address: (applicant.home_address as string) ?? "",
    is_family_visa: (applicant.is_family_visa as boolean) ?? false,
    spouse_full_name: (applicant.spouse_full_name as string) ?? "",
    spouse_date_of_birth: (applicant.spouse_date_of_birth as string) ?? "",
    spouse_nationality: (applicant.spouse_nationality as string) ?? "",
    spouse_passport_number: (applicant.spouse_passport_number as string) ?? "",
    number_of_children: (applicant.number_of_children as number) ?? "",
    children_info: (applicant.children_info as string) ?? "",
    passport_number: (applicant.passport_number as string) ?? "",
    passport_issue_date: (applicant.passport_issue_date as string) ?? "",
    passport_expiry_date: (applicant.passport_expiry_date as string) ?? "",
    passport_issuing_country: (applicant.passport_issuing_country as string) ?? "",
    destination_country: (applicant.destination_country as string) ?? "",
    entry_country: (applicant.entry_country as string) ?? "",
    purpose_of_travel: (applicant.purpose_of_travel as string) ?? "",
    arrival_date: (applicant.arrival_date as string) ?? "",
    departure_date: (applicant.departure_date as string) ?? "",
    number_of_entries: (applicant.number_of_entries as string) ?? "",
    duration_of_stay: (applicant.duration_of_stay as number) ?? "",
    sponsor_name: (applicant.sponsor_name as string) ?? "",
    sponsor_relationship: (applicant.sponsor_relationship as string) ?? "",
    sponsor_phone: (applicant.sponsor_phone as string) ?? "",
    sponsor_address: (applicant.sponsor_address as string) ?? "",
    hotel_name: (applicant.hotel_name as string) ?? "",
    hotel_address: (applicant.hotel_address as string) ?? "",
    insurance_company: (applicant.insurance_company as string) ?? "",
    insurance_number: (applicant.insurance_number as string) ?? "",
    status_id: (applicant.status_id as string) ?? "",
    assigned_employee: (applicant.assigned_employee as string) ?? "",
  };
}

export const defaultApplicantFormValues: ApplicantFormValues = {
  full_name: "",
  nationality: "",
  has_bank_account: false,
  city: "",
  gender: "",
  date_of_birth: "",
  place_of_birth: "",
  marital_status: "",
  occupation: "",
  employer: "",
  phone: "",
  email: "",
  home_address: "",
  is_family_visa: false,
  spouse_full_name: "",
  spouse_date_of_birth: "",
  spouse_nationality: "",
  spouse_passport_number: "",
  number_of_children: "",
  children_info: "",
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  passport_issuing_country: "",
  destination_country: "",
  entry_country: "",
  purpose_of_travel: "",
  arrival_date: "",
  departure_date: "",
  number_of_entries: "",
  duration_of_stay: "",
  sponsor_name: "",
  sponsor_relationship: "",
  sponsor_phone: "",
  sponsor_address: "",
  hotel_name: "",
  hotel_address: "",
  insurance_company: "",
  insurance_number: "",
  status_id: "",
  assigned_employee: "",
};
