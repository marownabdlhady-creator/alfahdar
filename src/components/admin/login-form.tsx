"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  adminLoginSchema,
  type AdminLoginErrorResponse,
  type AdminLoginValues,
} from "@/lib/validations/admin-login";

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، برجاء المحاولة مرة أخرى.";

/* text-step-0 never drops below 16px, so iOS won't zoom on focus. */
const FIELD =
  "block w-full min-w-0 max-w-full rounded-lg border border-line bg-surface px-3.5 py-3 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent aria-[invalid=true]:border-danger sm:px-4";

const SUBMIT =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M2.6 12S5.9 5.9 12 5.9 21.4 12 21.4 12 18.1 18.1 12 18.1 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.7" />
      {hidden && <path d="m4.5 19.5 15-15" />}
    </svg>
  );
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: AdminLoginValues) => {
    setSubmitError("");

    let response: Response;
    try {
      response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      setSubmitError(NETWORK_ERROR);
      return;
    }

    if (response.ok) {
      /* Back where they were headed before the redirect, or the dashboard.
         Only same-site paths are honoured, so ?from= can't be used to bounce
         someone to another origin. */
      const from = searchParams.get("from");
      const target = from?.startsWith("/admin") ? from : "/admin";

      router.replace(target);
      router.refresh();
      return;
    }

    const problem = (await response
      .json()
      .catch(() => null)) as AdminLoginErrorResponse | null;

    setSubmitError(problem?.error ?? NETWORK_ERROR);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8">
      <div>
        <label htmlFor="email" className="block text-step--1 font-medium">
          البريد الإلكتروني
        </label>
        <div className="mt-2">
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            dir="ltr"
            placeholder="name@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="email-error"
            className={`${FIELD} text-start`}
            {...register("email")}
          />
        </div>
        {/* Always rendered, so an error never shifts the layout. */}
        <p
          id="email-error"
          role="alert"
          className="mt-1.5 min-h-5 text-step--1 break-words text-danger"
        >
          {errors.email?.message}
        </p>
      </div>

      <div className="mt-3">
        <label htmlFor="password" className="block text-step--1 font-medium">
          كلمة المرور
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            dir="ltr"
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-error"
            className={`${FIELD} pe-12 text-start`}
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 end-0 inline-flex w-12 items-center justify-center text-muted transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <EyeIcon hidden={showPassword} />
          </button>
        </div>
        <p
          id="password-error"
          role="alert"
          className="mt-1.5 min-h-5 text-step--1 break-words text-danger"
        >
          {errors.password?.message}
        </p>
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-step--1 break-words text-danger"
        >
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className={`${SUBMIT} mt-6`}>
        {isSubmitting ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
