import { Sidebar } from "@/components/layout/sidebar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function DashboardLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64 rtl:lg:pl-0 rtl:lg:pr-64">
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div>
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
