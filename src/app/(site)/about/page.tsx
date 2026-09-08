import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/nav";
import { absoluteUrl } from "@/lib/site";

// TODO: replace About content with real company details from client.
// Everything below is professional placeholder copy: it deliberately avoids
// founding dates, project counts and named clients so the page reads as
// credible before the client supplies the specifics.

export const metadata: Metadata = {
  title: "من نحن | الفهدار",
  description:
    "من نحن — الفهدار شركة سعودية تقدّم حلولاً متكاملة في التصميمات الهندسية، المقاولات والبناء، التشطيبات، الأعمال الفنية، الصيانة، توريد المواد والنظافة في المملكة العربية السعودية، بجودة واحترافية وفريق مختص لكل تخصص.",
  keywords: [
    "من نحن",
    "الفهدار",
    "شركة مقاولات",
    "تشطيبات",
    "صيانة",
    "خدمات فنية",
    "شركة تنظيف",
    "تصميم معماري",
    "خدمات المنازل السعودية",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: BRAND.name,
    url: "/about",
    title: "من نحن | الفهدار",
    description:
      "الفهدار شركة سعودية تجمع التصميمات الهندسية والمقاولات والتشطيبات والصيانة والخدمات الفنية والنظافة تحت سقف واحد، بجودة والتزام ووضوح في كل مرحلة.",
    images: [{ url: "/fahdar2.jpg", alt: "أعمال الفهدار — الفهدار" }],
  },
};

/* --- Shared classes ---------------------------------------------- */

const CTA_ON_DARK =
  "inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const SECONDARY_ON_DARK =
  "inline-flex items-center rounded-full border border-ink-invert/30 px-8 py-3.5 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:border-ink-invert hover:bg-ink-invert/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

/* --- Icons -------------------------------------------------------- */

function ArrowIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

/* One shared frame for every value icon: same box, same stroke weight,
   so the six of them read as a set. Only the paths differ. */
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

/* --- Content ------------------------------------------------------ */

const PILLARS = [
  {
    title: "رؤيتنا",
    body: "أن نكون الوجهة الأولى الموثوقة في المملكة العربية السعودية لكل ما يحتاجه المكان — من أول حجر في المشروع حتى آخر لمسة في صيانته ونظافته — بمعايير تنفيذ ترتقي بمستوى الخدمة في السوق المحلي.",
  },
  {
    title: "رسالتنا",
    body: "أن نوفّر لعملائنا خدمات متكاملة بجودة عالية ووضوح كامل في الاتفاق والسعر والمواعيد، عبر فرق مختصة ومواد مختارة ومتابعة لا تنتهي بالتسليم، حتى يبقى التعامل معنا علاقة طويلة لا صفقة عابرة.",
  },
] as const;

const VALUES = [
  {
    title: "الجودة",
    description: "معايير تنفيذ ثابتة ومواد مختارة في كل عمل نسلّمه.",
    icon: (
      <Icon>
        <circle cx="12" cy="9" r="5.5" />
        <path d="M8.4 13.6 7.2 21l4.8-2.7 4.8 2.7-1.2-7.4" />
      </Icon>
    ),
  },
  {
    title: "الاحترافية",
    description: "فرق مختصة لكل تخصص، وتعامل منظّم من أول تواصل.",
    icon: (
      <Icon>
        <rect x="3" y="7.5" width="18" height="12" rx="2" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
        <path d="M3 12.5h18" />
      </Icon>
    ),
  },
  {
    title: "الالتزام بالمواعيد",
    description: "جدول واضح منذ البداية، وتسليم في الوقت المتفق عليه.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.2V12l3.2 1.9" />
      </Icon>
    ),
  },
  {
    title: "الشفافية والوضوح",
    description: "عرض سعر مفصّل ونطاق عمل مكتوب، بلا مفاجآت لاحقة.",
    icon: (
      <Icon>
        <path d="M2.6 12S5.9 5.9 12 5.9 21.4 12 21.4 12 18.1 18.1 12 18.1 2.6 12 2.6 12Z" />
        <circle cx="12" cy="12" r="2.7" />
      </Icon>
    ),
  },
  {
    title: "رضا العميل",
    description: "نقيس نجاحنا برضاك عن النتيجة وعن الطريق إليها.",
    icon: (
      <Icon>
        <path d="M20.2 6.6a4.6 4.6 0 0 0-6.6 0L12 8.2l-1.6-1.6a4.6 4.6 0 1 0-6.6 6.5l8.2 8.1 8.2-8.1a4.6 4.6 0 0 0 0-6.5Z" />
      </Icon>
    ),
  },
  {
    title: "الأمانة",
    description: "نصيحة صادقة بما يخدم مصلحتك، حتى لو كانت أقل كلفة لنا.",
    icon: (
      <Icon>
        <path d="M12 3.2 5.2 5.8v5.5c0 4.1 2.8 7.3 6.8 9.1 4-1.8 6.8-5 6.8-9.1V5.8L12 3.2Z" />
        <path d="m9.2 11.9 2 2 3.6-4.1" />
      </Icon>
    ),
  },
] as const;

/* ------------------------------------------------------------------ */

export default function AboutPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: absoluteUrl("/"),
    description:
      "شركة سعودية تقدّم حلولاً متكاملة في التصميمات الهندسية، المقاولات والبناء، التشطيبات، الأعمال الفنية، الصيانة، توريد المواد والنظافة.",
    slogan: BRAND.tagline,
    image: absoluteUrl("/fahdar2.jpg"),
    areaServed: {
      "@type": "Country",
      name: "المملكة العربية السعودية",
      identifier: "SA",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* --- Intro. No dark hero on this page, so it clears the fixed
              header itself. ------------------------------------------- */}
      <section
        aria-labelledby="about-title"
        className="bg-bg pt-28 pb-section-sm lg:pt-32"
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal className="min-w-0">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="h-0.5 w-10 shrink-0 bg-accent sm:w-14"
              />
              <span className="text-step--1 tracking-[0.14em] text-muted">
                من نحن
              </span>
            </div>

            <h1
              id="about-title"
              className="mt-5 text-step-4 font-bold tracking-tight text-balance"
            >
              من نحن
            </h1>

            <p className="mt-6 max-w-[62ch] text-step-1 leading-relaxed text-ink">
              الفهدار شركة سعودية تجمع كل ما يحتاجه مكانك تحت سقف واحد:
              التصميمات الهندسية، المقاولات والبناء، التشطيبات، الأعمال الفنية،
              الصيانة، توريد المواد وخدمات النظافة. نعمل بفرق مختصة لكل مجال،
              ونلتزم بالجودة
              والاحترافية ووضوح التعامل من أول مكالمة حتى ما بعد التسليم.
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- Our story ---------------------------------------------- */}
      <section aria-labelledby="story-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
            <Reveal className="min-w-0">
              {/* Portrait crop on mobile, wider on desktop, so the block
                  never dominates the fold on a small screen. */}
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line sm:aspect-[3/2] lg:aspect-[4/5]">
                <Image
                  src="/fahdar2.jpg"
                  alt="فريق الفهدار أثناء تنفيذ أعمال تشطيب واجهة ومدخل فيلا سكنية."
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-med ease-out group-hover:scale-[1.03]"
                />
              </div>
            </Reveal>

            <Reveal delay={90} className="min-w-0">
              <h2
                id="story-heading"
                className="text-step-3 font-bold tracking-tight text-balance"
              >
                قصتنا
              </h2>

              <p className="mt-6 max-w-[54ch] text-step-0 text-muted">
                بدأت الفهدار من ملاحظة بسيطة: صاحب المنزل أو المنشأة يجد نفسه
                أمام مقاول للبناء، وفني للكهرباء، وشركة للصيانة، وأخرى للنظافة —
                ومعها مسؤولية التنسيق بينهم جميعاً. فاخترنا أن نكون الجهة
                الواحدة التي تتحمّل هذه المسؤولية بالكامل، وتسلّم النتيجة
                جاهزة.
              </p>

              <p className="mt-5 max-w-[54ch] text-step-0 text-muted">
                نبني علاقتنا مع العميل على الوضوح: نطاق عمل مكتوب، وعرض سعر
                مفصّل، وجدول زمني يُلتزم به، وفريق مختص ينفّذ كل مرحلة على
                الأصول. ولأن العلاقة لا تنتهي عند التسليم، نبقى قريبين بخدمات
                الصيانة والمتابعة التي تحافظ على قيمة المكان مع الوقت.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- Vision & mission ---------------------------------------- */}
      <section aria-labelledby="pillars-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal className="min-w-0">
            <h2
              id="pillars-heading"
              className="text-step-3 font-bold tracking-tight"
            >
              رؤيتنا ورسالتنا
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 90} className="min-w-0">
                <article className="h-full rounded-xl border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(13,13,13,0.03)] sm:p-9">
                  <span aria-hidden className="block h-0.5 w-10 bg-accent" />
                  <h3 className="mt-5 text-step-1 font-semibold tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 max-w-[52ch] text-step-0 text-muted">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- Values --------------------------------------------------- */}
      <section aria-labelledby="values-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal className="min-w-0">
            <h2
              id="values-heading"
              className="text-step-3 font-bold tracking-tight"
            >
              قيمنا
            </h2>
            <p className="mt-4 max-w-[52ch] text-step-0 text-muted">
              ما نرجع إليه في كل قرار وكل تفصيلة صغيرة داخل المشروع.
            </p>
          </Reveal>

          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value, index) => (
              <li key={value.title} className="min-w-0">
                <Reveal
                  delay={index * 70}
                  className="h-full border-t border-line pt-6"
                >
                  {value.icon}
                  <h3 className="mt-5 text-step-0 font-semibold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-step--1 text-muted">
                    {value.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Closing CTA band ---------------------------------------- */}
      <section aria-labelledby="about-cta-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal className="min-w-0">
            <div className="overflow-hidden rounded-2xl bg-bg-dark text-ink-invert">
              <div aria-hidden className="h-1 w-full bg-accent" />

              <div className="flex flex-col items-start gap-8 p-9 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-14">
                <div>
                  <h2
                    id="about-cta-heading"
                    className="max-w-[24ch] text-step-2 font-bold tracking-tight text-balance"
                  >
                    هل أنت جاهز للبدء؟
                  </h2>
                  <p className="mt-3 max-w-[48ch] text-step-0 text-ink-invert/70">
                    دع الفهدار يتكفّل بكل احتياجات مكانك.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/request" className={CTA_ON_DARK}>
                    اطلب خدمة
                    <ArrowIcon />
                  </Link>

                  <Link href="/services" className={SECONDARY_ON_DARK}>
                    تصفّح خدماتنا
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
