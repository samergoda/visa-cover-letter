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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  register,
  errors,
}: FieldProps) {
  const error = errors[name];
  return (
    <div className="space-y-1.5">
      <Label htmlFor={String(name)}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input id={String(name)} type={type} placeholder={placeholder} {...register(name)} />
      {error?.message && <p className="text-xs text-destructive">{String(error.message)}</p>}
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
          <DatePicker value={field.value as string} onChange={field.onChange} />
        )}
      />
      {error?.message && <p className="text-xs text-destructive">{String(error.message)}</p>}
    </div>
  );
}

interface ApplicantFormProps {
  initialValues?: Partial<ApplicantFormValues>;
  onSubmit: (values: ApplicantFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  type?: string;
}

export function ApplicantForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save Applicant",
  type = "edit",
}: ApplicantFormProps) {
  const [statuses, setStatuses] = useState<VisaStatus[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = type === "new" ? 4 : 5;

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

  const {
    register,
    control,
    formState: { errors },
    handleSubmit: formHandleSubmit,
    watch,
    setValue,
  } = form;
  const maritalStatus = watch("marital_status");
  const isFamilyVisa = watch("is_family_visa");
  const handleSubmit = async (e: React.FormEvent) => {
    await formHandleSubmit(onSubmit as never)(e);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Indicator */}
      {type === "new" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className="flex-1 flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      i + 1 === currentStep
                        ? "bg-primary text-primary-foreground"
                        : i + 1 < currentStep
                          ? "bg-primary/80 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        i + 1 < currentStep ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Personal</span>
              <span>Passport</span>
              <span>Travel</span>
              <span>Additional</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Personal Information */}
      {(type !== "new" || currentStep === 1) && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Core identity details of the applicant.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              name="full_name"
              label="Full Name"
              placeholder="John Doe"
              required
              register={register}
              errors={errors}
            />
            <Field
              name="nationality"
              label="Nationality"
              placeholder="Lebanese"
              required
              register={register}
              errors={errors}
            />
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
            <DateField
              name="date_of_birth"
              label="Date of Birth"
              control={control}
              errors={errors}
            />
            <Field
              name="place_of_birth"
              label="Place of Birth"
              placeholder="Beirut"
              register={register}
              errors={errors}
            />
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
            <Field
              name="occupation"
              label="Occupation"
              placeholder="Engineer"
              register={register}
              errors={errors}
            />
            <Field
              name="employer"
              label="Employer"
              placeholder="Company Name"
              register={register}
              errors={errors}
            />
            <Field
              name="phone"
              label="Phone Number"
              placeholder="+961 70 000000"
              register={register}
              errors={errors}
            />
            <Field
              name="email"
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              register={register}
              errors={errors}
            />
            <div className="sm:col-span-2">
              <Field
                name="home_address"
                label="Home Address"
                placeholder="Street, City, Country"
                register={register}
                errors={errors}
              />
            </div>

            {/* Family Visa Toggle */}
            {maritalStatus === "married" && (
              <div className="sm:col-span-2 space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="is_family_visa"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="is_family_visa"
                        checked={field.value ?? false}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    )}
                  />
                  <Label htmlFor="is_family_visa" className="font-semibold">
                    This is a family visa application (include spouse/children)
                  </Label>
                </div>

                {/* Spouse Information */}
                {isFamilyVisa && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <h4 className="font-semibold text-sm">Spouse Information</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        name="spouse_full_name"
                        label="Spouse Full Name"
                        placeholder="Jane Doe"
                        register={register}
                        errors={errors}
                      />
                      <DateField
                        name="spouse_date_of_birth"
                        label="Spouse Date of Birth"
                        control={control}
                        errors={errors}
                      />
                      <Field
                        name="spouse_nationality"
                        label="Spouse Nationality"
                        placeholder="Lebanese"
                        register={register}
                        errors={errors}
                      />
                      <Field
                        name="spouse_passport_number"
                        label="Spouse Passport Number"
                        placeholder="AB7654321"
                        register={register}
                        errors={errors}
                      />
                    </div>

                    <div className="pt-2">
                      <h4 className="font-semibold text-sm mb-3">Children Information</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="number_of_children">Number of Children</Label>
                          <Input
                            id="number_of_children"
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register("number_of_children")}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="children_info">Children Details</Label>
                          <textarea
                            id="children_info"
                            placeholder="Name, Date of Birth, Passport Number for each child (one per line)"
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...register("children_info")}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Example: John Doe, 2010-05-15, AB1122334
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Passport Details */}
      {(type !== "new" || currentStep === 2) && (
        <Card>
          <CardHeader>
            <CardTitle>Passport Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              name="passport_number"
              label="Passport Number"
              placeholder="AB1234567"
              register={register}
              errors={errors}
            />
            <Field
              name="passport_issuing_country"
              label="Issuing Country"
              placeholder="Lebanon"
              register={register}
              errors={errors}
            />
            <DateField
              name="passport_issue_date"
              label="Issue Date"
              control={control}
              errors={errors}
            />
            <DateField
              name="passport_expiry_date"
              label="Expiry Date"
              control={control}
              errors={errors}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Travel Information */}
      {(type !== "new" || currentStep === 3) && (
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
              register={register}
              errors={errors}
            />
            <Field
              name="entry_country"
              label="Entry Country"
              placeholder="France"
              register={register}
              errors={errors}
            />
            <Field
              name="purpose_of_travel"
              label="Purpose of Travel"
              placeholder="Tourism"
              register={register}
              errors={errors}
            />
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
            <DateField
              name="departure_date"
              label="Departure Date"
              control={control}
              errors={errors}
            />
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
              <p className="text-xs text-muted-foreground">
                Calculated from arrival &amp; departure dates
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Additional Information */}
      {(type !== "new" || currentStep === 4) && (
        <>
          {/* Financial / Sponsor */}
          <Card>
            <CardHeader>
              <CardTitle>Sponsor Information</CardTitle>
              <CardDescription>Optional — fill if trip is sponsored.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field name="sponsor_name" label="Sponsor Name" register={register} errors={errors} />
              <Field
                name="sponsor_relationship"
                label="Relationship"
                placeholder="Father / Employer"
                register={register}
                errors={errors}
              />
              <Field
                name="sponsor_phone"
                label="Sponsor Phone"
                register={register}
                errors={errors}
              />
              <div className="sm:col-span-2">
                <Field
                  name="sponsor_address"
                  label="Sponsor Address"
                  register={register}
                  errors={errors}
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {type !== "new" && (
                <Field
                  name="insurance_company"
                  label="Insurance Company"
                  register={register}
                  errors={errors}
                />
              )}{" "}
              <Field
                name="insurance_number"
                label="Policy Number"
                register={register}
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Assignment */}
          {type !== "new" && (
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
                <Field
                  name="assigned_employee"
                  label="Assigned Employee"
                  placeholder="Employee name"
                  register={register}
                  errors={errors}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-3">
        {type === "new" && currentStep > 1 && (
          <Button type="button" variant="outline" onClick={prevStep} size="lg">
            Previous
          </Button>
        )}
        {type === "new" && currentStep < totalSteps ? (
          <Button type="button" onClick={nextStep} size="lg" className="ml-auto">
            Next Step
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} size="lg" className="ml-auto">
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
