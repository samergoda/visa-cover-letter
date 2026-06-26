import type { ClientInformation } from "@/types";

function formatDate(date: string): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function formatValue(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function appendSection(
  sections: string[],
  title: string,
  fields: (string | null | false)[]
): void {
  const lines = fields.filter((field): field is string => Boolean(field));
  if (lines.length > 0) {
    sections.push("", title, ...lines);
  }
}

export function buildCoverLetterPrompt(client: ClientInformation): string {
  const sections: string[] = [
    "You are a professional visa consultant. Write a formal embassy-ready cover letter in English.",
    "",
    "STRICT FORMATTING RULES — follow these exactly:",
    "- Output plain prose paragraphs only. No bullet points, no numbered lists, no asterisks (*), no dashes used as list markers.",
    "- Do NOT use double quotation marks (\") anywhere in the letter.",
    "- Do NOT use markdown syntax (no **, no __, no #, no >, no backticks).",
    "- Do NOT start any line or sentence with an asterisk (*) or a dash (-).",
    "- Separate paragraphs with a single blank line.",
    "- Keep the letter between 280 and 450 words.",
    "",
    "STRICT CONTENT RULES:",
    "- Use ONLY the client data provided below. Never invent, assume, or add information not explicitly given.",
    "- If a field is missing or empty, omit that topic entirely. Do not leave blank placeholders.",
    "- Use professional, natural, and respectful language suitable for embassy submission.",
    "- Clearly state the purpose of travel and visa type when provided.",
    "- Mention employment details when provided.",
    "- Mention financial capability and who funds the trip when provided.",
    "- Mention travel history and home-country ties when provided.",
    "- Mention host, itinerary, and reservations when provided.",
    "- Include passport details and travel dates when relevant.",
    "- Consultant notes are internal guidance from the visa agency — use them to emphasize relevant points, but do not quote them directly or mention the agency's internal notes.",
    "- Output only the cover letter text, starting with a formal salutation and ending with a respectful closing and full signature using the applicant's full name.",
    "",
    "CLIENT DATA:",
    `Full Name: ${client.fullName}`,
    `Passport Number: ${client.passportNumber}`,
    `Nationality: ${client.nationality}`,
    `Date of Birth: ${formatDate(client.dateOfBirth)}`,
    `Marital Status: ${client.maritalStatus}`,
  ];

  appendSection(sections, "CONTACT & RESIDENCE:", [
    formatValue(client.email) && `Email: ${client.email}`,
    formatValue(client.phone) && `Phone: ${client.phone}`,
    formatValue(client.currentAddress) &&
      `Current Address: ${client.currentAddress}`,
    formatValue(client.cityOfResidence) &&
      `City of Residence: ${client.cityOfResidence}`,
    formatValue(client.passportIssueDate) &&
      `Passport Issue Date: ${formatDate(client.passportIssueDate)}`,
    formatValue(client.passportExpiryDate) &&
      `Passport Expiry Date: ${formatDate(client.passportExpiryDate)}`,
  ]);

  appendSection(sections, "TRAVEL:", [
    `Destination Country: ${client.destinationCountry}`,
    `Purpose of Travel: ${client.purposeOfTravel}`,
    formatValue(client.visaType) && `Visa Type: ${client.visaType}`,
    formatValue(client.embassyCity) &&
      `Embassy/Consulate: ${client.embassyCity}`,
    formatValue(client.numberOfEntries) &&
      `Number of Entries: ${client.numberOfEntries}`,
    `Travel Start Date: ${formatDate(client.travelStartDate)}`,
    `Travel End Date: ${formatDate(client.travelEndDate)}`,
    `Duration: ${client.duration}`,
    formatValue(client.hostName) && `Host/Inviting Party: ${client.hostName}`,
    formatValue(client.hostAddress) && `Host Address: ${client.hostAddress}`,
    formatValue(client.itinerary) && `Itinerary: ${client.itinerary}`,
  ]);

  appendSection(sections, "EMPLOYMENT:", [
    formatValue(client.occupation) && `Occupation: ${client.occupation}`,
    formatValue(client.employerName) && `Employer: ${client.employerName}`,
    formatValue(client.employerAddress) &&
      `Employer Address: ${client.employerAddress}`,
    formatValue(client.employmentType) &&
      `Employment Type: ${client.employmentType}`,
    formatValue(client.monthlySalary) &&
      `Monthly Salary: ${client.monthlySalary}`,
    formatValue(client.annualIncome) &&
      `Annual Income: ${client.annualIncome}`,
    formatValue(client.employmentStartDate) &&
      `Employment Start Date: ${formatDate(client.employmentStartDate)}`,
  ]);

  appendSection(sections, "FINANCIAL:", [
    formatValue(client.bankBalance) && `Bank Balance: ${client.bankBalance}`,
    formatValue(client.tripFundedBy) &&
      `Trip Funded By: ${client.tripFundedBy}`,
    `Travel Insurance Available: ${client.travelInsuranceAvailable ? "Yes" : "No"}`,
    formatValue(client.otherAssets) && `Other Assets: ${client.otherAssets}`,
  ]);

  appendSection(sections, "TRAVEL HISTORY:", [
    `Previous Visas: ${client.previousVisas ? "Yes" : "No"}`,
    formatValue(client.countriesVisited) &&
      `Countries Visited: ${client.countriesVisited}`,
    formatValue(client.schengenVisasHeld) &&
      `Schengen Visas Held: ${client.schengenVisasHeld}`,
    `Previous Visa Refusals: ${client.previousVisaRefusals ? "Yes" : "No"}`,
    client.previousVisaRefusals &&
      formatValue(client.previousVisaRefusalDetails) &&
      `Refusal Details: ${client.previousVisaRefusalDetails}`,
  ]);

  appendSection(sections, "RESERVATIONS & SPONSORSHIP:", [
    `Hotel Reservation Available: ${client.hotelReservationAvailable ? "Yes" : "No"}`,
    `Flight Reservation Available: ${client.flightReservationAvailable ? "Yes" : "No"}`,
    formatValue(client.sponsorInformation) &&
      `Sponsor Information: ${client.sponsorInformation}`,
  ]);

  appendSection(sections, "HOME COUNTRY TIES:", [
    formatValue(client.familyTiesHomeCountry) &&
      `Family Ties: ${client.familyTiesHomeCountry}`,
    formatValue(client.reasonToReturn) &&
      `Reason to Return: ${client.reasonToReturn}`,
  ]);

  if (formatValue(client.consultantNotes)) {
    sections.push("", `CONSULTANT GUIDANCE: ${client.consultantNotes}`);
  }

  if (formatValue(client.additionalNotes)) {
    sections.push("", `Additional Notes: ${client.additionalNotes}`);
  }

  return sections.join("\n");
}
