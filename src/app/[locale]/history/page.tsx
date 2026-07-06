"use client";

import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearHistory, deleteFromHistory } from "@/lib/storage";
import { useHistory } from "@/hooks/use-api";
import { useQueryClient } from "@tanstack/react-query";

export default function HistoryPage() {
  const t = useTranslations("HistoryPage");
  const queryClient = useQueryClient();
  const { data: history = [], isLoading } = useHistory();

  const invalidateHistory = () => {
    void queryClient.invalidateQueries({ queryKey: ["history"] });
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    invalidateHistory();
    toast.success(t("toasts.removed"));
  };

  const handleClearAll = () => {
    clearHistory();
    invalidateHistory();
    toast.success(t("toasts.cleared"));
  };

  return (
    <DashboardLayout title={t("title")} description={t("description")}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Badge variant="secondary">{t("savedLetters", { count: history.length })}</Badge>
        {history.length > 0 ? (
          <Button variant="outline" onClick={handleClearAll}>
            {t("clearAll")}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {t("loading")}
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("noLettersTitle")}</CardTitle>
            <CardDescription>{t("noLettersDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/generate">{t("generateFirst")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold">{item.clientName}</p>
                  <p className="text-sm text-muted-foreground">{item.destinationCountry}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "PPP p")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/generate?historyId=${item.id}`}>
                      <Eye className="h-4 w-4" />
                      {t("view")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                    {t("delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
