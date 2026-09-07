import type { ReactNode } from "react";

function Stroke({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 shrink-0 text-accent"
    >
      {children}
    </svg>
  );
}

const TRUST_POINTS = [
  {
    title: "رد سريع من فريقنا",
    description: "نتواصل معك لتأكيد التفاصيل وتحديد الموعد.",
    icon: (
      <Stroke>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.2V12l3.2 1.9" />
      </Stroke>
    ),
  },
  {
    title: "فنيون مختصون",
    description: "فريق مدرَّب لكل تخصص، بلا وسطاء.",
    icon: (
      <Stroke>
        <circle cx="9.5" cy="8" r="3.5" />
        <path d="M3.5 19v-1.2A4.3 4.3 0 0 1 7.8 13.5h3.4a4.3 4.3 0 0 1 4.3 4.3V19" />
        <path d="M16.2 5.4a3.3 3.3 0 0 1 0 6.2" />
        <path d="M17.6 14a4 4 0 0 1 2.9 3.8V19" />
      </Stroke>
    ),
  },
  {
    title: "أسعار واضحة",
    description: "عرض سعر مفصّل قبل بدء العمل.",
    icon: (
      <Stroke>
        <path d="M20.4 12.9 12.9 20.4a1.7 1.7 0 0 1-2.4 0l-6.5-6.5a1.7 1.7 0 0 1-.5-1.2V5a1.6 1.6 0 0 1 1.6-1.6h7.7c.5 0 .9.2 1.2.5l6.4 6.4a1.7 1.7 0 0 1 0 2.6Z" />
        <path d="M8 8h.01" />
      </Stroke>
    ),
  },
] as const;

export function RequestTrust() {
  return (
    <aside
      aria-label="لماذا تطلب من الفهدار"
      className="rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      <h2 className="text-step-0 font-semibold tracking-tight">
        لماذا تطلب من الفهدار
      </h2>

      <ul className="mt-5 space-y-5">
        {TRUST_POINTS.map((point) => (
          <li key={point.title} className="flex items-start gap-3.5">
            {point.icon}
            <span>
              <span className="block text-step--1 font-medium">
                {point.title}
              </span>
              <span className="mt-1 block text-step--1 text-muted">
                {point.description}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* TODO: real WhatsApp number in the contact phase. */}
      <a
        href="#"
        className="mt-7 flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Stroke>
          <path d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.3-4.5A8.5 8.5 0 1 1 20.5 11.7Z" />
          <path d="M9 9.4c.3 2.6 2.6 4.9 5.2 5.2.5 0 1-.4 1-1v-.7l-1.8-.6-.8.8a6.4 6.4 0 0 1-2.1-2.1l.8-.8-.6-1.8h-.7c-.6 0-1 .4-1 1Z" />
        </Stroke>
        تواصل عبر واتساب
      </a>
    </aside>
  );
}
