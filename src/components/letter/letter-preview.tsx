"use client";

import {
  Copy,
  Download,
  FileDown,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface LetterPreviewProps {
  content: string;
  clientName: string;
  destinationCountry: string;
  isLoading: boolean;
  isRegenerating: boolean;
  onContentChange: (value: string) => void;
  onCopy: () => void;
  onRegenerate: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
}

export function LetterPreview({
  content,
  clientName,
  destinationCountry,
  isLoading,
  isRegenerating,
  onContentChange,
  onCopy,
  onRegenerate,
  onExportDocx,
  onExportPdf,
}: LetterPreviewProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Letter Preview</CardTitle>
            <CardDescription>
              Review, edit, and export the generated cover letter.
            </CardDescription>
          </div>
          {content ? (
            <Badge variant="secondary">{wordCount} words</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(event) => onContentChange(event.target.value)}
            placeholder="Your generated cover letter will appear here..."
            className="min-h-[420px] resize-y font-serif leading-relaxed"
          />
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCopy}
            disabled={!content || isLoading}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            disabled={isLoading || isRegenerating}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
            />
            Regenerate
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExportDocx}
            disabled={!content || isLoading}
          >
            <FileDown className="h-4 w-4" />
            DOCX
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onExportPdf}
            disabled={!content || isLoading}
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>

        {clientName && destinationCountry ? (
          <p className="text-xs text-muted-foreground">
            Applicant: {clientName} · Destination: {destinationCountry}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
