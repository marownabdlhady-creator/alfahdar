"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useController, useForm, type Control } from "react-hook-form";

import { StarIcon, TOTAL_STARS } from "@/components/review-stars";
import {
  REVIEW_MAX_COMMENT,
  REVIEW_SERVICE_LABELS,
  reviewSchema,
  type ReviewErrorResponse,
  type ReviewValues,
} from "@/lib/validations/review";

const NETWORK_ERROR = "حدث خطأ أثناء إرسال تقييمك، برجاء المحاولة مرة أخرى.";

/* text-step-0 never drops below 16px, so iOS won't zoom on focus. */
const FIELD =
  "block w-full min-w-0 max-w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent aria-[invalid=true]:border-danger sm:px-4";

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60 sm:px-8";

const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-4 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-8";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-step--1 font-medium">
        {label}
        <span aria-hidden className="text-accent">
          {" *"}
        </span>
      </label>

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

/** A visitor's own rating. Five radios in a group rather than buttons: the
    browser gives arrow-key navigation and a single tab stop for free, and
    the label wrapping each one keeps the whole star clickable.

    Controlled through useController rather than register(): a radio's DOM
    value is a string, and react-hook-form reads radio groups straight off
    the DOM — setValueAs and valueAsNumber are both skipped for them — so a
    registered group would hand the resolver "5" where the schema wants 5.
    Holding the value in the form state instead keeps it a number. */
function RatingInput({ control }: { control: Control<ReviewValues> }) {
  const { field, fieldState } = useController({ control, name: "rating" });

  return (
    <fieldset>
      <legend className="block text-step--1 font-medium">
        التقييم
        <span aria-hidden className="text-accent">
          {" *"}
        </span>
      </legend>

      <div className="mt-2 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STARS }, (_, index) => {
          const star = index + 1;

          return (
            <label
              key={star}
              className="cursor-pointer rounded p-0.5"
              title={`${star} من ${TOTAL_STARS}`}
            >
              <input
                type="radio"
                name={field.name}
                value={star}
                checked={field.value === star}
                onChange={() => field.onChange(star)}
                onBlur={field.onBlur}
                aria-describedby="rating-error"
                className="peer sr-only"
              />
              <span className="block rounded peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                <StarIcon
                  filled={star <= field.value}
                  className="h-8 w-8 transition-colors duration-fast ease-out"
                />
              </span>
              <span className="sr-only">{`${star} من ${TOTAL_STARS}`}</span>
            </label>
          );
        })}
      </div>

      <p
        id="rating-error"
        role="alert"
        className="mt-1.5 min-h-5 text-step--1 break-words text-danger"
      >
        {fieldState.error?.message}
      </p>
    </fieldset>
  );
}

export function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    mode: "onBlur",
    defaultValues: {
      clientName: "",
      serviceLabel: "",
      rating: 0,
      comment: "",
    },
  });

  const onSubmit = async (values: ReviewValues) => {
    setSubmitError("");

    let response: Response;
    try {
      response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      setSubmitError(NETWORK_ERROR);
      return;
    }

    if (response.ok) {
      reset();
      setSent(true);
      return;
    }

    /* Client validation catches these first; this is the safety net for
       anything the server rejects that the browser let through. What the
       visitor typed stays in the form either way. */
    const problem = (await response
      .json()
      .catch(() => null)) as ReviewErrorResponse | null;

    if (response.status === 400 && problem?.fieldErrors) {
      for (const [field, messages] of Object.entries(problem.fieldErrors)) {
        const message = messages?.[0];
        if (message) setError(field as keyof ReviewValues, { message });
      }
    }

    setSubmitError(problem?.error ?? NETWORK_ERROR);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-accent/40 bg-surface p-7 text-center sm:p-9">
        <p className="text-step-1 font-semibold tracking-tight">شكراً لك!</p>
        <p className="mt-3 text-step-0 text-muted">
          سيظهر تقييمك بعد مراجعته من فريقنا.
        </p>

        <button
          type="button"
          onClick={() => {
            setSent(false);
            setOpen(false);
          }}
          className={`${SECONDARY_CTA} mt-7`}
        >
          تم
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={PRIMARY_CTA}
        >
          أضف تقييمك
        </button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-5 sm:p-8"
    >
      <h3 className="text-step-1 font-semibold tracking-tight">شاركنا رأيك</h3>
      <p className="mt-2 text-step--1 text-muted">
        يُنشر تقييمك بعد مراجعته من فريقنا.
      </p>

      <div className="mt-7 space-y-5">
        <Field id="clientName" label="الاسم" error={errors.clientName?.message}>
          <input
            id="clientName"
            type="text"
            autoComplete="name"
            placeholder="مثال: عبدالله الشمري"
            aria-required="true"
            aria-invalid={Boolean(errors.clientName)}
            aria-describedby="clientName-error"
            className={FIELD}
            {...register("clientName")}
          />
        </Field>

        <Field
          id="serviceLabel"
          label="نوع الخدمة"
          error={errors.serviceLabel?.message}
        >
          <select
            id="serviceLabel"
            aria-required="true"
            aria-invalid={Boolean(errors.serviceLabel)}
            aria-describedby="serviceLabel-error"
            className={FIELD}
            {...register("serviceLabel")}
          >
            <option value="">اختر نوع الخدمة</option>
            {REVIEW_SERVICE_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <RatingInput control={control} />

        <Field id="comment" label="تعليقك" error={errors.comment?.message}>
          <textarea
            id="comment"
            rows={4}
            maxLength={REVIEW_MAX_COMMENT}
            placeholder="اكتب تجربتك مع الفهدار."
            aria-required="true"
            aria-invalid={Boolean(errors.comment)}
            aria-describedby="comment-error"
            className={`${FIELD} resize-y`}
            {...register("comment")}
          />
        </Field>
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-danger bg-bg p-4 text-step--1 break-words text-danger"
        >
          {submitError}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${PRIMARY_CTA} w-full sm:w-auto`}
        >
          {isSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
        </button>

        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitError("");
            setOpen(false);
          }}
          disabled={isSubmitting}
          className={`${SECONDARY_CTA} w-full sm:w-auto`}
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
