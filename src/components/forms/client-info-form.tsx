"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { differenceInCalendarDays, parse, isValid } from "date-fns";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { ClientFormValues } from "@/schemas/client-form";
import { EMPLOYMENT_TYPES, TRIP_FUNDED_BY_OPTIONS } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Field({
  name,
  label,
  type = "text",
  placeholder,
  hint,
  readOnly,
}: {
  name: keyof ClientFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        className={readOnly ? "bg-muted/50 cursor-default" : ""}
        {...register(name)}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error?.message ? <p className="text-xs text-destructive">{String(error.message)}</p> : null}
    </div>
  );
}

function TextAreaField({
  name,
  label,
  placeholder,
  hint,
}: {
  name: keyof ClientFormValues;
  label: string;
  placeholder?: string;
  hint?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} placeholder={placeholder} {...register(name)} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error?.message ? <p className="text-xs text-destructive">{String(error.message)}</p> : null}
    </div>
  );
}

function SwitchField({
  name,
  label,
  description,
}: {
  name: keyof ClientFormValues;
  label: string;
  description?: string;
}) {
  const { watch, setValue } = useFormContext<ClientFormValues>();
  const value = watch(name) as boolean;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={name}>{label}</Label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch
        id={name}
        checked={value}
        onCheckedChange={(checked) => setValue(name, checked, { shouldDirty: true })}
      />
    </div>
  );
}

function DateField({
  name,
  label,
  hint,
}: {
  name: keyof ClientFormValues;
  label: string;
  hint?: string;
}) {
  const {
    control,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker id={name} value={field.value as string} onChange={field.onChange} />
        )}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error?.message ? <p className="text-xs text-destructive">{String(error.message)}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-calculate travel duration
// ---------------------------------------------------------------------------

function calcDuration(
  startStr: string,
  endStr: string,
  labelDays: string,
  labelDay: string
): string {
  if (!startStr || !endStr) return "";
  const start = parse(startStr, "yyyy-MM-dd", new Date());
  const end = parse(endStr, "yyyy-MM-dd", new Date());
  if (!isValid(start) || !isValid(end) || end < start) return "";
  const days = differenceInCalendarDays(end, start) + 1;
  return days === 1 ? `1 ${labelDay}` : `${days} ${labelDays}`;
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function ClientInfoForm() {
  const t = useTranslations("ClientInfoForm");
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ClientFormValues>();

  const maritalStatus = watch("maritalStatus");
  const employmentType = watch("employmentType");
  const tripFundedBy = watch("tripFundedBy");
  const previousVisaRefusals = watch("previousVisaRefusals");
  const travelStartDate = watch("travelStartDate");
  const travelEndDate = watch("travelEndDate");

  // Auto-calculate duration whenever travel dates change
  useEffect(() => {
    const calculated = calcDuration(
      travelStartDate ?? "",
      travelEndDate ?? "",
      t("travel.durationDays"),
      t("travel.durationDay")
    );
    setValue("duration", calculated, { shouldDirty: false });
  }, [travelStartDate, travelEndDate, setValue, t]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("personal.title")}</CardTitle>
          <CardDescription>{t("personal.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            name="fullName"
            label={t("personal.fullName")}
            placeholder={t("personal.fullNamePlaceholder")}
          />
          <Field
            name="passportNumber"
            label={t("personal.passportNumber")}
            placeholder={t("personal.passportNumberPlaceholder")}
          />
          <Field
            name="nationality"
            label={t("personal.nationality")}
            placeholder={t("personal.nationalityPlaceholder")}
          />
          <DateField name="dateOfBirth" label={t("personal.dateOfBirth")} />
          <Field
            name="email"
            label={t("personal.email")}
            type="email"
            placeholder={t("personal.emailPlaceholder")}
          />
          <Field
            name="phone"
            label={t("personal.phone")}
            placeholder={t("personal.phonePlaceholder")}
          />
          <Field
            name="currentAddress"
            label={t("personal.currentAddress")}
            placeholder={t("personal.currentAddressPlaceholder")}
          />
          <Field
            name="cityOfResidence"
            label={t("personal.cityOfResidence")}
            placeholder={t("personal.cityOfResidencePlaceholder")}
          />
          <DateField name="passportIssueDate" label={t("personal.passportIssueDate")} />
          <DateField name="passportExpiryDate" label={t("personal.passportExpiryDate")} />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="maritalStatus">{t("personal.maritalStatus")}</Label>
            <Select
              value={maritalStatus}
              onValueChange={(value) =>
                setValue("maritalStatus", value as ClientFormValues["maritalStatus"], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="maritalStatus">
                <SelectValue placeholder={t("personal.selectMaritalStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t("personal.statusSingle")}</SelectItem>
                <SelectItem value="married">{t("personal.statusMarried")}</SelectItem>
                <SelectItem value="divorced">{t("personal.statusDivorced")}</SelectItem>
                <SelectItem value="widowed">{t("personal.statusWidowed")}</SelectItem>
                <SelectItem value="separated">{t("personal.statusSeparated")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.maritalStatus?.message ? (
              <p className="text-xs text-destructive">{String(errors.maritalStatus.message)}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("travel.title")}</CardTitle>
          <CardDescription>{t("travel.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            name="destinationCountry"
            label={t("travel.destinationCountry")}
            placeholder={t("travel.destinationCountryPlaceholder")}
          />
          <Field
            name="purposeOfTravel"
            label={t("travel.purposeOfTravel")}
            placeholder={t("travel.purposeOfTravelPlaceholder")}
          />
          <Field
            name="visaType"
            label={t("travel.visaType")}
            placeholder={t("travel.visaTypePlaceholder")}
          />
          <Field
            name="embassyCity"
            label={t("travel.embassyCity")}
            placeholder={t("travel.embassyCityPlaceholder")}
          />
          <Field
            name="numberOfEntries"
            label={t("travel.numberOfEntries")}
            placeholder={t("travel.numberOfEntriesPlaceholder")}
          />
          <DateField name="travelStartDate" label={t("travel.travelStartDate")} />
          <DateField name="travelEndDate" label={t("travel.travelEndDate")} />

          {/* Auto-calculated duration */}
          <Field
            name="duration"
            label={t("travel.duration")}
            readOnly
            hint={t("travel.durationHint")}
          />

          <Field
            name="hostName"
            label={t("travel.hostName")}
            placeholder={t("travel.hostNamePlaceholder")}
          />
          <Field
            name="hostAddress"
            label={t("travel.hostAddress")}
            placeholder={t("travel.hostAddressPlaceholder")}
          />
          <div className="sm:col-span-2">
            <TextAreaField
              name="itinerary"
              label={t("travel.itinerary")}
              placeholder={t("travel.itineraryPlaceholder")}
              hint={t("travel.itineraryHint")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("employment.title")}</CardTitle>
          <CardDescription>{t("employment.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            name="occupation"
            label={t("employment.occupation")}
            placeholder={t("employment.occupationPlaceholder")}
          />
          <Field
            name="employerName"
            label={t("employment.employerName")}
            placeholder={t("employment.employerNamePlaceholder")}
          />
          <Field
            name="employerAddress"
            label={t("employment.employerAddress")}
            placeholder={t("employment.employerAddressPlaceholder")}
          />
          <div className="space-y-2">
            <Label htmlFor="employmentType">{t("employment.employmentType")}</Label>
            <Select
              value={employmentType || undefined}
              onValueChange={(value) => setValue("employmentType", value, { shouldDirty: true })}
            >
              <SelectTrigger id="employmentType">
                <SelectValue placeholder={t("employment.selectEmploymentType")} />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`employment.types.${option.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            name="monthlySalary"
            label={t("employment.monthlySalary")}
            placeholder={t("employment.monthlySalaryPlaceholder")}
          />
          <Field
            name="annualIncome"
            label={t("employment.annualIncome")}
            placeholder={t("employment.annualIncomePlaceholder")}
          />
          <DateField name="employmentStartDate" label={t("employment.employmentStartDate")} />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("financial.title")}</CardTitle>
          <CardDescription>{t("financial.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            name="bankBalance"
            label={t("financial.bankBalance")}
            placeholder={t("financial.bankBalancePlaceholder")}
          />
          <div className="space-y-2">
            <Label htmlFor="tripFundedBy">{t("financial.tripFundedBy")}</Label>
            <Select
              value={tripFundedBy || undefined}
              onValueChange={(value) => setValue("tripFundedBy", value, { shouldDirty: true })}
            >
              <SelectTrigger id="tripFundedBy">
                <SelectValue placeholder={t("financial.fundedByPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {TRIP_FUNDED_BY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`financial.fundedByOptions.${option.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            name="otherAssets"
            label={t("financial.otherAssets")}
            placeholder={t("financial.otherAssetsPlaceholder")}
          />
          <div className="sm:col-span-2">
            <SwitchField
              name="travelInsuranceAvailable"
              label={t("financial.travelInsuranceAvailable")}
              description={t("financial.travelInsuranceDescription")}
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("history.title")}</CardTitle>
          <CardDescription>{t("history.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            name="previousVisas"
            label={t("history.previousVisas")}
            description={t("history.previousVisasDescription")}
          />
          <TextAreaField
            name="countriesVisited"
            label={t("history.countriesVisited")}
            placeholder={t("history.countriesVisitedPlaceholder")}
          />
          <Field
            name="schengenVisasHeld"
            label={t("history.schengenVisasHeld")}
            placeholder={t("history.schengenVisasHeldPlaceholder")}
          />
          <SwitchField
            name="previousVisaRefusals"
            label={t("history.previousVisaRefusals")}
            description={t("history.previousVisaRefusalsDescription")}
          />
          {previousVisaRefusals ? (
            <TextAreaField
              name="previousVisaRefusalDetails"
              label={t("history.refusalDetails")}
              placeholder={t("history.refusalDetailsPlaceholder")}
              hint={t("history.refusalDetailsHint")}
            />
          ) : null}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ties.title")}</CardTitle>
          <CardDescription>{t("ties.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextAreaField
            name="familyTiesHomeCountry"
            label={t("ties.familyTies")}
            placeholder={t("ties.familyTiesPlaceholder")}
          />
          <TextAreaField
            name="reasonToReturn"
            label={t("ties.reasonToReturn")}
            placeholder={t("ties.reasonToReturnPlaceholder")}
          />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reservations.title")}</CardTitle>
          <CardDescription>{t("reservations.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            name="hotelReservationAvailable"
            label={t("reservations.hotelReservation")}
          />
          <SwitchField
            name="flightReservationAvailable"
            label={t("reservations.flightReservation")}
          />
          <TextAreaField
            name="sponsorInformation"
            label={t("reservations.sponsorInformation")}
            placeholder={t("reservations.sponsorInformationPlaceholder")}
          />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>{t("notes.title")}</CardTitle>
          <CardDescription>{t("notes.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextAreaField
            name="consultantNotes"
            label={t("notes.consultantGuidance")}
            placeholder={t("notes.consultantGuidancePlaceholder")}
            hint={t("notes.consultantGuidanceHint")}
          />
          <TextAreaField
            name="additionalNotes"
            label={t("notes.additionalNotes")}
            placeholder={t("notes.additionalNotesPlaceholder")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
