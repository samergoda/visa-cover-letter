import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { type Applicant } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "./info-row";

export function TravelInfoTab({ applicant }: { applicant: Applicant }) {
  const t = useTranslations("ApplicantProfile");
  const tForm = useTranslations("ApplicantForm");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {tForm("travel.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <InfoRow
          label={tForm("travel.destinationCountry")}
          value={applicant.destination_country}
        />
        <InfoRow
          label={tForm("travel.entryCountry")}
          value={applicant.entry_country}
        />
        <InfoRow
          label={tForm("travel.purpose")}
          value={applicant.purpose_of_travel}
        />
        <InfoRow
          label={tForm("travel.arrivalDate")}
          value={
            applicant.arrival_date
              ? format(new Date(applicant.arrival_date), "MMM d, yyyy")
              : null
          }
        />
        <InfoRow
          label={tForm("travel.departureDate")}
          value={
            applicant.departure_date
              ? format(new Date(applicant.departure_date), "MMM d, yyyy")
              : null
          }
        />
        <InfoRow
          label={tForm("travel.numEntries")}
          value={applicant.number_of_entries}
        />
        <InfoRow
          label={tForm("travel.duration")}
          value={
            applicant.duration_of_stay
              ? `${applicant.duration_of_stay} ${t("values.days")}`
              : null
          }
        />
        <InfoRow
          label={t("hotel.name")}
          value={applicant.hotel_name}
        />
        <div className="col-span-2 sm:col-span-3">
          <InfoRow
            label={t("hotel.address")}
            value={applicant.hotel_address}
          />
        </div>
      </CardContent>
    </Card>
  );
}
