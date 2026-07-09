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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tForm("travel.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoRow
            label={tForm("travel.destinationCountry")}
            value={applicant.destination_country}
          />
          <InfoRow label={tForm("travel.entryCountry")} value={applicant.entry_country} />
          <InfoRow label={tForm("travel.purpose")} value={applicant.purpose_of_travel} />
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
          <InfoRow label={tForm("travel.numEntries")} value={applicant.number_of_entries} />
          <InfoRow
            label={tForm("travel.duration")}
            value={
              applicant.duration_of_stay
                ? `${applicant.duration_of_stay} ${t("values.days")}`
                : null
            }
          />
          <InfoRow label={t("hotel.name")} value={applicant.hotel_name} />
          <div className="col-span-2 sm:col-span-3">
            <InfoRow label={t("hotel.address")} value={applicant.hotel_address} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("appointment.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {applicant.appointment_date ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoRow
                label={t("appointment.date")}
                value={format(new Date(applicant.appointment_date), "MMM d, yyyy")}
              />
              <InfoRow label={t("appointment.time")} value={applicant.appointment_time} />
              <InfoRow label={t("appointment.location")} value={applicant.appointment_location} />
              {applicant.appointment_notes && (
                <div className="col-span-2 sm:col-span-3">
                  <InfoRow label={t("appointment.notes")} value={applicant.appointment_notes} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("appointment.noAppointment")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
