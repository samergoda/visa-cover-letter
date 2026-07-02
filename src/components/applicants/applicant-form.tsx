"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { FieldErrors, UseFormRegister, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  applicantFormSchema,
  defaultApplicantFormValues,
  type ApplicantFormValues,
} from "@/schemas/applicant-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VisaStatus } from "@/types";

interface FieldProps {
  name: keyof ApplicantFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  register: UseFormRegister<ApplicantFormValues>;
  errors: FieldErrors<ApplicantFormValues>;
}

function Field({ name, label, type = "text", placeholder, required, register, errors }: FieldProps) {
  const error = errors[name];
  return (
    <div className="space-y-1.5">
      <Label htmlFor={String(name)}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input
        id={String(name)}
        type={type}
        placeholder={placeholder}
        {...register(name)}
      />
      {error?.message && (
        <p className="text-xs text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
}

function DateField({
  name,
  label,
  control,
  errors,
}: {
  name: keyof ApplicantFormValues;
  label: string;
  control: Control<ApplicantFormValues>;
  errors: FieldErrors<ApplicantFormValues>;
}) {
  const error = errors[name];
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            value={field.value as string}
            onChange={field.onChange}
          />
        )}
      />
      {error?.message && (
        <p className="text-xs text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
}

interface ApplicantFormProps {
  initialValues?: Partial<ApplicantFormValues>;
  onSubmit: (values: ApplicantFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function ApplicantForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Applicant",
}: ApplicantFormProps) {
  const [statuses, setStatuses] = useState<VisaStatus[]>([]);

  useEffect(() => {
    fetch("/api/settings/statuses")
      .then((r) => r.json())
      .then((d: VisaStatus[]) => setStatuses(d.filter((s) => s.is_active)))
      .catch(() => {});
  }, []);

  const form = useForm<ApplicantFormValues>({
    resolver: zodResolver(applicantFormSchema) as never,
    defaultValues: { ...defaultApplicantFormValues, ...initialValues },
  });

  const { register, control, formState: { errors }, handleSubmit: formHandleSubmit, watch, setValue } = form;
  const handleSubmit = ()=>{
    formHandleSubmit(onSubmit as never);
    window.scroll({
     top: 0, behavior: 'smooth'
    })
  }

  // Auto-calculate duration of stay from arrival/departure dates
  const arrivalDate = watch("arrival_date");
  const departureDate = watch("departure_date");

  useEffect(() => {
    if (arrivalDate && departureDate) {
      const arrival = new Date(arrivalDate);
      const departure = new Date(departureDate);
      const diffMs = departure.getTime() - arrival.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setValue("duration_of_stay", diffDays);
      }
    }
  }, [arrivalDate, departureDate, setValue]);
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Core identity details of the applicant.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="full_name" label="Full Name" placeholder="John Doe" required register={register} errors={errors} />
          <Field name="nationality" label="Nationality" placeholder="Lebanese" required register={register} errors={errors} />
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DateField name="date_of_birth" label="Date of Birth" control={control} errors={errors} />
          <Field name="place_of_birth" label="Place of Birth" placeholder="Beirut" register={register} errors={errors} />
          <div className="space-y-1.5">
            <Label>Marital Status</Label>
            <Controller
              control={control}
              name="marital_status"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="separated">Separated</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Field name="occupation" label="Occupation" placeholder="Engineer" register={register} errors={errors} />
          <Field name="employer" label="Employer" placeholder="Company Name" register={register} errors={errors} />
          <Field name="phone" label="Phone Number" placeholder="+961 70 000000" register={register} errors={errors} />
          <Field name="email" label="Email Address" type="email" placeholder="john@example.com" register={register} errors={errors} />
          <div className="sm:col-span-2">
            <Field name="home_address" label="Home Address" placeholder="Street, City, Country" register={register} errors={errors} />
          </div>
        </CardContent>
      </Card>

      {/* Passport Details */}
      <Card>
        <CardHeader>
          <CardTitle>Passport Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="passport_number" label="Passport Number" placeholder="AB1234567" register={register} errors={errors} />
          <Field name="passport_issuing_country" label="Issuing Country" placeholder="Lebanon" register={register} errors={errors} />
          <DateField name="passport_issue_date" label="Issue Date" control={control} errors={errors} />
          <DateField name="passport_expiry_date" label="Expiry Date" control={control} errors={errors} />
        </CardContent>
      </Card>

      {/* Travel Information */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            name="destination_country"
            label="Destination Country"
            placeholder="France"
            required
            register={register} errors={errors}
          />
          <Field name="entry_country" label="Entry Country" placeholder="France" register={register} errors={errors} />
          <Field name="purpose_of_travel" label="Purpose of Travel" placeholder="Tourism" register={register} errors={errors} />
          <div className="space-y-1.5">
            <Label>Number of Entries</Label>
            <Controller
              control={control}
              name="number_of_entries"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="multiple">Multiple</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DateField name="arrival_date" label="Arrival Date" control={control} errors={errors} />
          <DateField name="departure_date" label="Departure Date" control={control} errors={errors} />
          <div className="space-y-1.5">
            <Label htmlFor="duration_of_stay">Duration of Stay (days)</Label>
            <Input
              id="duration_of_stay"
              type="number"
              placeholder="Auto-calculated"
              readOnly
              className="bg-muted/50"
              {...register("duration_of_stay")}
            />
            <p className="text-xs text-muted-foreground">Calculated from arrival &amp; departure dates</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial / Sponsor */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsor Information</CardTitle>
          <CardDescription>Optional — fill if trip is sponsored.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="sponsor_name" label="Sponsor Name" register={register} errors={errors} />
          <Field name="sponsor_relationship" label="Relationship" placeholder="Father / Employer" register={register} errors={errors} />
          <Field name="sponsor_phone" label="Sponsor Phone" register={register} errors={errors} />
          <div className="sm:col-span-2">
            <Field name="sponsor_address" label="Sponsor Address" register={register} errors={errors} />
          </div>
        </CardContent>
      </Card>

      {/* Accommodation */}
      <Card>
        <CardHeader>
          <CardTitle>Accommodation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="hotel_name" label="Hotel Name" placeholder="Hotel de Paris" register={register} errors={errors} />
          <Field name="hotel_address" label="Hotel Address" placeholder="Paris, France" register={register} errors={errors} />
        </CardContent>
      </Card>

      {/* Insurance */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field name="insurance_company" label="Insurance Company" register={register} errors={errors} />
          <Field name="insurance_number" label="Policy Number" register={register} errors={errors} />
        </CardContent>
      </Card>

      {/* Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment & Status</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Visa Status</Label>
            <Controller
              control={control}
              name="status_id"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Field name="assigned_employee" label="Assigned Employee" placeholder="Employee name" register={register} errors={errors} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
