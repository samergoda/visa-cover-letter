import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { RefreshCw, Wand2, Copy, FileDown, Download } from "lucide-react";
import { exportToDocx, exportToPdf, copyToClipboard } from "@/lib/export";
import {
  type Applicant,
  type OpenRouterModel,
  OPENROUTER_MODELS,
  DEFAULT_MODEL,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CoverLetterPanel({ applicant }: { applicant: Applicant }) {
  const t = useTranslations("ApplicantProfile.coverLetter");
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
        toast.error(data.error ?? t("failed"));
        return;
      }
      setLetter(data.content);
      toast.success(t("generated"));
    } catch {
      toast.error(t("failedGeneration"));
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
          <Label>{t("aiModel")}</Label>
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
          <Label>{t("letterTone")}</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">{t("toneStandard")}</SelectItem>
              <SelectItem value="executive">{t("toneExecutive")}</SelectItem>
              <SelectItem value="student">{t("toneStudent")}</SelectItem>
              <SelectItem value="urgent">{t("toneUrgent")}</SelectItem>
              <SelectItem value="family">{t("toneFamily")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              {letter ? t("regenerate") : t("generate")}
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
              <CardTitle className="text-base">{t("generatedTitle")}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{t("words", { count: wordCount })}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await copyToClipboard(letter);
                    toast.success(t("copied"));
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> {t("copy")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportToDocx(letter, applicant.full_name, applicant.destination_country)
                  }
                >
                  <FileDown className="mr-1.5 h-3.5 w-3.5" /> {t("docx")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportToPdf(letter, applicant.full_name, applicant.destination_country)
                  }
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> {t("pdf")}
                </Button>
              </div>
            </div>
            <CardDescription>{t("editHint")}</CardDescription>
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
            {t("emptyTitle")}
          </p>
          <p className="text-xs">
            {t("emptyHint")}
          </p>
        </div>
      )}
    </div>
  );
}
