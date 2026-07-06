"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { FieldErrors, UseFormRegister, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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
        {required && <span className="mx-0.5 text-destructive">*</span>}
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
  const t = useTranslations("ApplicantForm");
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

  // Determine button text
  const getSubmitButtonText = () => {
    if (isSubmitting) return t("buttons.saving");
    if (type === "new") return t("buttons.submit");
    if (submitLabel === "Save Applicant") return t("buttons.save");
    return submitLabel;
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
              <span>{t("steps.personal")}</span>
              <span>{t("steps.passport")}</span>
              <span>{t("steps.travel")}</span>
              <span>{t("steps.additional")}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Personal Information */}
      {(type !== "new" || currentStep === 1) && (
        <Card>
          <CardHeader>
            <CardTitle>{t("personal.title")}</CardTitle>
            <CardDescription>{t("personal.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              name="full_name"
              label={t("personal.fullName")}
              placeholder={t("personal.fullNamePlaceholder")}
              required
              register={register}
              errors={errors}
            />
            <Field
              name="nationality"
              label={t("personal.nationality")}
              placeholder={t("personal.nationalityPlaceholder")}
              required
              register={register}
              errors={errors}
            />
            <div className="space-y-1.5">
              <Label>{t("personal.gender")}</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("personal.selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("personal.genderMale")}</SelectItem>
                      <SelectItem value="female">{t("personal.genderFemale")}</SelectItem>
                      <SelectItem value="other">{t("personal.genderOther")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DateField
              name="date_of_birth"
              label={t("personal.dateOfBirth")}
              control={control}
              errors={errors}
            />
            <Field
              name="place_of_birth"
              label={t("personal.placeOfBirth")}
              placeholder={t("personal.placeOfBirthPlaceholder")}
              register={register}
              errors={errors}
            />
            <div className="space-y-1.5">
              <Label>{t("personal.maritalStatus")}</Label>
              <Controller
                control={control}
                name="marital_status"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("personal.selectStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{t("personal.statusSingle")}</SelectItem>
                      <SelectItem value="married">{t("personal.statusMarried")}</SelectItem>
                      <SelectItem value="divorced">{t("personal.statusDivorced")}</SelectItem>
                      <SelectItem value="widowed">{t("personal.statusWidowed")}</SelectItem>
                      <SelectItem value="separated">{t("personal.statusSeparated")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <Field
              name="occupation"
              label={t("personal.occupation")}
              placeholder={t("personal.occupationPlaceholder")}
              register={register}
              errors={errors}
            />
            <Field
              name="employer"
              label={t("personal.employer")}
              placeholder={t("personal.employerPlaceholder")}
              register={register}
              errors={errors}
            />
            <Field
              name="phone"
              label={t("personal.phone")}
              placeholder={t("personal.phonePlaceholder")}
              register={register}
              errors={errors}
            />
            <Field
              name="email"
              label={t("personal.email")}
              type="email"
              placeholder={t("personal.emailPlaceholder")}
              register={register}
              errors={errors}
            />
            <div className="sm:col-span-2">
              <Field
                name="home_address"
                label={t("personal.homeAddress")}
                placeholder={t("personal.homeAddressPlaceholder")}
                register={register}
                errors={errors}
              />
            </div>
            <Field
              name="city"
              label={t("personal.city") || "City"}
              placeholder={t("personal.cityPlaceholder") || "e.g. Beirut"}
              register={register}
              errors={errors}
            />
            <div className="flex items-center space-x-2 pt-6">
              <Controller
                control={control}
                name="has_bank_account"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="has_bank_account"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-gray-300 accent-primary cursor-pointer"
                  />
                )}
              />
              <Label htmlFor="has_bank_account" className="font-medium cursor-pointer text-sm">
                {t("personal.hasBankAccount") || "Has Active Bank Account"}
              </Label>
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
                    {t("personal.isFamilyVisa")}
                  </Label>
                </div>

                {/* Spouse Information */}
                {isFamilyVisa && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20 rtl:pl-0 rtl:pr-6 rtl:border-l-0 rtl:border-r-2">
                    <h4 className="font-semibold text-sm">{t("personal.spouseTitle")}</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        name="spouse_full_name"
                        label={t("personal.spouseName")}
                        placeholder={t("personal.spouseNamePlaceholder")}
                        register={register}
                        errors={errors}
                      />
                      <DateField
                        name="spouse_date_of_birth"
                        label={t("personal.spouseDob")}
                        control={control}
                        errors={errors}
                      />
                      <Field
                        name="spouse_nationality"
                        label={t("personal.spouseNationality")}
                        placeholder={t("personal.spouseNationalityPlaceholder")}
                        register={register}
                        errors={errors}
                      />
                      <Field
                        name="spouse_passport_number"
                        label={t("personal.spousePassport")}
                        placeholder={t("personal.spousePassportPlaceholder")}
                        register={register}
                        errors={errors}
                      />
                    </div>

                    <div className="pt-2">
                      <h4 className="font-semibold text-sm mb-3">{t("personal.childrenTitle")}</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="number_of_children">{t("personal.numChildren")}</Label>
                          <Input
                            id="number_of_children"
                            type="number"
                            min="0"
                            placeholder="0"
                            {...register("number_of_children")}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="children_info">{t("personal.childrenDetails")}</Label>
                          <textarea
                            id="children_info"
                            placeholder={t("personal.childrenDetailsPlaceholder")}
                            rows={3}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...register("children_info")}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("personal.childrenDetailsExample")}
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
            <CardTitle>{t("passport.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              name="passport_number"
              label={t("passport.number")}
              placeholder={t("passport.numberPlaceholder")}
              register={register}
              errors={errors}
            />
            <Field
              name="passport_issuing_country"
              label={t("passport.issuingCountry")}
              placeholder={t("passport.issuingCountryPlaceholder")}
              register={register}
              errors={errors}
            />
            <DateField
              name="passport_issue_date"
              label={t("passport.issueDate")}
              control={control}
              errors={errors}
            />
            <DateField
              name="passport_expiry_date"
              label={t("passport.expiryDate")}
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
            <CardTitle>{t("travel.title")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              name="destination_country"
              label={t("travel.destinationCountry")}
              placeholder={t("travel.destinationCountryPlaceholder")}
              required
              register={register}
              errors={errors}
            />
            <Field
              name="entry_country"
              label={t("travel.entryCountry")}
              placeholder={t("travel.entryCountryPlaceholder")}
              register={register}
              errors={errors}
            />
            <Field
              name="purpose_of_travel"
              label={t("travel.purpose")}
              placeholder={t("travel.purposePlaceholder")}
              register={register}
              errors={errors}
            />
            <div className="space-y-1.5">
              <Label>{t("travel.numEntries")}</Label>
              <Controller
                control={control}
                name="number_of_entries"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("travel.selectEntries")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{t("travel.entrySingle")}</SelectItem>
                      <SelectItem value="double">{t("travel.entryDouble")}</SelectItem>
                      <SelectItem value="multiple">{t("travel.entryMultiple")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DateField
              name="arrival_date"
              label={t("travel.arrivalDate")}
              control={control}
              errors={errors}
            />
            <DateField
              name="departure_date"
              label={t("travel.departureDate")}
              control={control}
              errors={errors}
            />
            <div className="space-y-1.5">
              <Label htmlFor="duration_of_stay">{t("travel.duration")}</Label>
              <Input
                id="duration_of_stay"
                type="number"
                placeholder={t("travel.durationPlaceholder")}
                readOnly
                className="bg-muted/50"
                {...register("duration_of_stay")}
              />
              <p className="text-xs text-muted-foreground">{t("travel.durationDescription")}</p>
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
              <CardTitle>{t("sponsor.title")}</CardTitle>
              <CardDescription>{t("sponsor.description")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                name="sponsor_name"
                label={t("sponsor.name")}
                register={register}
                errors={errors}
              />
              <Field
                name="sponsor_relationship"
                label={t("sponsor.relationship")}
                placeholder={t("sponsor.relationshipPlaceholder")}
                register={register}
                errors={errors}
              />
              <Field
                name="sponsor_phone"
                label={t("sponsor.phone")}
                register={register}
                errors={errors}
              />
              <div className="sm:col-span-2">
                <Field
                  name="sponsor_address"
                  label={t("sponsor.address")}
                  register={register}
                  errors={errors}
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader>
              <CardTitle>{t("insurance.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {type !== "new" && (
                <Field
                  name="insurance_company"
                  label={t("insurance.company")}
                  register={register}
                  errors={errors}
                />
              )}{" "}
              <Field
                name="insurance_number"
                label={t("insurance.policyNumber")}
                register={register}
                errors={errors}
              />
            </CardContent>
          </Card>

          {/* Assignment */}
          {type !== "new" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("assignment.title")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("assignment.status")}</Label>
                  <Controller
                    control={control}
                    name="status_id"
                    render={({ field }) => (
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("assignment.selectStatus")} />
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
                  label={t("assignment.employee")}
                  placeholder={t("assignment.employeePlaceholder")}
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
            {t("buttons.previous")}
          </Button>
        )}
        {type === "new" && currentStep < totalSteps ? (
          <Button
            type="button"
            onClick={nextStep}
            size="lg"
            className="ml-auto rtl:ml-0 rtl:mr-auto"
          >
            {t("buttons.next")}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="ml-auto rtl:ml-0 rtl:mr-auto"
          >
            {getSubmitButtonText()}
          </Button>
        )}
      </div>
    </form>
  );
}
