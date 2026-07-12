import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { type Applicant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./info-row";

export function PersonalInfoTab({ applicant }: { applicant: Applicant }) {
  const t = useTranslations("ApplicantProfile");
  const tForm = useTranslations("ApplicantForm");

  const getGenderLabel = (gender?: string | null) => {
    if (!gender) return null;
    const key = `gender.${gender.toLowerCase()}`;
    return t.has(key) ? t(key) : gender;
  };

  const getMaritalStatusLabel = (status?: string | null) => {
    if (!status) return null;
    const key = `maritalStatus.${status.toLowerCase()}`;
    return t.has(key) ? t(key) : status;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tForm("personal.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label={tForm("personal.fullName")} value={applicant.full_name} />
          <InfoRow label={tForm("personal.nationality")} value={applicant.nationality} />
          <InfoRow label={tForm("personal.gender")} value={getGenderLabel(applicant.gender)} />
          <InfoRow
            label={tForm("personal.dateOfBirth")}
            value={
              applicant.date_of_birth
                ? format(new Date(applicant.date_of_birth), "MMM d, yyyy")
                : null
            }
          />
          <InfoRow label={tForm("personal.placeOfBirth")} value={applicant.place_of_birth} />
          <InfoRow
            label={tForm("personal.maritalStatus")}
            value={getMaritalStatusLabel(applicant.marital_status)}
          />
          <InfoRow label={tForm("personal.occupation")} value={applicant.occupation} />
          <InfoRow label={tForm("personal.employer")} value={applicant.employer} />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              {tForm("personal.phone")}
            </span>
            <div className="text-sm font-medium text-foreground min-h-[20px] flex items-center gap-1.5">
              {applicant.phone ? (
                <>
                  <span>{applicant.phone}</span>
                  <a
                    href={`https://wa.me/${applicant.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <svg
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                    </svg>
                  </a>
                </>
              ) : (
                <span className="italic text-muted-foreground/45 font-normal">—</span>
              )}
            </div>
          </div>
          <InfoRow label={tForm("personal.email")} value={applicant.email} />
          <InfoRow label={tForm("personal.city")} value={applicant.city} />
          <InfoRow
            label={tForm("personal.hasBankAccount")}
            value={
              applicant.has_bank_account !== undefined && applicant.has_bank_account !== null
                ? applicant.has_bank_account
                  ? t("values.yes")
                  : t("values.no")
                : null
            }
          />
          <div className="col-span-2 sm:col-span-3">
            <InfoRow label={tForm("personal.homeAddress")} value={applicant.home_address} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tForm("passport.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow label={tForm("passport.number")} value={applicant.passport_number} />
          <InfoRow
            label={tForm("passport.issuingCountry")}
            value={applicant.passport_issuing_country}
          />
          <InfoRow
            label={tForm("passport.issueDate")}
            value={
              applicant.passport_issue_date
                ? format(new Date(applicant.passport_issue_date), "MMM d, yyyy")
                : null
            }
          />
          <InfoRow
            label={tForm("passport.expiryDate")}
            value={
              applicant.passport_expiry_date
                ? format(new Date(applicant.passport_expiry_date), "MMM d, yyyy")
                : null
            }
          />
        </CardContent>
      </Card>

      {(applicant.sponsor_name || applicant.sponsor_relationship) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tForm("sponsor.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow label={tForm("sponsor.name")} value={applicant.sponsor_name} />
            <InfoRow label={tForm("sponsor.relationship")} value={applicant.sponsor_relationship} />
            <InfoRow label={tForm("sponsor.phone")} value={applicant.sponsor_phone} />
            <div className="col-span-2 sm:col-span-3">
              <InfoRow label={tForm("sponsor.address")} value={applicant.sponsor_address} />
            </div>
          </CardContent>
        </Card>
      )}

      {(applicant.insurance_company || applicant.insurance_number) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tForm("insurance.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label={tForm("insurance.company")} value={applicant.insurance_company} />
            <InfoRow label={tForm("insurance.policyNumber")} value={applicant.insurance_number} />
          </CardContent>
        </Card>
      )}

      {/* Payment & Cost Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tForm("payment.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow
            label={tForm("payment.totalCost")}
            value={
              applicant.total_cost !== null && applicant.total_cost !== undefined
                ? Number(applicant.total_cost).toFixed(2)
                : "0.00"
            }
          />
          <InfoRow
            label={tForm("payment.amountPaid")}
            value={
              applicant.amount_paid !== null && applicant.amount_paid !== undefined
                ? Number(applicant.amount_paid).toFixed(2)
                : "0.00"
            }
          />
          {/* Balance */}
          {(() => {
            const cost = Number(applicant.total_cost) || 0;
            const paid = Number(applicant.amount_paid) || 0;
            const balance = cost - paid;
            return (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {tForm("payment.balance")}
                </span>
                <span className={`text-sm font-bold tabular-nums ${balance > 0 ? "text-amber-600" : balance < 0 ? "text-emerald-600" : "text-foreground"}`}>
                  {balance.toFixed(2)}
                </span>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
