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
          <CardTitle className="text-base">
            {tForm("personal.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow
            label={tForm("personal.fullName")}
            value={applicant.full_name}
          />
          <InfoRow
            label={tForm("personal.nationality")}
            value={applicant.nationality}
          />
          <InfoRow
            label={tForm("personal.gender")}
            value={getGenderLabel(applicant.gender)}
          />
          <InfoRow
            label={tForm("personal.dateOfBirth")}
            value={
              applicant.date_of_birth
                ? format(new Date(applicant.date_of_birth), "MMM d, yyyy")
                : null
            }
          />
          <InfoRow
            label={tForm("personal.placeOfBirth")}
            value={applicant.place_of_birth}
          />
          <InfoRow
            label={tForm("personal.maritalStatus")}
            value={getMaritalStatusLabel(applicant.marital_status)}
          />
          <InfoRow
            label={tForm("personal.occupation")}
            value={applicant.occupation}
          />
          <InfoRow
            label={tForm("personal.employer")}
            value={applicant.employer}
          />
          <InfoRow label={tForm("personal.phone")} value={applicant.phone} />
          <InfoRow label={tForm("personal.email")} value={applicant.email} />
          <InfoRow label={tForm("personal.city")} value={applicant.city} />
          <InfoRow
            label={tForm("personal.hasBankAccount")}
            value={
              applicant.has_bank_account !== undefined &&
              applicant.has_bank_account !== null
                ? applicant.has_bank_account
                  ? t("values.yes")
                  : t("values.no")
                : null
            }
          />
          <div className="col-span-2 sm:col-span-3">
            <InfoRow
              label={tForm("personal.homeAddress")}
              value={applicant.home_address}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tForm("passport.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow
            label={tForm("passport.number")}
            value={applicant.passport_number}
          />
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
            <CardTitle className="text-base">
              {tForm("sponsor.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow
              label={tForm("sponsor.name")}
              value={applicant.sponsor_name}
            />
            <InfoRow
              label={tForm("sponsor.relationship")}
              value={applicant.sponsor_relationship}
            />
            <InfoRow
              label={tForm("sponsor.phone")}
              value={applicant.sponsor_phone}
            />
            <div className="col-span-2 sm:col-span-3">
              <InfoRow
                label={tForm("sponsor.address")}
                value={applicant.sponsor_address}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {(applicant.insurance_company || applicant.insurance_number) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {tForm("insurance.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow
              label={tForm("insurance.company")}
              value={applicant.insurance_company}
            />
            <InfoRow
              label={tForm("insurance.policyNumber")}
              value={applicant.insurance_number}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
