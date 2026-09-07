import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

/* One shared frame for every icon: same box, same stroke weight, so the
   eight of them read as a set. Only the paths differ. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-accent"
    >
      {children}
    </svg>
  );
}

const BENEFITS = [
  {
    title: "فنيون ومختصون",
    description: "فريق مدرَّب لكل تخصص، بلا وسطاء.",
    icon: (
      <Icon>
        <circle cx="9.5" cy="8" r="3.5" />
        <path d="M3.5 19v-1.2A4.3 4.3 0 0 1 7.8 13.5h3.4a4.3 4.3 0 0 1 4.3 4.3V19" />
        <path d="M16.2 5.4a3.3 3.3 0 0 1 0 6.2" />
        <path d="M17.6 14a4 4 0 0 1 2.9 3.8V19" />
      </Icon>
    ),
  },
  {
    title: "جودة في التنفيذ",
    description: "مواد وأعمال تُسلَّم على الأصول.",
    icon: (
      <Icon>
        <circle cx="12" cy="9" r="5.5" />
        <path d="M8.4 13.6 7.2 21l4.8-2.7 4.8 2.7-1.2-7.4" />
      </Icon>
    ),
  },
  {
    title: "سرعة الاستجابة",
    description: "نرد على طلبك ونحدّد الموعد بسرعة.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.2V12l3.2 1.9" />
      </Icon>
    ),
  },
  {
    title: "أسعار واضحة",
    description: "عرض سعر مفصّل قبل بدء العمل.",
    icon: (
      <Icon>
        <path d="M20.4 12.9 12.9 20.4a1.7 1.7 0 0 1-2.4 0l-6.5-6.5a1.7 1.7 0 0 1-.5-1.2V5a1.6 1.6 0 0 1 1.6-1.6h7.7c.5 0 .9.2 1.2.5l6.4 6.4a1.7 1.7 0 0 1 0 2.6Z" />
        <path d="M8 8h.01" />
      </Icon>
    ),
  },
  {
    title: "متابعة الطلب أول بأول",
    description: "تعرف حالة طلبك في كل مرحلة.",
    icon: (
      <Icon>
        <path d="M3 12.6h3.6l2.2-6.2 4.2 12 2.4-5.8H21" />
      </Icon>
    ),
  },
  {
    title: "خدمة ما بعد التنفيذ",
    description: "نبقى معك بعد التسليم، لا ينتهي الدور بالتسليم.",
    icon: (
      <Icon>
        <path d="M4.5 14.6v-2.4a7.5 7.5 0 0 1 15 0v2.4" />
        <rect x="2.8" y="13.4" width="3.6" height="6" rx="1.8" />
        <rect x="17.6" y="13.4" width="3.6" height="6" rx="1.8" />
      </Icon>
    ),
  },
  {
    title: "ضمان حسب نوع الخدمة",
    description: "ضمان مكتوب على الأعمال المشمولة.",
    icon: (
      <Icon>
        <path d="M12 3.2 5.2 5.8v5.5c0 4.1 2.8 7.3 6.8 9.1 4-1.8 6.8-5 6.8-9.1V5.8L12 3.2Z" />
        <path d="m9.2 11.9 2 2 3.6-4.1" />
      </Icon>
    ),
  },
  {
    title: "حلول متكاملة في مكان واحد",
    description: "كل الخدمات من جهة واحدة مسؤولة.",
    icon: (
      <Icon>
        <path d="M12 3.4 3.6 7.7 12 12l8.4-4.3L12 3.4Z" />
        <path d="m3.6 12 8.4 4.3L20.4 12" />
        <path d="m3.6 16.3 8.4 4.3 8.4-4.3" />
      </Icon>
    ),
  },
] as const;

export function HomeWhy() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="bg-bg pb-section scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            id="why-heading"
            kicker="لماذا الفهدار"
            title="لماذا يختارنا عملاؤنا؟"
            lead="نلتزم بالجودة والوضوح في كل خطوة، من أول تواصل حتى ما بعد التنفيذ."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <li key={benefit.title}>
              <Reveal
                delay={index * 70}
                className="h-full border-t border-line pt-6"
              >
                {benefit.icon}
                <h3 className="mt-5 text-step-0 font-semibold tracking-tight">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-step--1 text-muted">
                  {benefit.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
