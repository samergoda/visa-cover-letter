"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CheckCircle2, Save, Server } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useApiConfig } from "@/hooks/use-api";

export default function SettingsPage() {
  const t = useTranslations("SettingsPage");
  const [model, setModel] = useState<OpenRouterModel>(() => getSelectedModel());
  const { data: config } = useApiConfig();
  const apiKeyConfigured = config?.apiKeyConfigured ?? null;

  const handleSave = () => {
    saveSettings({ model });
    toast.success(t("toasts.saved"));
  };

  return (
    <DashboardLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t("apiConfigTitle")}
            </CardTitle>
            <CardDescription>
              {t("apiConfigDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">{t("apiKeyLabel")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("apiKeyHint")}
                </p>
              </div>
              {apiKeyConfigured === null ? (
                <Badge variant="secondary">{t("checking")}</Badge>
              ) : apiKeyConfigured ? (
                <Badge className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("configured")}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("notConfigured")}</Badge>
              )}
            </div>

            {!apiKeyConfigured && apiKeyConfigured !== null ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {t("addKeyInstructions")}
                <pre className="mt-2 overflow-x-auto rounded bg-muted p-3 text-xs">
                  OPENROUTER_API_KEY=sk-or-v1-your-key-here
                </pre>
                {t("restartHint")}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("aiModelTitle")}</CardTitle>
            <CardDescription>
              {t("aiModelDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="model">{t("modelLabel")}</Label>
            <Select value={model} onValueChange={(value) => setModel(value as OpenRouterModel)}>
              <SelectTrigger id="model">
                <SelectValue placeholder={t("modelPlaceholder")} />
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
            <CardTitle>{t("environmentTitle")}</CardTitle>
            <CardDescription>
              {t("environmentDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("defaultUrl")}</p>
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4" />
          {t("saveButton")}
        </Button>
      </div>
    </DashboardLayout>
  );
}
