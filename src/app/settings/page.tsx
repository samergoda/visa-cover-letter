"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Save, Server } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSelectedModel, saveSettings } from "@/lib/storage";
import { OPENROUTER_MODELS, type OpenRouterModel } from "@/types";

export default function SettingsPage() {
  const [model, setModel] = useState<OpenRouterModel>("deepseek/deepseek-chat-v3");
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    setModel(getSelectedModel());

    void fetch("/api/config")
      .then((res) => res.json())
      .then((data: { apiKeyConfigured?: boolean }) => {
        setApiKeyConfigured(Boolean(data.apiKeyConfigured));
      })
      .catch(() => setApiKeyConfigured(false));
  }, []);

  const handleSave = () => {
    saveSettings({ model });
    toast.success("Model preference saved");
  };

  return (
    <DashboardLayout
      title="Settings"
      description="Configure the AI model and verify server environment."
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              The OpenRouter API key is read from server environment variables
              and is never stored in the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">OPENROUTER_API_KEY</p>
                <p className="text-xs text-muted-foreground">
                  Set in <code className="rounded bg-muted px-1">.env.local</code>
                </p>
              </div>
              {apiKeyConfigured === null ? (
                <Badge variant="secondary">Checking...</Badge>
              ) : apiKeyConfigured ? (
                <Badge className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Configured
                </Badge>
              ) : (
                <Badge variant="destructive">Not configured</Badge>
              )}
            </div>

            {!apiKeyConfigured && apiKeyConfigured !== null ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Add your key to <code>.env.local</code>:
                <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                  OPENROUTER_API_KEY=sk-or-v1-your-key-here
                </pre>
                Restart the dev server after updating environment variables.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Model</CardTitle>
            <CardDescription>
              Choose the OpenRouter model used for cover letter generation.
              Saved locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={model}
              onValueChange={(value) => setModel(value as OpenRouterModel)}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {OPENROUTER_MODELS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>
              Base URL is configured via{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                NEXT_PUBLIC_OPENROUTER_BASE_URL
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Default: https://openrouter.ai/api/v1
            </p>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4" />
          Save Model Preference
        </Button>
      </div>
    </DashboardLayout>
  );
}
