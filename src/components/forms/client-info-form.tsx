"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { differenceInCalendarDays, parse, isValid } from "date-fns";
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

/** A date picker field wired to react-hook-form via Controller */
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

function calcDuration(startStr: string, endStr: string): string {
  if (!startStr || !endStr) return "";
  const start = parse(startStr, "yyyy-MM-dd", new Date());
  const end = parse(endStr, "yyyy-MM-dd", new Date());
  if (!isValid(start) || !isValid(end) || end < start) return "";
  const days = differenceInCalendarDays(end, start) + 1;
  return days === 1 ? "1 day" : `${days} days`;
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export function ClientInfoForm() {
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
    const calculated = calcDuration(travelStartDate ?? "", travelEndDate ?? "");
    setValue("duration", calculated, { shouldDirty: false });
  }, [travelStartDate, travelEndDate, setValue]);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Core applicant identity details required for the cover letter.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="fullName" label="Full Name" placeholder="John Doe" />
          <Field name="passportNumber" label="Passport Number" placeholder="AB1234567" />
          <Field name="nationality" label="Nationality" placeholder="United States" />
          <DateField name="dateOfBirth" label="Date of Birth" />
          <Field name="email" label="Email Address" type="email" placeholder="john@example.com" />
          <Field name="phone" label="Phone Number" placeholder="+1 555 0100" />
          <Field
            name="currentAddress"
            label="Current Address"
            placeholder="123 Main Street, Apt 4B"
          />
          <Field name="cityOfResidence" label="City of Residence" placeholder="New York" />
          <DateField name="passportIssueDate" label="Passport Issue Date" />
          <DateField name="passportExpiryDate" label="Passport Expiry Date" />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select
              value={maritalStatus}
              onValueChange={(value) =>
                setValue("maritalStatus", value as ClientFormValues["maritalStatus"], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="maritalStatus">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="separated">Separated</SelectItem>
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
          <CardTitle>Travel Information</CardTitle>
          <CardDescription>Destination, visa type, dates, and planned activities.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="destinationCountry" label="Destination Country" placeholder="France" />
          <Field
            name="purposeOfTravel"
            label="Purpose of Travel"
            placeholder="Tourism / Business meeting"
          />
          <Field name="visaType" label="Visa Type" placeholder="Short-stay tourist visa" />
          <Field name="embassyCity" label="Embassy / Consulate City" placeholder="Paris" />
          <Field name="numberOfEntries" label="Number of Entries" placeholder="Single / Multiple" />
          <DateField name="travelStartDate" label="Travel Start Date" />
          <DateField name="travelEndDate" label="Travel End Date" />

          {/* Auto-calculated duration */}
          <Field
            name="duration"
            label="Duration (auto-calculated)"
            readOnly
            hint="Calculated automatically from the travel dates above."
          />

          <Field
            name="hostName"
            label="Host / Inviting Organization"
            placeholder="Hotel name or business host"
          />
          <Field name="hostAddress" label="Host Address" placeholder="Host city and address" />
          <div className="sm:col-span-2">
            <TextAreaField
              name="itinerary"
              label="Travel Itinerary"
              placeholder="Day-by-day plan, cities to visit, meetings scheduled..."
              hint="Helps the letter explain the trip structure clearly."
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Employment Information</CardTitle>
          <CardDescription>
            Optional — strengthens ties and financial stability arguments.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="occupation" label="Occupation / Job Title" placeholder="Software Engineer" />
          <Field name="employerName" label="Employer Name" placeholder="Acme Corp" />
          <Field
            name="employerAddress"
            label="Employer Address"
            placeholder="Company city and address"
          />
          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment Type</Label>
            <Select
              value={employmentType || undefined}
              onValueChange={(value) => setValue("employmentType", value, { shouldDirty: true })}
            >
              <SelectTrigger id="employmentType">
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field name="monthlySalary" label="Monthly Salary" placeholder="USD 5,000" />
          <Field name="annualIncome" label="Annual Income" placeholder="USD 60,000" />
          <DateField name="employmentStartDate" label="Employment Start Date" />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Optional — demonstrates ability to fund the trip.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="bankBalance" label="Bank Balance" placeholder="USD 25,000" />
          <div className="space-y-2">
            <Label htmlFor="tripFundedBy">Trip Funded By</Label>
            <Select
              value={tripFundedBy || undefined}
              onValueChange={(value) => setValue("tripFundedBy", value, { shouldDirty: true })}
            >
              <SelectTrigger id="tripFundedBy">
                <SelectValue placeholder="Who is paying for the trip?" />
              </SelectTrigger>
              <SelectContent>
                {TRIP_FUNDED_BY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field
            name="otherAssets"
            label="Other Assets"
            placeholder="Property, investments, vehicle ownership"
          />
          <div className="sm:col-span-2">
            <SwitchField
              name="travelInsuranceAvailable"
              label="Travel Insurance Available"
              description="Medical/travel insurance purchased for this trip"
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Travel History</CardTitle>
          <CardDescription>Optional — past travel and visa record.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            name="previousVisas"
            label="Previous Visas"
            description="Has the applicant held visas before?"
          />
          <TextAreaField
            name="countriesVisited"
            label="Countries Visited"
            placeholder="United Kingdom, Germany, Japan"
          />
          <Field
            name="schengenVisasHeld"
            label="Schengen Visas Held"
            placeholder="e.g. France 2023, Germany 2024"
          />
          <SwitchField
            name="previousVisaRefusals"
            label="Previous Visa Refusals"
            description="Has the applicant ever been refused a visa?"
          />
          {previousVisaRefusals ? (
            <TextAreaField
              name="previousVisaRefusalDetails"
              label="Refusal Details"
              placeholder="Country, year, and brief context if known"
              hint="Only include facts provided by the client."
            />
          ) : null}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Home Country Ties</CardTitle>
          <CardDescription>
            Optional — helps demonstrate intent to return after the trip.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextAreaField
            name="familyTiesHomeCountry"
            label="Family Ties in Home Country"
            placeholder="Spouse, children, parents residing in home country"
          />
          <TextAreaField
            name="reasonToReturn"
            label="Reason to Return Home"
            placeholder="Ongoing employment, property, studies, family responsibilities"
          />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations &amp; Sponsorship</CardTitle>
          <CardDescription>Supporting documents and sponsor details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField name="hotelReservationAvailable" label="Hotel Reservation Available" />
          <SwitchField name="flightReservationAvailable" label="Flight Reservation Available" />
          <TextAreaField
            name="sponsorInformation"
            label="Sponsor Information"
            placeholder="Sponsor name, relationship, and support details"
          />
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Consultant Notes</CardTitle>
          <CardDescription>
            Internal guidance for the AI — highlight what to emphasize in the letter. Not shown
            verbatim in the final letter.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TextAreaField
            name="consultantNotes"
            label="Visa Consultant Guidance"
            placeholder="e.g. Emphasize stable employment and return to minor children. Client is attending a conference then sightseeing."
            hint="Use this to steer tone and focus — the AI will only use facts from other fields."
          />
          <TextAreaField
            name="additionalNotes"
            label="Additional Client Notes"
            placeholder="Any other verified facts relevant for the embassy"
          />
        </CardContent>
      </Card>
    </div>
  );
}
