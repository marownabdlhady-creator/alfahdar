import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { ServiceSearch } from "@/components/service-search";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "خدماتنا | الفهدار",
  description:
    "حلول متكاملة في التصميمات الهندسية، المقاولات والبناء، التشطيبات، الأعمال الفنية، الصيانة، توريد المواد وخدمات النظافة والتنظيف.",
};

/* Editorial index per block, in Arabic-Indic numerals, derived from the
   catalogue so a new category numbers itself. */
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function indexLabel(index: number) {
  return String(index + 1)
    .padStart(2, "0")
    .replace(/[0-9]/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

const PRIMARY_CTA =
  "inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const SECONDARY_CTA =
  "inline-flex items-center rounded-full border border-line px-8 py-3.5 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:border-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

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

export default function ServicesPage() {
  return (
    <>
      {/* No dark hero on this page, so it clears the fixed header itself. */}
      <section
        aria-labelledby="services-title"
        className="bg-bg pt-32 lg:pt-40"
      >
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
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

            <h1
              id="services-title"
              className="mt-6 text-step-5 font-bold tracking-tight"
            >
              خدماتنا
            </h1>

            <p className="mt-6 max-w-[58ch] text-step-0 text-muted">
              نقدّم حلولاً متكاملة لكل ما يخص التصميمات الهندسية، المقاولات،
              البناء، التشطيبات، الصيانة، الخدمات الفنية والنظافة — بجودة
              واحترافية وفريق مختص لكل تخصص.
            </p>
          </Reveal>

          {/* z-20 on the Reveal itself: .reveal carries a transform, which
              makes it a stacking context — a z-index on the search inside
              it could not lift the results panel over the blocks below. */}
          <Reveal delay={90} className="relative z-20 mt-9 max-w-2xl">
            <ServiceSearch variant="light" />
          </Reveal>

          <div className="mt-section space-y-section">
            {SERVICES.map((service, index) => {
              const headingId = `${service.slug}-heading`;
              /* The photo alternates sides down the page: on the right for
                 even blocks, on the left for odd ones. DOM order stays
                 image-then-content so mobile stacks correctly. */
              const imageOnStart = index % 2 === 0;

              return (
                <Reveal key={service.slug}>
                  <article aria-labelledby={headingId}>
                    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                      <div
                        className={[
                          "group relative aspect-[4/3] overflow-hidden rounded-xl border border-line lg:aspect-[3/2]",
                          imageOnStart ? "" : "lg:order-2",
                        ].join(" ")}
                      >
                        <Image
                          src={service.image}
                          alt={service.alt}
                          fill
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-cover transition-transform duration-med ease-out group-hover:scale-[1.03]"
                        />
                      </div>

                      <div className={imageOnStart ? "" : "lg:order-1"}>
                        <div className="flex items-center gap-4">
                          <span
                            aria-hidden
                            className="h-0.5 w-10 shrink-0 bg-accent"
                          />
                          <span
                            aria-hidden
                            className="text-step--1 tracking-[0.14em] text-muted"
                          >
                            {indexLabel(index)}
                          </span>
                        </div>

                        <h2
                          id={headingId}
                          className="mt-5 text-step-3 font-bold tracking-tight"
                        >
                          {service.title}
                        </h2>

                        <p className="mt-4 max-w-[48ch] text-step-0 text-muted">
                          {service.description}
                        </p>

                        <ul
                          aria-label={`ما تشمله ${service.title}`}
                          className="mt-7 flex flex-wrap gap-2"
                        >
                          {service.subServices.map((item) => (
                            <li
                              key={item.name}
                              className="rounded-full border border-line bg-surface px-4 py-1.5 text-step--1 text-ink"
                            >
                              {item.name}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-9 flex flex-wrap items-center gap-3">
                          <Link
                            href={service.href}
                            aria-label={`اعرف المزيد عن ${service.title}`}
                            className={PRIMARY_CTA}
                          >
                            اعرف المزيد
                            <ArrowIcon />
                          </Link>

                          <Link
                            href="/request"
                            aria-label={`اطلب خدمة ${service.title}`}
                            className={SECONDARY_CTA}
                          >
                            اطلب الخدمة
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="services-cta-heading"
        className="bg-bg pt-section pb-section"
      >
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div aria-hidden className="h-1 w-full bg-accent" />

              <div className="flex flex-col items-start gap-8 p-9 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-14">
                <div>
                  <h2
                    id="services-cta-heading"
                    className="max-w-[22ch] text-step-2 font-bold tracking-tight"
                  >
                    لم تجد ما تبحث عنه؟
                  </h2>
                  <p className="mt-3 max-w-[46ch] text-step-0 text-muted">
                    أخبرنا باحتياجك وسنتكفّل بالباقي.
                  </p>
                </div>

                <Link href="/request" className={`${PRIMARY_CTA} shrink-0`}>
                  اطلب خدمة
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
