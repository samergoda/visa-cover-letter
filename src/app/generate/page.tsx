"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ClientInfoForm } from "@/components/forms/client-info-form";
import { LetterPreview } from "@/components/letter/letter-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clientFormSchema,
  defaultClientFormValues,
  toClientInformation,
  type ClientFormValues,
} from "@/schemas/client-form";
import { getHistoryItem, getSelectedModel, saveToHistory } from "@/lib/storage";
import { copyToClipboard, exportToDocx, exportToPdf } from "@/lib/export";
import type { ClientInformation, GeneratedLetter } from "@/types";

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout
          title="Generate Cover Letter"
          description="Enter client details and create a professional embassy-ready cover letter."
        >
          <p className="text-sm text-muted-foreground">Loading...</p>
        </DashboardLayout>
      }
    >
      <GeneratePageContent />
    </Suspense>
  );
}

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultClientFormValues,
  });

  const [letterContent, setLetterContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastClient, setLastClient] = useState<ClientInformation | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);

  useEffect(() => {
    void fetch("/api/config")
      .then((res) => res.json())
      .then((data: { apiKeyConfigured?: boolean }) => {
        setApiKeyConfigured(Boolean(data.apiKeyConfigured));
      })
      .catch(() => setApiKeyConfigured(false));
  }, []);

  useEffect(() => {
    const historyId = searchParams.get("historyId");
    if (!historyId) return;

    const item = getHistoryItem(historyId);
    if (!item) {
      toast.error("History item not found");
      return;
    }

    setLetterContent(item.content);
    if (item.client) {
      setLastClient(item.client);
      form.reset({
        ...defaultClientFormValues,
        ...item.client,
      });
    } else {
      setLastClient({
        ...toClientInformation(defaultClientFormValues),
        fullName: item.clientName,
        destinationCountry: item.destinationCountry,
      });
    }
  }, [searchParams, form]);

  const generateLetter = useCallback(
    async (values: ClientFormValues | ClientInformation, isRegenerate = false) => {
      if (!apiKeyConfigured) {
        toast.error("OpenRouter API key is not configured. Set OPENROUTER_API_KEY in .env.local");
        return;
      }

      const client =
        "consultantNotes" in values &&
        !("resolver" in values) &&
        (values as ClientInformation).passportNumber?.trim()
          ? (values as ClientInformation)
          : toClientInformation(values as ClientFormValues);

      setLastClient(client);

      if (isRegenerate) {
        setIsRegenerating(true);
      } else {
        setIsGenerating(true);
      }

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client,
            model: getSelectedModel(),
          }),
        });

        const data = (await response.json()) as {
          content?: string;
          model?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to generate cover letter");
        }

        const content = data.content ?? "";
        setLetterContent(content);

        const historyEntry: GeneratedLetter = {
          id: crypto.randomUUID(),
          clientName: client.fullName,
          destinationCountry: client.destinationCountry,
          content,
          model: data.model ?? getSelectedModel(),
          createdAt: new Date().toISOString(),
          client,
        };

        saveToHistory(historyEntry);

        toast.success(isRegenerate ? "Cover letter regenerated" : "Cover letter generated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Generation failed");
      } finally {
        setIsGenerating(false);
        setIsRegenerating(false);
      }
    },
    [apiKeyConfigured]
  );

  const onSubmit = form.handleSubmit((values) => generateLetter(values));

  const handleRegenerate = () => {
    if (lastClient) {
      void generateLetter(lastClient, true);
      return;
    }

    void form.handleSubmit((values) => generateLetter(values, true))();
  };

  const handleCopy = async () => {
    if (!letterContent) return;

    try {
      await copyToClipboard(letterContent);
      toast.success("Cover letter copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleExportDocx = async () => {
    if (!letterContent || !lastClient) return;

    try {
      await exportToDocx(letterContent, lastClient.fullName, lastClient.destinationCountry);
      toast.success("DOCX downloaded");
    } catch {
      toast.error("Failed to export DOCX");
    }
  };

  const handleExportPdf = () => {
    if (!letterContent || !lastClient) return;

    try {
      exportToPdf(letterContent, lastClient.fullName, lastClient.destinationCountry);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <DashboardLayout
      title="Generate Cover Letter"
      description="Enter client details and create a professional embassy-ready cover letter."
    >
      {!apiKeyConfigured ? (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="text-sm">
              <p className="font-medium text-destructive">OpenRouter API key not configured</p>
              <p className="mt-1 text-muted-foreground">
                Add <code className="rounded bg-muted px-1">OPENROUTER_API_KEY</code> to your{" "}
                <code className="rounded bg-muted px-1">.env.local</code> file and restart the
                server. Check Settings for status.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-6">
            <ClientInfoForm />
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isGenerating || !apiKeyConfigured}
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-pulse" : ""}`} />
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </div>

          <LetterPreview
            content={letterContent}
            clientName={lastClient?.fullName ?? form.watch("fullName")}
            destinationCountry={lastClient?.destinationCountry ?? form.watch("destinationCountry")}
            isLoading={isGenerating}
            isRegenerating={isRegenerating}
            onContentChange={setLetterContent}
            onCopy={() => void handleCopy()}
            onRegenerate={handleRegenerate}
            onExportDocx={() => void handleExportDocx()}
            onExportPdf={handleExportPdf}
          />
        </form>
      </FormProvider>
    </DashboardLayout>
  );
}
