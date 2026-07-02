import ExcelJS from "exceljs";
import type { Applicant, ApplicantChecklist } from "@/types";
import { format } from "date-fns";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return format(new Date(dateStr), "yyyy-MM-dd");
  } catch {
    return dateStr;
  }
}

export async function exportApplicantsToExcel(
  applicants: Applicant[],
  checklistsMap?: Record<string, ApplicantChecklist[]>
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Visa Management System";
  workbook.created = new Date();

  // ──────────────────────────────────────────────────────────
  // Sheet 1: Applicant Information
  // ──────────────────────────────────────────────────────────
  const sheet = workbook.addWorksheet("Applicants");

  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" } },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E40AF" },
    },
    alignment: { vertical: "middle", horizontal: "center" },
    border: {
      bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
    },
  };

  const columns: Partial<ExcelJS.Column>[] = [
    { header: "Full Name", key: "full_name", width: 22 },
    { header: "Passport Number", key: "passport_number", width: 18 },
    { header: "Nationality", key: "nationality", width: 16 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Date of Birth", key: "date_of_birth", width: 14 },
    { header: "Place of Birth", key: "place_of_birth", width: 18 },
    { header: "Marital Status", key: "marital_status", width: 14 },
    { header: "Occupation", key: "occupation", width: 18 },
    { header: "Employer", key: "employer", width: 18 },
    { header: "Phone", key: "phone", width: 16 },
    { header: "Email", key: "email", width: 24 },
    { header: "Home Address", key: "home_address", width: 30 },
    { header: "Passport Issue Date", key: "passport_issue_date", width: 18 },
    { header: "Passport Expiry Date", key: "passport_expiry_date", width: 18 },
    { header: "Passport Issuing Country", key: "passport_issuing_country", width: 20 },
    { header: "Destination Country", key: "destination_country", width: 18 },
    { header: "Entry Country", key: "entry_country", width: 16 },
    { header: "Purpose of Travel", key: "purpose_of_travel", width: 22 },
    { header: "Arrival Date", key: "arrival_date", width: 14 },
    { header: "Departure Date", key: "departure_date", width: 14 },
    { header: "Number of Entries", key: "number_of_entries", width: 16 },
    { header: "Duration of Stay (days)", key: "duration_of_stay", width: 20 },
    { header: "Hotel Name", key: "hotel_name", width: 20 },
    { header: "Hotel Address", key: "hotel_address", width: 28 },
    { header: "Insurance Company", key: "insurance_company", width: 20 },
    { header: "Insurance Number", key: "insurance_number", width: 18 },
    { header: "Sponsor Name", key: "sponsor_name", width: 18 },
    { header: "Sponsor Relationship", key: "sponsor_relationship", width: 20 },
    { header: "Visa Status", key: "visa_status", width: 20 },
    { header: "Assigned Employee", key: "assigned_employee", width: 20 },
    { header: "Progress %", key: "progress_percentage", width: 12 },
    { header: "Created Date", key: "created_at", width: 18 },
    { header: "Last Updated", key: "updated_at", width: 18 },
  ];

  sheet.columns = columns as ExcelJS.Column[];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // Add data rows
  for (const applicant of applicants) {
    const row = sheet.addRow({
      full_name: applicant.full_name,
      passport_number: applicant.passport_number ?? "",
      nationality: applicant.nationality,
      gender: applicant.gender ?? "",
      date_of_birth: formatDate(applicant.date_of_birth),
      place_of_birth: applicant.place_of_birth ?? "",
      marital_status: applicant.marital_status ?? "",
      occupation: applicant.occupation ?? "",
      employer: applicant.employer ?? "",
      phone: applicant.phone ?? "",
      email: applicant.email ?? "",
      home_address: applicant.home_address ?? "",
      passport_issue_date: formatDate(applicant.passport_issue_date),
      passport_expiry_date: formatDate(applicant.passport_expiry_date),
      passport_issuing_country: applicant.passport_issuing_country ?? "",
      destination_country: applicant.destination_country,
      entry_country: applicant.entry_country ?? "",
      purpose_of_travel: applicant.purpose_of_travel ?? "",
      arrival_date: formatDate(applicant.arrival_date),
      departure_date: formatDate(applicant.departure_date),
      number_of_entries: applicant.number_of_entries ?? "",
      duration_of_stay: applicant.duration_of_stay ?? "",
      hotel_name: applicant.hotel_name ?? "",
      hotel_address: applicant.hotel_address ?? "",
      insurance_company: applicant.insurance_company ?? "",
      insurance_number: applicant.insurance_number ?? "",
      sponsor_name: applicant.sponsor_name ?? "",
      sponsor_relationship: applicant.sponsor_relationship ?? "",
      visa_status: applicant.visa_status?.name ?? "",
      assigned_employee: applicant.assigned_employee ?? "",
      progress_percentage: applicant.progress_percentage,
      created_at: formatDate(applicant.created_at),
      updated_at: formatDate(applicant.updated_at),
    });

    // Alternate row coloring
    if (row.number % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  // Sheet 2: Checklist Progress (if available)
  // ──────────────────────────────────────────────────────────
  if (checklistsMap) {
    const clSheet = workbook.addWorksheet("Checklist Progress");
    clSheet.columns = [
      { header: "Applicant Name", key: "name", width: 22 },
      { header: "Checklist Item", key: "item", width: 30 },
      { header: "Completed", key: "completed", width: 12 },
      { header: "Completed By", key: "completed_by", width: 18 },
      { header: "Completed Date", key: "completed_at", width: 16 },
      { header: "Notes", key: "notes", width: 40 },
    ];

    const clHeader = clSheet.getRow(1);
    clHeader.height = 24;
    clHeader.eachCell((cell) => Object.assign(cell, headerStyle));

    for (const applicant of applicants) {
      const checklists = checklistsMap[applicant.id] ?? [];
      for (const item of checklists) {
        clSheet.addRow({
          name: applicant.full_name,
          item: item.template?.name ?? "",
          completed: item.is_completed ? "Yes" : "No",
          completed_by: item.completed_by ?? "",
          completed_at: formatDate(item.completed_at ?? undefined),
          notes: item.notes ?? "",
        });
      }
    }
  }

  // Serialize
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
