"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { toast } from "sonner";
import { Eye, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearHistory, deleteFromHistory, getHistory } from "@/lib/storage";
import type { GeneratedLetter } from "@/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<GeneratedLetter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
    setIsLoaded(true);
  }, []);

  const refreshHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    refreshHistory();
    toast.success("Letter removed from history");
  };

  const handleClearAll = () => {
    clearHistory();
    refreshHistory();
    toast.success("History cleared");
  };

  return (
    <DashboardLayout
      title="Letter History"
      description="Previously generated cover letters stored locally in your browser."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Badge variant="secondary">{history.length} saved letters</Badge>
        {history.length > 0 ? (
          <Button variant="outline" onClick={handleClearAll}>
            Clear All
          </Button>
        ) : null}
      </div>

      {!isLoaded ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Loading history...
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No letters yet</CardTitle>
            <CardDescription>
              Generated cover letters will appear here for quick reference.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/generate">Generate your first letter</Link>
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
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
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
