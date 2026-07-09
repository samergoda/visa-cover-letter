"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations("Sidebar");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64">
        <header className="sticky top-0 z-30 border-b bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground lg:hidden shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={t("openMenu")}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-1">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
