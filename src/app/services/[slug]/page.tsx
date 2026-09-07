import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/nav";
import { SERVICES, getService } from "@/lib/services";
import { absoluteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

/** Pre-render all five categories at build time. */
export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

/** Anything outside the five slugs is a 404, never an on-demand render. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) return {};

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    keywords: service.keywords,
    alternates: { canonical: service.href },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName: BRAND.name,
      url: service.href,
      title: service.seoTitle,
      description: service.seoDescription,
      images: [{ url: service.image, alt: service.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: service.seoTitle,
      description: service.seoDescription,
      images: [service.image],
    },
  };
}

/* --- Shared classes ---------------------------------------------- */

const PRIMARY_CTA =
  "inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const CTA_ON_DARK =
  "inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

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

/** The accent tick that opens every sub-service card. */
function TickIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-accent"
    >
      <path d="m5 12.6 4.4 4.4L19 7" />
    </svg>
  );
}

function BenefitIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-accent"
    >
      {children}
    </svg>
  );
}

const BENEFITS = [
  {
    title: "فنيون مختصون",
    description: "فريق مدرَّب لكل تخصص، بلا وسطاء.",
    icon: (
      <BenefitIcon>
        <circle cx="9.5" cy="8" r="3.5" />
        <path d="M3.5 19v-1.2A4.3 4.3 0 0 1 7.8 13.5h3.4a4.3 4.3 0 0 1 4.3 4.3V19" />
        <path d="M16.2 5.4a3.3 3.3 0 0 1 0 6.2" />
        <path d="M17.6 14a4 4 0 0 1 2.9 3.8V19" />
      </BenefitIcon>
    ),
  },
  {
    title: "جودة في التنفيذ",
    description: "مواد وأعمال تُسلَّم على الأصول.",
    icon: (
      <BenefitIcon>
        <circle cx="12" cy="9" r="5.5" />
        <path d="M8.4 13.6 7.2 21l4.8-2.7 4.8 2.7-1.2-7.4" />
      </BenefitIcon>
    ),
  },
  {
    title: "سرعة الاستجابة",
    description: "نرد على طلبك ونحدّد الموعد بسرعة.",
    icon: (
      <BenefitIcon>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.2V12l3.2 1.9" />
      </BenefitIcon>
    ),
  },
  {
    title: "ضمان حسب نوع الخدمة",
    description: "ضمان مكتوب على الأعمال المشمولة.",
    icon: (
      <BenefitIcon>
        <path d="M12 3.2 5.2 5.8v5.5c0 4.1 2.8 7.3 6.8 9.1 4-1.8 6.8-5 6.8-9.1V5.8L12 3.2Z" />
        <path d="m9.2 11.9 2 2 3.6-4.1" />
      </BenefitIcon>
    ),
  },
] as const;

/* ------------------------------------------------------------------ */

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  const others = SERVICES.filter((item) => item.slug !== service.slug);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seoDescription,
    serviceType: service.serviceType,
    url: absoluteUrl(service.href),
    image: absoluteUrl(service.image),
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: absoluteUrl("/"),
    },
    areaServed: {
      "@type": "Country",
      name: "المملكة العربية السعودية",
      identifier: "SA",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `خدمات ${service.title}`,
      itemListElement: service.subServices.map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.name,
          description: item.description,
        },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "الرئيسية",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "خدماتنا",
        item: absoluteUrl("/services"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: absoluteUrl(service.href),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* --- Breadcrumb + page header. No dark hero here, so the page
              clears the fixed header itself. --------------------------- */}
      <section className="bg-bg pt-32 pb-section lg:pt-40">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <nav aria-label="مسار التنقل">
            <ol className="flex flex-wrap items-center gap-2 text-step--1 text-muted">
              <li>
                <Link
                  href="/"
                  className="transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  الرئيسية
                </Link>
              </li>
              <li aria-hidden className="text-line">
                /
              </li>
              <li>
                <Link
                  href="/services"
                  className="transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  خدماتنا
                </Link>
              </li>
              <li aria-hidden className="text-line">
                /
              </li>
              <li aria-current="page" className="text-ink">
                {service.title}
              </li>
            </ol>
          </nav>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="flex items-center gap-4">
                <span
                  aria-hidden
                  className="h-0.5 w-10 shrink-0 bg-accent sm:w-14"
                />
                <span className="text-step--1 tracking-[0.14em] text-muted">
                  خدماتنا
                </span>
              </div>

              <h1 className="mt-6 text-step-4 font-bold tracking-tight text-balance">
                {service.heading}
              </h1>

              <p className="mt-6 max-w-[54ch] text-step-0 text-muted">
                {service.intro}
              </p>

              <div className="mt-9">
                <Link
                  href={`/request?service=${service.slug}`}
                  aria-label={`اطلب خدمة ${service.title}`}
                  className={PRIMARY_CTA}
                >
                  اطلب الخدمة الآن
                  <ArrowIcon />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line lg:aspect-[5/4]">
                <Image
                  src={service.image}
                  alt={`${service.title} - ${BRAND.name}`}
                  fill
                  preload
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-med ease-out group-hover:scale-[1.03]"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- The full offering ------------------------------------- */}
      <section
        aria-labelledby="sub-services-heading"
        className="bg-bg pb-section"
      >
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2
              id="sub-services-heading"
              className="text-step-3 font-bold tracking-tight"
            >
              خدمات {service.title}
            </h2>
            <p className="mt-4 max-w-[52ch] text-step-0 text-muted">
              كل ما نغطيه ضمن هذا القسم، بتفصيل واضح لما تشمله كل خدمة.
            </p>
          </Reveal>

          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {service.subServices.map((item, index) => (
              <li key={item.name}>
                <Reveal delay={index * 60} className="h-full">
                  <div className="h-full rounded-xl border border-line bg-surface p-7 shadow-[0_1px_2px_rgba(13,13,13,0.03)]">
                    <TickIcon />
                    <h3 className="mt-4 text-step-1 font-semibold tracking-tight">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-step--1 text-muted">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Trust strip -------------------------------------------- */}
      <section aria-labelledby="why-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2 id="why-heading" className="text-step-3 font-bold tracking-tight">
              {service.whyHeading}
            </h2>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, index) => (
              <li key={benefit.title}>
                <Reveal
                  delay={index * 70}
                  className="h-full border-t border-line pt-6"
                >
                  {benefit.icon}
                  <h3 className="mt-4 text-step-0 font-semibold tracking-tight">
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

      {/* --- CTA band ------------------------------------------------ */}
      <section aria-labelledby="cta-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="overflow-hidden rounded-2xl bg-bg-dark text-ink-invert">
              <div aria-hidden className="h-1 w-full bg-accent" />

              <div className="flex flex-col items-start gap-8 p-9 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-14">
                <div>
                  <h2
                    id="cta-heading"
                    className="max-w-[24ch] text-step-2 font-bold tracking-tight"
                  >
                    {service.ctaHeading}
                  </h2>
                  <p className="mt-3 max-w-[48ch] text-step-0 text-ink-invert/70">
                    {service.ctaLead}
                  </p>
                </div>

                <Link
                  href={`/request?service=${service.slug}`}
                  aria-label={`اطلب خدمة ${service.title} الآن`}
                  className={`${CTA_ON_DARK} shrink-0`}
                >
                  اطلب الخدمة الآن
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- Internal links to the other categories ------------------ */}
      <section aria-labelledby="others-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2
              id="others-heading"
              className="text-step-2 font-bold tracking-tight"
            >
              خدمات أخرى
            </h2>
          </Reveal>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other, index) => (
              <li key={other.slug}>
                <Reveal delay={index * 60} className="h-full">
                  <Link
                    href={other.href}
                    className="group flex h-full items-center justify-between gap-4 rounded-xl border border-line bg-surface px-6 py-5 transition-colors duration-fast ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <span className="text-step-0 font-medium tracking-tight">
                      {other.title}
                    </span>
                    <span className="text-muted transition-[color,transform] duration-fast ease-out group-hover:-translate-x-1 group-hover:text-accent">
                      <ArrowIcon />
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
