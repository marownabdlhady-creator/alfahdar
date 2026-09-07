import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestForm } from "@/components/request-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "اطلب خدمة | الفهدار",
  description:
    "اطلب خدمة مقاولات، تشطيبات، أعمال فنية، صيانة أو توريد مواد من الفهدار. املأ النموذج ويتواصل معك فريقنا لتأكيد التفاصيل وتحديد الموعد.",
  alternates: { canonical: "/request" },
};

export default function RequestPage() {
  return (
    <section className="bg-bg pt-32 pb-section lg:pt-40">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="h-0.5 w-10 shrink-0 bg-accent sm:w-14"
            />
            <span className="text-step--1 tracking-[0.14em] text-muted">
              اطلب خدمة
            </span>
          </div>

          <h1 className="mt-6 text-step-4 font-bold tracking-tight">
            اطلب خدمتك الآن
          </h1>

          <p className="mt-5 max-w-[52ch] text-step-0 text-muted">
            املأ النموذج التالي وسيتواصل معك فريق الفهدار في أقرب وقت.
          </p>
        </Reveal>

        <div className="mt-12">
          {/* useSearchParams (the ?service= preselect) needs a boundary. */}
          <Suspense
            fallback={
              <div
                aria-hidden
                className="min-h-[40rem] rounded-2xl border border-line bg-surface"
              />
            }
          >
            <RequestForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
