"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FileText, History, Settings, Plane, Users, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    labelKey: "visaManagement",
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
      { href: "/applicants", labelKey: "applicants", icon: Users },
    ],
  },
  {
    labelKey: "coverLetters",
    items: [
      { href: "/generate", labelKey: "generateLetter", icon: FileText },
      { href: "/history", labelKey: "history", icon: History },
    ],
  },
  {
    labelKey: "system",
    items: [
      { href: "/admin/settings", labelKey: "generalSettings", icon: Settings },
      { href: "/settings", labelKey: "aiSettings", icon: Settings },
    ],
  },
] as const;

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("Sidebar");

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={handleClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:fixed lg:inset-y-0 lg:w-64 lg:translate-x-0 lg:z-30",
          // LTR positioning
          "left-0 border-r",
          // RTL positioning
          "rtl:left-auto rtl:right-0 rtl:border-r-0 rtl:border-l",
          // Toggle states
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          "overflow-y-auto"
        )}
      >
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{t("visaPro")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("appManagement")}</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            aria-label={t("closeMenu")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-4 p-3">
          {navSections.map((section) => (
            <div key={section.labelKey}>
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(section.labelKey)}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/applicants"
                      ? pathname === "/applicants" ||
                        (pathname.startsWith("/applicants/") && pathname !== "/applicants/new")
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {t(item.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto hidden border-t p-4 text-xs text-muted-foreground lg:block">
          {t("footer")}
        </div>
      </aside>
    </>
  );
}
