import Link from "next/link";

import { Reveal } from "@/components/reveal";

const PRIMARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-8";

const SECONDARY_CTA =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-4 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-8";

export default function NotFound() {
  return (
    /* Renders inside the root layout, so the header and footer come with
       it. No dark hero here, so it clears the fixed header itself. */
    <section
      aria-labelledby="not-found-title"
      className="bg-bg pt-32 pb-section lg:pt-40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal className="min-w-0">
          <span aria-hidden className="block h-0.5 w-10 bg-accent sm:w-14" />

          {/* Decorative: the heading below carries the meaning. Digits are
              neutral, so they read left-to-right on their own. */}
          <p
            aria-hidden
            className="mt-8 font-inter text-step-6 leading-none font-bold tracking-tight text-accent/30"
          >
            404
          </p>

          <h1
            id="not-found-title"
            className="mt-6 text-step-4 font-bold tracking-tight"
          >
            الصفحة غير موجودة
          </h1>

          <p className="mt-4 max-w-[48ch] text-step-0 text-muted">
            عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className={PRIMARY_CTA}>
              العودة للرئيسية
            </Link>
            <Link href="/services" className={SECONDARY_CTA}>
              تصفّح خدماتنا
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
