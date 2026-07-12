import { cookies } from "next/headers";
import NewApplicantClient from "./new-applicant-client";

export default async function NewApplicantPage() {
  const cookieStore = await cookies();
  const hasDashboardAccess = cookieStore.get("app_auth")?.value === "1";

  return <NewApplicantClient hasDashboardAccess={hasDashboardAccess} />;
}
