"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Reveal } from "@/components/reveal";
import {
  CITIES,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
  SERVICE_SLUGS,
  requestSchema,
  type RequestValues,
} from "@/lib/request-schema";
import { SERVICES } from "@/lib/services";

/* --- Shared classes ---------------------------------------------- */

/* text-step-0 never drops below 16px, so iOS won't zoom on focus. */
const FIELD =
  "block w-full min-w-0 max-w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent aria-[invalid=true]:border-danger sm:px-4";

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-8";

const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-4 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-8";

/* --- Icons -------------------------------------------------------- */

function Stroke({
  children,
  className = "h-6 w-6 text-accent",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function VideoIcon() {
  return (
    <Stroke className="h-5 w-5 shrink-0 text-muted">
      <rect x="2.8" y="6" width="12.4" height="12" rx="2.2" />
      <path d="m15.2 10.6 5-2.6v8l-5-2.6" />
    </Stroke>
  );
}

function CloseIcon() {
  return (
    <Stroke className="h-4 w-4 text-ink">
      <path d="m6 6 12 12M18 6 6 18" />
    </Stroke>
  );
}

function PlusIcon() {
  return (
    <Stroke className="h-5 w-5 shrink-0 text-accent">
      <path d="M12 5v14M5 12h14" />
    </Stroke>
  );
}

/* --- Small building blocks ---------------------------------------- */

function FormSection({
  legend,
  children,
}: {
  legend: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-t border-line pt-9 first:border-t-0 first:pt-0">
      <legend className="mb-7 text-step--1 font-semibold tracking-[0.14em] text-muted">
        {legend}
      </legend>
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}

function Field({
  id,
  label,
  required = false,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-step--1 font-medium">
        {label}
        {required && (
          <span aria-hidden className="text-accent">
            {" *"}
          </span>
        )}
      </label>

      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-step--1 text-muted">
          {hint}
        </p>
      )}

      <div className="mt-2">{children}</div>

      {/* Always rendered, so an error never shifts the layout. */}
      <p
        id={`${id}-error`}
        role="alert"
        className="mt-1.5 min-h-5 text-step--1 break-words text-danger"
      >
        {error}
      </p>
    </div>
  );
}

/* --- Attachments --------------------------------------------------- */

type Attachment = {
  id: string;
  file: File;
  /** Object URL for images; null for video (shown as a chip). */
  previewUrl: string | null;
};

/** TEMPORARY. The real request number comes from the backend once the
    submission is wired; this only makes the success state feel real. */
function makeReference() {
  return `ALF-${(Date.now() % 10000).toString().padStart(4, "0")}`;
}

/* --- The form ------------------------------------------------------ */

export function RequestForm() {
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("service") ?? "";
  const preselectedService = SERVICE_SLUGS.includes(requestedService)
    ? requestedService
    : "";

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  // TODO: wire real upload (Vercel Blob) in backend phase.
  const attachmentsRef = useRef<Attachment[]>([]);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(
    () => () => {
      for (const item of attachmentsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    },
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "",
      service: preselectedService,
      description: "",
      urgent: false,
      city: "",
      district: "",
      address: "",
      preferredAt: "",
      notes: "",
    },
  });

  /* Object URLs are created here rather than inside a state updater, so
     a double-invoked updater can never leak them or duplicate an entry. */
  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    // Clearing lets the same file be picked again after a removal.
    event.target.value = "";
    if (picked.length === 0) return;

    const accepted: Attachment[] = [];
    const taken = new Set(attachments.map((item) => item.id));
    let room = MAX_FILES - attachments.length;
    let message = "";

    for (const file of picked) {
      const id = `${file.name}-${file.lastModified}-${file.size}`;
      if (taken.has(id)) continue;

      if (room === 0) {
        message = `يمكنك إرفاق ${MAX_FILES} ملفات كحد أقصى.`;
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        message = `الملف «${file.name}» أكبر من ${MAX_FILE_MB} ميجابايت.`;
        continue;
      }

      accepted.push({
        id,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      });
      taken.add(id);
      room -= 1;
    }

    if (accepted.length > 0) {
      setAttachments((current) => [...current, ...accepted]);
    }
    setFileError(message);
  };

  const removeFile = (id: string) => {
    const target = attachments.find((item) => item.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setAttachments((current) => current.filter((item) => item.id !== id));
    setFileError("");
  };

  const clearAttachments = () => {
    for (const item of attachments) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    }
    setAttachments([]);
    setFileError("");
  };

  const onSubmit = async (values: RequestValues) => {
    // TODO: POST `values` and `attachments` to the API in the backend phase.
    void values;
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReference(makeReference());
  };

  const startOver = () => {
    clearAttachments();
    reset();
    setReference(null);
  };

  if (reference) {
    return (
      <Reveal>
        <div className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-10 lg:p-14">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent">
            <Stroke className="h-8 w-8 text-accent">
              <path d="m5 12.6 4.4 4.4L19 7" />
            </Stroke>
          </span>

          <h2 className="mt-7 text-step-2 font-bold tracking-tight">
            تم استلام طلبك بنجاح
          </h2>
          <p className="mt-3 text-step-0 text-muted">
            سيتواصل معك فريق الفهدار في أقرب وقت.
          </p>

          <p className="mt-7 inline-flex max-w-full flex-col items-center gap-1 rounded-xl border border-line px-6 py-4 sm:px-7">
            <span className="text-step--1 text-muted">رقم الطلب</span>
            <span dir="ltr" className="text-step-1 font-semibold tracking-wide">
              {reference}
            </span>
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={startOver} className={PRIMARY_CTA}>
              طلب خدمة أخرى
            </button>
            <Link href="/" className={SECONDARY_CTA}>
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-9 rounded-2xl border border-line bg-surface p-5 sm:p-8 lg:p-10"
      >
        <FormSection legend="بياناتك">
          <Field
            id="fullName"
            label="الاسم الكامل"
            required
            error={errors.fullName?.message}
          >
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="مثال: عبدالله الشمري"
              aria-required="true"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby="fullName-error"
              className={FIELD}
              {...register("fullName")}
            />
          </Field>

          <Field
            id="phone"
            label="رقم الجوال"
            required
            error={errors.phone?.message}
          >
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="05XXXXXXXX"
              aria-required="true"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby="phone-error"
              className={`${FIELD} text-right`}
              {...register("phone")}
            />
          </Field>
        </FormSection>

        <FormSection legend="تفاصيل الخدمة">
          <Field
            id="service"
            label="نوع الخدمة"
            required
            error={errors.service?.message}
          >
            <select
              id="service"
              aria-required="true"
              aria-invalid={Boolean(errors.service)}
              aria-describedby="service-error"
              className={FIELD}
              {...register("service")}
            >
              <option value="">اختر نوع الخدمة</option>
              {SERVICES.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="description"
            label="وصف المشكلة أو المشروع"
            required
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={5}
              placeholder="اشرح لنا ما تحتاجه بالتفصيل: نوع العمل، المساحة التقريبية، أو وصف العطل ومتى بدأ."
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby="description-error"
              className={`${FIELD} resize-y`}
              {...register("description")}
            />
          </Field>

          <div>
            <span className="block text-step--1 font-medium">
              صور أو فيديو للموقع/العطل
            </span>
            <p id="attachments-hint" className="mt-1.5 text-step--1 text-muted">
              يمكنك إرفاق صور أو فيديو للعطل أو المكان لمساعدتنا على فهم طلبك
              (اختياري). حتى {MAX_FILES} ملفات، بحد أقصى {MAX_FILE_MB}{" "}
              ميجابايت لكل ملف.
            </p>

            <div className="mt-3">
              <input
                id="attachments"
                type="file"
                multiple
                accept="image/*,video/*"
                aria-describedby="attachments-hint attachments-error"
                onChange={addFiles}
                className="peer sr-only"
              />
              <label
                htmlFor="attachments"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-bg px-4 py-6 text-center text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
              >
                <PlusIcon />
                إضافة صور أو فيديو
              </label>
            </div>

            {attachments.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {attachments.map((item) => (
                  <li key={item.id} className="relative min-w-0">
                    {item.previewUrl ? (
                      <span className="block aspect-square overflow-hidden rounded-lg border border-line">
                        {/* Local object URL, so next/image adds nothing here. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.previewUrl}
                          alt={`معاينة ${item.file.name}`}
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ) : (
                      <span className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-line bg-bg p-3 text-center">
                        <VideoIcon />
                        <span className="line-clamp-2 text-step--1 break-all text-muted">
                          {item.file.name}
                        </span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      aria-label={`إزالة الملف ${item.file.name}`}
                      className="absolute top-2 left-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface transition-colors duration-fast ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <CloseIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p
              id="attachments-error"
              role="alert"
              className="mt-1.5 min-h-5 text-step--1 break-words text-danger"
            >
              {fileError}
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-bg p-4 transition-colors duration-fast ease-out has-[:checked]:border-accent">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 accent-accent"
              {...register("urgent")}
            />
            <span>
              <span className="block text-step-0 font-medium">طلب عاجل</span>
              <span className="mt-1 block text-step--1 text-muted">
                سنحاول ترتيب أقرب موعد ممكن لطلبك.
              </span>
            </span>
          </label>
        </FormSection>

        <FormSection legend="الموقع">
          <Field
            id="city"
            label="المدينة"
            required
            error={errors.city?.message}
          >
            <select
              id="city"
              aria-required="true"
              aria-invalid={Boolean(errors.city)}
              aria-describedby="city-error"
              className={FIELD}
              {...register("city")}
            >
              <option value="">اختر المدينة</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="district"
            label="الحي"
            required
            error={errors.district?.message}
          >
            <input
              id="district"
              type="text"
              placeholder="مثال: حي النرجس"
              aria-required="true"
              aria-invalid={Boolean(errors.district)}
              aria-describedby="district-error"
              className={FIELD}
              {...register("district")}
            />
          </Field>

          <Field
            id="address"
            label="العنوان التفصيلي"
            hint="اختياري — الشارع، رقم المبنى، علامة مميزة قريبة."
            error={errors.address?.message}
          >
            <textarea
              id="address"
              rows={3}
              placeholder="الشارع، رقم المبنى، علامة مميزة قريبة..."
              aria-describedby="address-hint address-error"
              className={`${FIELD} resize-y`}
              {...register("address")}
            />
          </Field>
        </FormSection>

        <FormSection legend="الموعد">
          <Field
            id="preferredAt"
            label="الموعد المناسب"
            hint="اختياري — الوقت الذي يناسبك للزيارة."
            error={errors.preferredAt?.message}
          >
            <input
              id="preferredAt"
              type="datetime-local"
              dir="ltr"
              aria-describedby="preferredAt-hint preferredAt-error"
              className={`${FIELD} text-right`}
              {...register("preferredAt")}
            />
          </Field>

          <Field
            id="notes"
            label="ملاحظات إضافية"
            hint="اختياري — أي تفاصيل أخرى تودّ إخبارنا بها."
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={3}
              aria-describedby="notes-hint notes-error"
              className={`${FIELD} resize-y`}
              {...register("notes")}
            />
          </Field>
        </FormSection>

        <div className="border-t border-line pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${PRIMARY_CTA} w-full sm:w-auto`}
          >
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </button>
          <p className="mt-4 text-step--1 text-muted">
            الحقول المعلَّمة بـ
            <span aria-hidden className="text-accent">
              {" * "}
            </span>
            مطلوبة.
          </p>
        </div>
      </form>
    </Reveal>
  );
}
