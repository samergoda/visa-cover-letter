import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from "docx";
import { jsPDF } from "jspdf";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9-_]/gi, "_").replace(/_+/g, "_") || "cover_letter";
}

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function exportToDocx(
  content: string,
  clientName: string,
  destinationCountry: string
): Promise<void> {
  const paragraphs = splitParagraphs(content).map(
    (text) =>
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 24,
          }),
        ],
        spacing: { after: 240, line: 360 },
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Visa Cover Letter",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Applicant: ${clientName}`,
                bold: true,
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Destination: ${destinationCountry}`,
                italics: true,
              }),
            ],
            spacing: { after: 360 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(
    blob,
    `${sanitizeFilename(clientName)}_${sanitizeFilename(destinationCountry)}_cover_letter.docx`
  );
}

export function exportToPdf(
  content: string,
  clientName: string,
  destinationCountry: string
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Visa Cover Letter", pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(11);
  doc.text(`Applicant: ${clientName}`, margin, y);
  y += 6;
  doc.setFont("helvetica", "italic");
  doc.text(`Destination: ${destinationCountry}`, margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const paragraphs = splitParagraphs(content);

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, maxWidth);

    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 6;
    }

    y += 4;
  }

  doc.save(
    `${sanitizeFilename(clientName)}_${sanitizeFilename(destinationCountry)}_cover_letter.pdf`
  );
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}
