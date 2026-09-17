import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { BRAND } from "@/lib/nav";
import {
  getSubService,
  listSubServicePages,
  subServiceImage,
} from "@/lib/services";
import { absoluteUrl } from "@/lib/site";

type Params = { params: Promise<{ slug: string; subSlug: string }> };

/* One route for every sub-service that carries its own content block.
   Filling that block in src/lib/services.ts is the whole job of adding a
   page — the route, the metadata and every internal link read from it. */
export function generateStaticParams() {
  return listSubServicePages().map(({ service, sub }) => ({
    slug: service.slug,
    subSlug: sub.subSlug,
  }));
}

/** Anything outside the generated pairs is a 404, never an on-demand render. */
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const found = getSubService(slug, subSlug);

  if (!found) return {};

  const { service, sub } = found;
  const href = `${service.href}/${sub.subSlug}`;
  const image = subServiceImage(service, sub);
  const alt = `${sub.name} من ${BRAND.name} في السعودية`;

  return {
    title: sub.seoTitle,
    description: sub.seoDescription,
    keywords: sub.keywords,
    alternates: { canonical: href },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      siteName: BRAND.name,
      url: href,
      title: sub.seoTitle,
      description: sub.seoDescription,
      images: [{ url: image, alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: sub.seoTitle,
      description: sub.seoDescription,
      images: [image],
    },
  };
}

/* --- Shared classes ---------------------------------------------- */

const PRIMARY_CTA =
  "inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const CTA_ON_DARK =
  "inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const CRUMB_LINK =
  "transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

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

/** The accent tick in front of every "ما نقدمه" line. */
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
      className="mt-0.5 h-5 w-5 shrink-0 text-accent"
    >
      <path d="m5 12.6 4.4 4.4L19 7" />
    </svg>
  );
}

/** A plus that becomes a minus while its <details> is open. */
function ToggleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="h-5 w-5 shrink-0 text-accent transition-transform duration-fast ease-out group-open:rotate-45"
    >
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export default async function SubServicePage({ params }: Params) {
  const { slug, subSlug } = await params;
  const found = getSubService(slug, subSlug);

  if (!found) notFound();

  const { service, sub } = found;
  const href = `${service.href}/${sub.subSlug}`;
  const requestHref = `/request?service=${service.slug}`;
  const image = subServiceImage(service, sub);
  const alt = `${sub.name} من ${BRAND.name} في السعودية`;

  /* The rest of this category's sub-services that already have a page. */
  const siblings = listSubServicePages().filter(
    (entry) =>
      entry.service.slug === service.slug && entry.sub.subSlug !== sub.subSlug,
  );

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: sub.name,
    description: sub.seoDescription,
    serviceType: sub.name,
    url: absoluteUrl(href),
    image: absoluteUrl(image),
    category: service.title,
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
      name: `ما تشمله خدمة ${sub.name}`,
      itemListElement: sub.whatWeOffer.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item },
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
      {
        "@type": "ListItem",
        position: 4,
        name: sub.name,
        item: absoluteUrl(href),
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sub.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* --- Breadcrumb + page header. No dark hero here, so the page
              clears the fixed header itself. --------------------------- */}
      <section className="bg-bg pt-32 pb-section lg:pt-40">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <nav aria-label="مسار التنقل">
            <ol className="flex flex-wrap items-center gap-2 text-step--1 text-muted">
              <li>
                <Link href="/" className={CRUMB_LINK}>
                  الرئيسية
                </Link>
              </li>
              <li aria-hidden className="text-line">
                /
              </li>
              <li>
                <Link href="/services" className={CRUMB_LINK}>
                  خدماتنا
                </Link>
              </li>
              <li aria-hidden className="text-line">
                /
              </li>
              <li>
                <Link href={service.href} className={CRUMB_LINK}>
                  {service.title}
                </Link>
              </li>
              <li aria-hidden className="text-line">
                /
              </li>
              <li aria-current="page" className="text-ink">
                {sub.name}
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
                  {service.title}
                </span>
              </div>

              <h1 className="mt-6 text-step-4 font-bold tracking-tight text-balance">
                {sub.name}
              </h1>

              <p className="mt-6 max-w-[54ch] text-step-0 text-muted">
                {sub.longDescription}
              </p>

              <div className="mt-9">
                <Link
                  href={requestHref}
                  aria-label={`اطلب خدمة ${sub.name}`}
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
                  src={image}
                  alt={alt}
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

      {/* --- What the service covers -------------------------------- */}
      <section aria-labelledby="offer-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2
              id="offer-heading"
              className="text-step-3 font-bold tracking-tight"
            >
              ما نقدمه
            </h2>
            <p className="mt-4 max-w-[52ch] text-step-0 text-muted">
              كل ما تشمله خدمة {sub.name} لدى {BRAND.name}.
            </p>
          </Reveal>

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {sub.whatWeOffer.map((item, index) => (
              <li key={item}>
                <Reveal delay={index * 60} className="h-full">
                  <div className="flex h-full items-start gap-3 rounded-xl border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(13,13,13,0.03)]">
                    <TickIcon />
                    <p className="text-step-0 text-ink">{item}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Why us -------------------------------------------------- */}
      <section aria-labelledby="why-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2 id="why-heading" className="text-step-3 font-bold tracking-tight">
              لماذا {BRAND.name}؟
            </h2>
          </Reveal>

          <ul className="mt-9 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {sub.whyUs.map((point, index) => (
              <li key={point}>
                <Reveal
                  delay={index * 70}
                  className="h-full border-t border-line pt-5"
                >
                  <span aria-hidden className="block h-0.5 w-8 bg-accent" />
                  <p className="mt-4 text-step-0 font-medium tracking-tight">
                    {point}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- FAQ. Native <details>, so it is keyboard-usable and open to
              find-in-page without a client component. ----------------- */}
      <section aria-labelledby="faq-heading" className="bg-bg pb-section">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <h2 id="faq-heading" className="text-step-3 font-bold tracking-tight">
              أسئلة شائعة
            </h2>
          </Reveal>

          <div className="mt-9 max-w-3xl divide-y divide-line border-y border-line">
            {sub.faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 60}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                    <h3 className="text-step-1 font-semibold tracking-tight">
                      {faq.question}
                    </h3>
                    <ToggleIcon />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-step-0 text-muted">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
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
                    هل تحتاج {sub.name}؟
                  </h2>
                  <p className="mt-3 max-w-[48ch] text-step-0 text-ink-invert/70">
                    {service.ctaLead}
                  </p>
                </div>

                <Link
                  href={requestHref}
                  aria-label={`اطلب خدمة ${sub.name} الآن`}
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

      {/* --- The sibling sub-services -------------------------------- */}
      {siblings.length > 0 && (
        <section
          aria-labelledby="siblings-heading"
          className="bg-bg pb-section"
        >
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <Reveal>
              <h2
                id="siblings-heading"
                className="text-step-2 font-bold tracking-tight"
              >
                خدمات أخرى في {service.title}
              </h2>
            </Reveal>

            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {siblings.map((entry, index) => (
                <li key={entry.sub.subSlug}>
                  <Reveal delay={index * 50} className="h-full">
                    <Link
                      href={entry.href}
                      className="group flex h-full items-center gap-4 rounded-xl border border-line bg-surface p-4 transition-colors duration-fast ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      {/* Decorative: the link text already names it. */}
                      <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={subServiceImage(entry.service, entry.sub)}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </span>
                      <span className="flex-1 text-step-0 font-medium tracking-tight">
                        {entry.sub.name}
                      </span>
                      <span className="shrink-0 text-muted transition-[color,transform] duration-fast ease-out group-hover:-translate-x-1 group-hover:text-accent">
                        <ArrowIcon />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal delay={120}>
              <Link
                href={service.href}
                className="mt-8 inline-flex items-center gap-2 text-step--1 font-medium text-ink underline-offset-8 transition-colors duration-fast ease-out hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                كل خدمات {service.title}
                <ArrowIcon />
              </Link>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
