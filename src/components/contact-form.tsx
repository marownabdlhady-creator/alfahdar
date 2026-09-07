"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { contactSchema, type ContactValues } from "@/lib/contact-schema";

/* --- Shared classes ---------------------------------------------- */

/* text-step-0 never drops below 16px, so iOS won't zoom on focus. */
const FIELD =
  "block w-full min-w-0 max-w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent aria-[invalid=true]:border-danger sm:px-4";

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-8";

const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-4 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-8";

/* --- Small building blocks ---------------------------------------- */

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-accent"
    >
      <path d="m5 12.6 4.4 4.4L19 7" />
    </svg>
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

/* --- The form ------------------------------------------------------ */

export function ContactForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactValues) => {
    // TODO: wire to backend (contact messages) in backend phase — dashboard
    // will show these separately from service requests.
    void values;
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSent(true);
  };

  const startOver = () => {
    reset();
    setSent(false);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center sm:p-10 lg:p-14">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent">
          <CheckIcon />
        </span>

        <h2 className="mt-7 text-step-2 font-bold tracking-tight">
          تم إرسال رسالتك بنجاح
        </h2>
        <p className="mt-3 text-step-0 text-muted">سنرد عليك في أقرب وقت.</p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={startOver} className={PRIMARY_CTA}>
            إرسال رسالة أخرى
          </button>
          <Link href="/" className={SECONDARY_CTA}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-line bg-surface p-5 sm:p-8 lg:p-10"
    >
      <h2 className="text-step-1 font-semibold tracking-tight">
        أرسل لنا رسالة
      </h2>
      <p className="mt-2 text-step--1 text-muted">
        لأي استفسار عام — املأ النموذج وسنرد عليك في أقرب وقت.
      </p>

      <div className="mt-7 space-y-5">
        <Field id="name" label="الاسم" required error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="مثال: عبدالله الشمري"
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby="name-error"
            className={FIELD}
            {...register("name")}
          />
        </Field>

        <Field id="phone" label="رقم الجوال" required error={errors.phone?.message}>
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

        <Field
          id="email"
          label="البريد الإلكتروني"
          hint="اختياري — إن فضّلت الرد عبر البريد."
          error={errors.email?.message}
        >
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            placeholder="name@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="email-hint email-error"
            className={`${FIELD} text-right`}
            {...register("email")}
          />
        </Field>

        <Field
          id="subject"
          label="الموضوع"
          required
          error={errors.subject?.message}
        >
          <input
            id="subject"
            type="text"
            placeholder="مثال: استفسار عن عرض سعر"
            aria-required="true"
            aria-invalid={Boolean(errors.subject)}
            aria-describedby="subject-error"
            className={FIELD}
            {...register("subject")}
          />
        </Field>

        <Field
          id="message"
          label="رسالتك"
          required
          error={errors.message?.message}
        >
          <textarea
            id="message"
            rows={5}
            placeholder="اكتب استفسارك بالتفصيل وسنساعدك."
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby="message-error"
            className={`${FIELD} resize-y`}
            {...register("message")}
          />
        </Field>
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${PRIMARY_CTA} w-full sm:w-auto`}
        >
          {isSubmitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
        </button>
        <p className="mt-4 text-step--1 text-muted">
          الحقول المعلَّمة بـ
          <span aria-hidden className="text-accent">
            {" * "}
          </span>
          مطلوبة.
        </p>
      </div>

      {/* Inquiries and service requests stay in separate lanes. */}
      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-bg p-4">
        <p className="text-step--1 text-muted">هل تريد طلب خدمة؟</p>
        <Link
          href="/request"
          className="text-step--1 font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          اطلب خدمة
        </Link>
      </div>
    </form>
  );
}
