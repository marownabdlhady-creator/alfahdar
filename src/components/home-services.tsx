import Image from "next/image";
import Link from "next/link";

import { SERVICES, type Service } from "@/lib/services";

/* The asymmetric desktop grid, expressed once per card. The featured
   card holds a tall 7-column cell, the next two stack beside it, and the
   rest run as an even three-up row. Tablet drops to full-width + 2-up.
   Any card past the listed cells falls back to the three-up cell, so the
   grid keeps working when the catalogue grows. */
const CELLS = [
  "md:col-span-12 lg:col-span-7 lg:row-span-2",
  "md:col-span-6 lg:col-span-5",
  "md:col-span-6 lg:col-span-5",
  "md:col-span-6 lg:col-span-4",
  "md:col-span-6 lg:col-span-4",
  "md:col-span-6 lg:col-span-4",
] as const;

const FALLBACK_CELL = "md:col-span-6 lg:col-span-4";

const SIZES_FEATURED = "(min-width: 1024px) 58vw, 100vw";
const SIZES_STANDARD =
  "(min-width: 1024px) 42vw, (min-width: 768px) 50vw, 100vw";

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
      className="h-4 w-4 shrink-0 transition-transform duration-fast ease-out group-hover:-translate-x-1"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function ServiceCard({
  service,
  featured,
  className,
}: {
  service: Service;
  featured: boolean;
  className: string;
}) {
  return (
    <Link
      href="/services"
      aria-label={`${service.title} — اعرف المزيد`}
      className={[
        "group relative isolate flex flex-col justify-end overflow-hidden rounded-xl",
        "border border-line bg-bg-dark text-ink-invert",
        "shadow-[0_1px_2px_rgba(13,13,13,0.04)]",
        "transition-shadow duration-med ease-out hover:shadow-[0_18px_40px_-24px_rgba(13,13,13,0.45)]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        featured ? "min-h-[26rem] sm:min-h-[30rem]" : "min-h-[19rem]",
        "lg:min-h-0",
        className,
      ].join(" ")}
    >
      <Image
        src={service.image}
        alt={service.alt}
        fill
        sizes={featured ? SIZES_FEATURED : SIZES_STANDARD}
        className="absolute inset-0 -z-10 object-cover transition-transform duration-med ease-out group-hover:scale-[1.04]"
      />

      {/* Keeps the Arabic legible over any crop of the photo. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(13,13,13,0.92)_0%,rgba(13,13,13,0.66)_34%,rgba(13,13,13,0.2)_66%,rgba(13,13,13,0.05)_100%)]"
      />

      <div className={featured ? "p-7 sm:p-9 lg:p-10" : "p-6 lg:p-7"}>
        <span
          aria-hidden
          className="block h-0.5 w-10 origin-right scale-x-0 bg-accent transition-transform duration-med ease-out group-hover:scale-x-100"
        />

        <h3
          className={[
            "mt-4 font-semibold tracking-tight",
            featured ? "text-step-3" : "text-step-1",
          ].join(" ")}
        >
          {service.title}
        </h3>

        <p
          className={[
            "mt-2 text-ink-invert/75",
            featured ? "max-w-[42ch] text-step-0" : "text-step--1",
          ].join(" ")}
        >
          {service.summary}
        </p>

        <p className="mt-3 text-step--1 leading-relaxed text-ink-invert/50">
          {service.examples.join(" · ")}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out group-hover:text-accent">
          اعرف المزيد
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export function HomeServices() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="bg-bg py-section"
    >
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-0.5 w-10 shrink-0 bg-accent sm:w-14" />
          <span className="text-step--1 tracking-[0.14em] text-muted">
            خدماتنا
          </span>
        </div>

        <h2
          id="services-heading"
          className="mt-6 max-w-[18ch] text-step-4 font-bold tracking-tight text-balance"
        >
          كل ما يحتاجه دارك، تحت سقف واحد
        </h2>

        <p className="mt-5 max-w-[52ch] text-step-0 text-muted">
          من المقاولات والبناء إلى التشطيبات والصيانة والخدمات الفنية والنظافة —
          فريق واحد يتكفّل بكل التفاصيل.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 lg:auto-rows-[minmax(17rem,auto)] lg:gap-6">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              featured={index === 0}
              className={CELLS[index] ?? FALLBACK_CELL}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
