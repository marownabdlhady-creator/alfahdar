import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestForm } from "@/components/request-form";
import { RequestTrust } from "@/components/request-trust";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "اطلب خدمة | الفهدار",
  description:
    "اطلب خدمة مقاولات، تشطيبات، أعمال فنية، صيانة أو توريد مواد من الفهدار. املأ النموذج ويتواصل معك فريقنا لتأكيد التفاصيل وتحديد الموعد.",
  alternates: { canonical: "/request" },
};

export default function RequestPage() {
  return (
    <section className="bg-bg pt-28 pb-section lg:pt-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* The form is the page. On desktop it takes two of three columns
            and starts on the first row, so its opening fields sit above
            the fold; the compact intro and the trust panel stack in the
            narrow right column. On mobile the source order stands —
            intro, form, trust — so the fields start high.

            min-w-0 on every item: a grid item is min-width:auto by default,
            so the single mobile column would be sized by the form's
            min-content width and run off the edge of the screen. */}
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start lg:gap-10">
          <Reveal className="min-w-0 lg:col-start-1 lg:row-start-1">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-0.5 w-8 shrink-0 bg-accent" />
              <span className="text-step--1 tracking-[0.14em] text-muted">
                اطلب خدمة
              </span>
            </div>

            <h1 className="mt-4 text-step-2 font-bold tracking-tight">
              اطلب خدمتك الآن
            </h1>

            <p className="mt-3 max-w-[44ch] text-step--1 text-muted">
              املأ النموذج التالي وسيتواصل معك فريق الفهدار في أقرب وقت.
            </p>
          </Reveal>

          <div className="min-w-0 lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            {/* useSearchParams (the ?service= preselect) needs a boundary. */}
            <Suspense
              fallback={
                <div
                  aria-hidden
                  className="min-h-[32rem] rounded-2xl border border-line bg-surface"
                />
              }
            >
              <RequestForm />
            </Suspense>
          </div>

          <Reveal delay={90} className="min-w-0 lg:col-start-1 lg:row-start-2">
            <RequestTrust />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
