import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ApplicantsClient from "./applicants-client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ApplicantsPage" });

  return {
    title: `${t("title")} | VisaApp`,
    description:
      locale === "ar"
        ? "إدارة طلبات المتقدمين وتتبع حالة التأشيرة والوثائق وقائمة المهام بنظام إدارة طلبات التأشيرات."
        : "Manage applicant profiles, view visa application progress, checklist status, and coordinate documents in the Application Management System.",
  };
}

export default function Page() {
  return <ApplicantsClient />;
}
