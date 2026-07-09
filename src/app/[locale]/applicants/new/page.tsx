"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Plane,
  User,
  Users,
  Landmark,
  MapPin,
  Briefcase,
  Phone,
  ArrowRight,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema validation for the quick application form
const applicationSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(5, "Please enter a valid phone number"),
    occupation: z.string().min(2, "Job title/Occupation is required"),
    city: z.string().min(2, "City is required"),
    destination_country: z.string().min(2, "Destination country is required"),
    has_bank_account: z.boolean(),
    is_family_visa: z.boolean(),
    // Family specific fields (conditional validation)
    spouse_full_name: z.string().optional(),
    number_of_children: z.coerce.number().optional().or(z.literal("")),
    children_info: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_family_visa) {
      if (!data.spouse_full_name || data.spouse_full_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Spouse name is required for family applications",
          path: ["spouse_full_name"],
        });
      }
    }
  });

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function NewApplicantPage() {
  const t = useTranslations("NewApplicant");
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema) as never,
    defaultValues: {
      full_name: "",
      phone: "",
      occupation: "",
      city: "",
      destination_country: "",
      has_bank_account: false,
      is_family_visa: false,
      spouse_full_name: "",
      number_of_children: "",
      children_info: "",
    },
  });

  const isFamilyVisa = watch("is_family_visa");

  const onSubmit = async (values: ApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      // Build payload satisfying database constraints (nationality, destination_country)
      const payload = {
        full_name: values.full_name,
        phone: values.phone,
        occupation: values.occupation,
        city: values.city,
        has_bank_account: values.has_bank_account,
        is_family_visa: values.is_family_visa,
        spouse_full_name: values.is_family_visa ? values.spouse_full_name : null,
        number_of_children: values.is_family_visa ? Number(values.number_of_children) || 0 : null,
        children_info: values.is_family_visa ? values.children_info : null,

        // Default required fields to satisfy NOT NULL constraints gracefully
        nationality: "N/A",
        destination_country: values.destination_country,
      };

      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? (isAr ? "فشل تقديم الطلب" : "Failed to submit application"));
        return;
      }

      setRefNumber((data.id ?? "").slice(0, 8).toUpperCase());
      setSubmitted(true);
      toast.success(isAr ? "تم تقديم طلبك بنجاح!" : "Application submitted successfully!");
    } catch {
      toast.error(isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Localized UI strings helper
  const strings = {
    title: isAr ? "تقديم طلب تأشيرة جديد" : "Submit New Visa Application",
    subtitle: isAr
      ? "يرجى ملء النموذج البسيط أدناه لبدء معاملتك"
      : "Please fill out the simple form below to start your application",
    individualTitle: isAr ? "طلب فردي" : "Individual Application",
    individualDesc: isAr ? "التقديم لشخص واحد فقط" : "Applying for a single applicant",
    familyTitle: isAr ? "طلب عائلي" : "Family Application",
    familyDesc: isAr
      ? "التقديم لك ولعائلتك (يشمل الزوج/ة والأطفال)"
      : "Applying for yourself and your family members",
    nameLabel: isAr ? "الاسم الكامل" : "Full Name",
    namePlaceholder: isAr ? "أدخل اسمك الكامل" : "Enter your full name",
    phoneLabel: isAr ? "رقم الهاتف" : "Phone Number",
    phonePlaceholder: isAr ? "مثال: 96170000000+" : "e.g., +961 70 000000",
    jobLabel: isAr ? "المهنة / الوظيفة" : "Occupation / Job Title",
    jobPlaceholder: isAr ? "مثال: مهندس برمجيات، مدير مبيعات" : "e.g., Software Engineer, Manager",
    cityLabel: isAr ? "المدينة" : "City",
    cityPlaceholder: isAr ? "مثال: بيروت، دبي" : "e.g., Beirut, Dubai",
    countryLabel: isAr ? "بلد السفر / الوجهة" : "Which country do you need to travel to?",
    countryPlaceholder: isAr ? "مثال: فرنسا، ألمانيا" : "e.g., France, Germany",
    bankLabel: isAr ? "هل لديك حساب بنكي حالي نشط؟" : "Do you have an active bank account?",
    bankYes: isAr ? "نعم، لدي حساب بنكي نشط" : "Yes, I have an active bank account",
    bankNo: isAr ? "لا، ليس لدي حساب بنكي حالياً" : "No, I do not have a bank account currently",
    spouseLabel: isAr ? "الاسم الكامل للزوج/ة" : "Spouse Full Name",
    spousePlaceholder: isAr ? "أدخل اسم الزوج أو الزوجة" : "Enter spouse's full name",
    childrenLabel: isAr ? "عدد الأطفال" : "Number of Children",
    childrenInfoLabel: isAr ? "تفاصيل الأطفال" : "Children Details",
    childrenInfoPlaceholder: isAr
      ? "الاسم وتاريخ الميلاد لكل طفل (طفل واحد في كل سطر)"
      : "Name and DOB for each child (one per line)",
    submitBtn: isAr ? "إرسال الطلب الآن" : "Submit Application Now",
    submittingBtn: isAr ? "جاري الإرسال..." : "Submitting...",
    successHeader: isAr ? "تم إرسال طلبك بنجاح!" : "Application Received Successfully!",
    successMsg: isAr
      ? "سنقوم بالتواصل معك قريباً لمتابعة الإجراءات."
      : "We will contact you soon to finalize your details.",
    refLabel: isAr ? "رقم المرجع الخاص بك:" : "Your Reference Number:",
    submitNew: isAr ? "تقديم طلب آخر" : "Submit Another Application",
    securedText: isAr
      ? "بياناتك محمية ومشفرة بالكامل"
      : "Your details are secure and fully encrypted",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
              <Plane className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {t("visaPro")}
              </p>
              <p className="text-xs text-muted-foreground">{t("subTitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground border rounded-full px-3 py-1 bg-card">
            <Globe className="h-3.5 w-3.5" />
            <span>{locale.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {submitted ? (
          /* ── Success state ── */
          <Card className="border-green-500/20 shadow-2xl shadow-green-500/5 overflow-hidden transition-all duration-500 transform scale-100">
            <div className="h-2 bg-green-500" />
            <CardContent className="flex flex-col items-center gap-6 py-16 px-6 text-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400">
                <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
                <CheckCircle2 className="relative h-14 w-14" />
              </div>
              <div className="space-y-3 max-w-md">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  {strings.successHeader}
                </h1>
                <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                  {strings.successMsg}
                </p>
                {refNumber && (
                  <div className="inline-flex flex-col items-center gap-1.5 rounded-2xl bg-muted px-6 py-3 border.5 border-dashed mt-4">
                    <span className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">
                      {strings.refLabel}
                    </span>
                    <span className="font-mono text-xl font-bold text-primary tracking-wide">
                      {refNumber}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto mt-6">
                <Button
                  size="lg"
                  className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20 hover:shadow-none transition-all duration-300"
                  onClick={() => {
                    setSubmitted(false);
                    setRefNumber("");
                  }}
                >
                  {strings.submitNew}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ── Form ── */
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {strings.title}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base font-medium">
                {strings.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type Selection (Individual vs Family) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  onClick={() => setValue("is_family_visa", false)}
                  className={`relative flex cursor-pointer gap-4 rounded-2xl border p-5 transition-all duration-300 hover:shadow-md ${
                    !isFamilyVisa
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
                      !isFamilyVisa
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{strings.individualTitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {strings.individualDesc}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setValue("is_family_visa", true)}
                  className={`relative flex cursor-pointer gap-4 rounded-2xl border p-5 transition-all duration-300 hover:shadow-md ${
                    isFamilyVisa
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-sm"
                      : "bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
                      isFamilyVisa
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{strings.familyTitle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {strings.familyDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Form Card */}
              <Card className="border shadow-lg shadow-foreground/5 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />
                <CardContent className="p-6 sm:p-8 space-y-6">
                  {/* Name & Phone */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="full_name"
                        className="text-sm font-semibold flex items-center gap-1.5"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        {strings.nameLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        placeholder={strings.namePlaceholder}
                        className={`rounded-xl h-11 border ${errors.full_name ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                        {...register("full_name")}
                      />
                      {errors.full_name?.message && (
                        <p className="text-xs font-semibold text-destructive mt-1">
                          {errors.full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold flex items-center gap-1.5"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {strings.phoneLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={strings.phonePlaceholder}
                        className={`rounded-xl h-11 border ${errors.phone ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                        {...register("phone")}
                      />
                      {errors.phone?.message && (
                        <p className="text-xs font-semibold text-destructive mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Job / Occupation */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="occupation"
                      className="text-sm font-semibold flex items-center gap-1.5"
                    >
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {strings.jobLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="occupation"
                      placeholder={strings.jobPlaceholder}
                      className={`rounded-xl h-11 border ${errors.occupation ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                      {...register("occupation")}
                    />
                    {errors.occupation?.message && (
                      <p className="text-xs font-semibold text-destructive mt-1">
                        {errors.occupation.message}
                      </p>
                    )}
                  </div>

                  {/* City & Destination Country */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="city"
                        className="text-sm font-semibold flex items-center gap-1.5"
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {strings.cityLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder={strings.cityPlaceholder}
                        className={`rounded-xl h-11 border ${errors.city ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                        {...register("city")}
                      />
                      {errors.city?.message && (
                        <p className="text-xs font-semibold text-destructive mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="destination_country"
                        className="text-sm font-semibold flex items-center gap-1.5"
                      >
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        {strings.countryLabel} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="destination_country"
                        placeholder={strings.countryPlaceholder}
                        className={`rounded-xl h-11 border ${errors.destination_country ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                        {...register("destination_country")}
                      />
                      {errors.destination_country?.message && (
                        <p className="text-xs font-semibold text-destructive mt-1">
                          {errors.destination_country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bank Account Switch/Selection */}
                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                      {strings.bankLabel} <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="has_bank_account"
                      render={({ field }) => (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all duration-300 ${
                              field.value === true
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                                : "bg-card text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                field.value === true
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {field.value === true && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                              )}
                            </span>
                            {strings.bankYes}
                          </button>

                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all duration-300 ${
                              field.value === false
                                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                                : "bg-card text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                field.value === false
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {field.value === false && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                              )}
                            </span>
                            {strings.bankNo}
                          </button>
                        </div>
                      )}
                    />
                  </div>

                  {/* Conditional Family Information */}
                  {isFamilyVisa && (
                    <div className="space-y-6 pt-6 border-t border-dashed animate-in fade-in slide-in-from-top-3 duration-300">
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        {isAr ? "بيانات العائلة" : "Family Details"}
                      </h3>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="spouse_full_name" className="text-sm font-semibold">
                            {strings.spouseLabel} <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="spouse_full_name"
                            placeholder={strings.spousePlaceholder}
                            className={`rounded-xl h-11 border ${errors.spouse_full_name ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"}`}
                            {...register("spouse_full_name")}
                          />
                          {errors.spouse_full_name?.message && (
                            <p className="text-xs font-semibold text-destructive mt-1">
                              {errors.spouse_full_name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="number_of_children" className="text-sm font-semibold">
                            {strings.childrenLabel}
                          </Label>
                          <Input
                            id="number_of_children"
                            type="number"
                            min="0"
                            placeholder="0"
                            className="rounded-xl h-11 border focus-visible:ring-primary"
                            {...register("number_of_children")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="children_info" className="text-sm font-semibold">
                          {strings.childrenInfoLabel}
                        </Label>
                        <textarea
                          id="children_info"
                          placeholder={strings.childrenInfoPlaceholder}
                          rows={3}
                          className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          {...register("children_info")}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit & Security footer */}
              <div className="flex flex-col items-center gap-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:px-12 h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? strings.submittingBtn : strings.submitBtn}
                  {!isSubmitting && <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
                </Button>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  {strings.securedText}
                </p>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
