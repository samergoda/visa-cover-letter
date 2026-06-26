import { z } from "zod";
import type { ClientInformation } from "@/types";

/** ISO date string YYYY-MM-DD or empty */
const dateField = (label: string) =>
  z.string().refine(
    (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
    { message: `${label} must be a valid date` }
  );

const requiredDateField = (label: string) =>
  z.string()
    .min(1, `${label} is required`)
    .refine(
      (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
      { message: `${label} must be a valid date` }
    );

export const clientFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .regex(/^[A-Za-z\s\-'.]+$/, "Full name may only contain letters, spaces, hyphens, and apostrophes"),
    passportNumber: z
      .string()
      .min(5, "Passport number must be at least 5 characters")
      .max(20, "Passport number is too long")
      .regex(/^[A-Z0-9]+$/i, "Passport number may only contain letters and numbers"),
    nationality: z.string().min(2, "Nationality is required"),
    dateOfBirth: requiredDateField("Date of birth"),
    maritalStatus: z.enum([
      "single",
      "married",
      "divorced",
      "widowed",
      "separated",
    ]),
    email: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        { message: "Invalid email address" }
      ),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[\d\s+\-().]{7,20}$/.test(val),
        { message: "Invalid phone number" }
      ),
    currentAddress: z.string().optional(),
    cityOfResidence: z.string().optional(),
    passportIssueDate: dateField("Passport issue date"),
    passportExpiryDate: dateField("Passport expiry date"),
    destinationCountry: z.string().min(2, "Destination country is required"),
    purposeOfTravel: z.string().min(3, "Purpose of travel is required"),
    visaType: z.string().optional(),
    embassyCity: z.string().optional(),
    numberOfEntries: z.string().optional(),
    travelStartDate: requiredDateField("Travel start date"),
    travelEndDate: requiredDateField("Travel end date"),
    /** Auto-calculated from start/end dates — not editable by user */
    duration: z.string(),
    hostName: z.string().optional(),
    hostAddress: z.string().optional(),
    itinerary: z.string().optional(),
    occupation: z.string().optional(),
    employerName: z.string().optional(),
    employerAddress: z.string().optional(),
    employmentType: z.string().optional(),
    monthlySalary: z.string().optional(),
    annualIncome: z.string().optional(),
    employmentStartDate: dateField("Employment start date"),
    bankBalance: z.string().optional(),
    tripFundedBy: z.string().optional(),
    travelInsuranceAvailable: z.boolean(),
    otherAssets: z.string().optional(),
    previousVisas: z.boolean(),
    countriesVisited: z.string().optional(),
    previousVisaRefusals: z.boolean(),
    previousVisaRefusalDetails: z.string().optional(),
    schengenVisasHeld: z.string().optional(),
    hotelReservationAvailable: z.boolean(),
    flightReservationAvailable: z.boolean(),
    sponsorInformation: z.string().optional(),
    familyTiesHomeCountry: z.string().optional(),
    reasonToReturn: z.string().optional(),
    consultantNotes: z.string().optional(),
    additionalNotes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.travelStartDate || !data.travelEndDate) return true;
      return new Date(data.travelEndDate) >= new Date(data.travelStartDate);
    },
    {
      message: "End date must be on or after start date",
      path: ["travelEndDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.passportIssueDate || !data.passportExpiryDate) return true;
      return new Date(data.passportExpiryDate) > new Date(data.passportIssueDate);
    },
    {
      message: "Passport expiry must be after issue date",
      path: ["passportExpiryDate"],
    }
  );

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const defaultClientFormValues: ClientFormValues = {
  fullName: "",
  passportNumber: "",
  nationality: "",
  dateOfBirth: "",
  maritalStatus: "single",
  email: "",
  phone: "",
  currentAddress: "",
  cityOfResidence: "",
  passportIssueDate: "",
  passportExpiryDate: "",
  destinationCountry: "",
  purposeOfTravel: "",
  visaType: "",
  embassyCity: "",
  numberOfEntries: "",
  travelStartDate: "",
  travelEndDate: "",
  duration: "",
  hostName: "",
  hostAddress: "",
  itinerary: "",
  occupation: "",
  employerName: "",
  employerAddress: "",
  employmentType: "",
  monthlySalary: "",
  annualIncome: "",
  employmentStartDate: "",
  bankBalance: "",
  tripFundedBy: "",
  travelInsuranceAvailable: false,
  otherAssets: "",
  previousVisas: false,
  countriesVisited: "",
  previousVisaRefusals: false,
  previousVisaRefusalDetails: "",
  schengenVisasHeld: "",
  hotelReservationAvailable: false,
  flightReservationAvailable: false,
  sponsorInformation: "",
  familyTiesHomeCountry: "",
  reasonToReturn: "",
  consultantNotes: "",
  additionalNotes: "",
};

export function toClientInformation(values: ClientFormValues): ClientInformation {
  return {
    fullName: values.fullName,
    passportNumber: values.passportNumber,
    nationality: values.nationality,
    dateOfBirth: values.dateOfBirth,
    maritalStatus: values.maritalStatus,
    email: values.email ?? "",
    phone: values.phone ?? "",
    currentAddress: values.currentAddress ?? "",
    cityOfResidence: values.cityOfResidence ?? "",
    passportIssueDate: values.passportIssueDate ?? "",
    passportExpiryDate: values.passportExpiryDate ?? "",
    destinationCountry: values.destinationCountry,
    purposeOfTravel: values.purposeOfTravel,
    visaType: values.visaType ?? "",
    embassyCity: values.embassyCity ?? "",
    numberOfEntries: values.numberOfEntries ?? "",
    travelStartDate: values.travelStartDate,
    travelEndDate: values.travelEndDate,
    duration: values.duration,
    hostName: values.hostName ?? "",
    hostAddress: values.hostAddress ?? "",
    itinerary: values.itinerary ?? "",
    occupation: values.occupation ?? "",
    employerName: values.employerName ?? "",
    employerAddress: values.employerAddress ?? "",
    employmentType: values.employmentType ?? "",
    monthlySalary: values.monthlySalary ?? "",
    annualIncome: values.annualIncome ?? "",
    employmentStartDate: values.employmentStartDate ?? "",
    bankBalance: values.bankBalance ?? "",
    tripFundedBy: values.tripFundedBy ?? "",
    travelInsuranceAvailable: values.travelInsuranceAvailable,
    otherAssets: values.otherAssets ?? "",
    previousVisas: values.previousVisas,
    countriesVisited: values.countriesVisited ?? "",
    previousVisaRefusals: values.previousVisaRefusals,
    previousVisaRefusalDetails: values.previousVisaRefusalDetails ?? "",
    schengenVisasHeld: values.schengenVisasHeld ?? "",
    hotelReservationAvailable: values.hotelReservationAvailable,
    flightReservationAvailable: values.flightReservationAvailable,
    sponsorInformation: values.sponsorInformation ?? "",
    familyTiesHomeCountry: values.familyTiesHomeCountry ?? "",
    reasonToReturn: values.reasonToReturn ?? "",
    consultantNotes: values.consultantNotes ?? "",
    additionalNotes: values.additionalNotes ?? "",
  };
}
