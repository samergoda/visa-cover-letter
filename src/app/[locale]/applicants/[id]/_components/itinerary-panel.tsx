"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Wand2, RefreshCw, Download, FileDown, Save, Calendar, AlertTriangle } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { jsPDF } from "jspdf";
import { type Applicant, type ItineraryDay } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ItineraryPanelProps {
  applicant: Applicant;
}

export function ItineraryPanel({ applicant }: ItineraryPanelProps) {
  const t = useTranslations("ApplicantProfile.itinerary");
  const queryClient = useQueryClient();

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with applicant data when it loads/changes
  useEffect(() => {
    if (applicant.travel_itinerary) {
      setItinerary(applicant.travel_itinerary);
    } else {
      setItinerary([]);
    }
  }, [applicant.travel_itinerary]);

  const handleGenerate = async () => {
    if (!applicant.arrival_date || !applicant.departure_date) {
      toast.error(t("noTravelDates"));
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`/api/applicants/${applicant.id}/itinerary`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate itinerary");
      }

      setItinerary(data.itinerary);
      toast.success("Itinerary generated successfully!");

      // Invalidate queries to refresh parent state
      void queryClient.invalidateQueries({ queryKey: ["applicant", applicant.id] });
      void queryClient.invalidateQueries({ queryKey: ["applicant-activity", applicant.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate itinerary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivityChange = (index: number, newActivities: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], activities: newActivities };
    setItinerary(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/applicants/${applicant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travel_itinerary: itinerary }),
      });

      if (!res.ok) {
        throw new Error("Failed to save changes");
      }

      toast.success(t("save") + " success!");
      void queryClient.invalidateQueries({ queryKey: ["applicant", applicant.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save itinerary");
    } finally {
      setIsSaving(false);
    }
  };

  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9-_]/gi, "_").replace(/_+/g, "_") || "itinerary";
  };

  const handleExportPdf = () => {
    if (!itinerary.length) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Detailed Travel Itinerary", pageWidth / 2, y, { align: "center" });
      y += 10;

      // Metadata
      doc.setFontSize(11);
      doc.text(`Applicant: ${applicant.full_name}`, margin, y);
      y += 6;
      doc.setFont("helvetica", "italic");
      doc.text(`Destination: ${applicant.destination_country}`, margin, y);
      y += 6;
      if (applicant.arrival_date && applicant.departure_date) {
        doc.text(
          `Period: ${applicant.arrival_date} to ${applicant.departure_date} (${applicant.duration_of_stay} days)`,
          margin,
          y
        );
      }
      y += 12;

      // Itinerary Days
      doc.setFont("helvetica", "normal");

      for (const day of itinerary) {
        if (y > doc.internal.pageSize.getHeight() - margin - 30) {
          doc.addPage();
          y = margin;
        }

        // Day Heading
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Day ${day.day} - ${day.date}`, margin, y);
        y += 6;

        // Day Activities
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(day.activities, maxWidth);

        for (const line of lines) {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 5;
        }

        y += 6; // Spacing between days
      }

      const filename = `${sanitizeFilename(applicant.full_name)}_travel_itinerary.pdf`;
      doc.save(filename);
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const handleExportDocx = async () => {
    if (!itinerary.length) return;

    try {
      const docElements = [
        new Paragraph({
          text: "Detailed Travel Itinerary",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Applicant: `, bold: true }),
            new TextRun({ text: applicant.full_name }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Destination: `, bold: true }),
            new TextRun({ text: applicant.destination_country, italics: true }),
          ],
          spacing: { after: 120 },
        }),
      ];

      if (applicant.arrival_date && applicant.departure_date) {
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Period: `, bold: true }),
              new TextRun({
                text: `${applicant.arrival_date} to ${applicant.departure_date} (${applicant.duration_of_stay} days)`,
              }),
            ],
            spacing: { after: 360 },
          })
        );
      }

      // Add Days
      for (const day of itinerary) {
        docElements.push(
          new Paragraph({
            children: [new TextRun({ text: `Day ${day.day} (${day.date})`, bold: true, size: 26 })],
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            children: [new TextRun({ text: day.activities, size: 22 })],
            spacing: { after: 240 },
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docElements,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const filename = `${sanitizeFilename(applicant.full_name)}_travel_itinerary.docx`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success("DOCX downloaded successfully!");
    } catch {
      toast.error("Failed to export DOCX");
    }
  };

  const hasTravelDates = !!(applicant.arrival_date && applicant.departure_date);

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 bg-muted/30">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t("title")}
          </CardTitle>
          <CardDescription className="mt-1 text-xs">{t("description")}</CardDescription>
        </div>

        {itinerary.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || isGenerating}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {isSaving ? t("saving") : t("save")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating || isSaving}
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              {t("regenerate")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportDocx}
              disabled={isGenerating || isSaving}
            >
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
              {t("docx")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPdf}
              disabled={isGenerating || isSaving}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {t("pdf")}
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isGenerating && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="animate-spin h-4 w-4" />
              {t("generating")}
            </div>
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {itinerary.length === 0 && !isGenerating && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Wand2 className="h-12 w-12 opacity-25" />
            <p className="text-sm font-medium">{t("empty")}</p>

            {!hasTravelDates ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md mt-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("noTravelDates")}
              </div>
            ) : (
              <Button onClick={handleGenerate} className="mt-2">
                <Wand2 className="mr-1.5 h-4 w-4" />
                {t("generate")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Itinerary Day-by-Day Editor */}
      {itinerary.length > 0 && !isGenerating && (
        <div className="space-y-4">
          {itinerary.map((day, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/10">
                <span className="text-sm font-semibold text-primary">
                  {t("dayLabel", { day: day.day })}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{day.date}</span>
              </div>
              <CardContent className="p-4">
                <Textarea
                  value={day.activities}
                  onChange={(e) => handleActivityChange(idx, e.target.value)}
                  placeholder={t("notesPlaceholder")}
                  rows={3}
                  className="resize-y text-sm leading-relaxed"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
