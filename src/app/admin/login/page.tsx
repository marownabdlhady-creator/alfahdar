import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/login-form";
import { BrandLogo } from "@/components/brand-logo";
import { BRAND } from "@/lib/nav";

export const metadata: Metadata = {
  title: "تسجيل الدخول | لوحة تحكم الفهدار",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center">
          {/* Light page, so the ink silhouette. inline-block keeps the
              logo inside the centred column instead of filling it. */}
          <Link
            href="/"
            aria-label={`${BRAND.name} — الصفحة الرئيسية`}
            className="inline-block transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent"
          >
            <BrandLogo eager backdrop="light" className="h-11" />
          </Link>
        </div>

        <div className="mt-7 rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(13,13,13,0.03)] sm:p-9">
          <span aria-hidden className="block h-0.5 w-10 bg-accent" />

          <h1 className="mt-5 text-step-2 font-bold tracking-tight">
            لوحة التحكم
          </h1>
          <p className="mt-2 text-step--1 text-muted">
            الدخول مخصص لفريق الفهدار.
          </p>

          {/* The form reads ?from=, which needs a boundary to prerender. */}
          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-step--1 text-muted">
          <Link
            href="/"
            className="transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            العودة إلى الموقع
          </Link>
        </p>
      </div>
    </main>
  );
}
