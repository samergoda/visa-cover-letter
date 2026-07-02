"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Plane } from "lucide-react";
import { ApplicantForm } from "@/components/applicants/applicant-form";
import { Button } from "@/components/ui/button";
import type { ApplicantFormValues } from "@/schemas/applicant-form";

export default function NewApplicantPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState<string>("");

  const handleSubmit = async (values: ApplicantFormValues) => {
    setIsSubmitting(true);
    try {
      // Strip empty strings before sending
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        if (value !== "" && value !== null && value !== undefined) {
          payload[key] = value;
        }
      }

      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Failed to submit application");
        return;
      }

      // Show a short reference from the UUID
      setRefNumber((data.id ?? "").slice(0, 8).toUpperCase());
      setSubmitted(true);
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Visa Pro</p>
            <p className="text-xs text-muted-foreground">Schengen Visa Application</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Application Submitted</h1>
              <p className="text-muted-foreground">
                Your visa application has been received and will be reviewed shortly.
              </p>
              {refNumber && (
                <p className="text-sm text-muted-foreground">
                  Reference number:{" "}
                  <span className="font-mono font-semibold text-foreground">{refNumber}</span>
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setRefNumber("");
              }}
            >
              Submit Another Application
            </Button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Visa Application Form</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in all required fields. Fields marked with{" "}
                <span className="text-destructive">*</span> are mandatory.
              </p>
            </div>
            <ApplicantForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Submit Application"
              type="new"
            />
          </>
        )}
      </main>
    </div>
  );
}
