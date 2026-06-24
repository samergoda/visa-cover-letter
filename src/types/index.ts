export type MaritalStatus =
  | "single"
  | "married"
  | "divorced"
  | "widowed"
  | "separated";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "self-employed"
  | "contract"
  | "unemployed"
  | "retired"
  | "student";

export type TripFundedBy =
  | "self"
  | "employer"
  | "sponsor"
  | "family"
  | "other";

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
