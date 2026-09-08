import type { Metadata } from "next";

import { Reveal } from "@/components/reveal";
import { WorkGallery } from "@/components/work-gallery";
import { WORK_ITEMS } from "@/lib/work";

export const metadata: Metadata = {
  title: "معرض أعمالنا | الفهدار",
  description:
    "معرض أعمال الفهدار: نماذج من مشاريعنا في التصميمات الهندسية، المقاولات والبناء، التشطيبات، الأعمال الفنية، الصيانة، توريد المواد والنظافة في السعودية.",
  keywords: [
    "أعمال الفهدار",
    "مشاريع مقاولات",
    "معرض تشطيبات",
    "أعمال بناء السعودية",
    "صيانة وخدمات فنية",
    "تصاميم هندسية",
  ],
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    /* No dark hero on this page, so it clears the fixed header itself. */
    <section aria-labelledby="work-title" className="bg-bg pt-28 pb-section lg:pt-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal className="min-w-0">
          <div className="flex items-center gap-4">
            <span aria-hidden className="h-0.5 w-10 shrink-0 bg-accent sm:w-14" />
            <span className="text-step--1 tracking-[0.14em] text-muted">
              أعمالنا
            </span>
          </div>

          <h1 id="work-title" className="mt-5 text-step-4 font-bold tracking-tight">
            معرض أعمالنا
          </h1>

          <p className="mt-4 max-w-[52ch] text-step-0 text-muted">
            نماذج من مشاريعنا في التصميمات الهندسية، المقاولات، التشطيبات،
            الصيانة، الخدمات الفنية والنظافة.
          </p>
        </Reveal>

        <div className="mt-9 min-w-0 lg:mt-12">
          <WorkGallery items={WORK_ITEMS} />
        </div>
      </div>
    </section>
  );
}
