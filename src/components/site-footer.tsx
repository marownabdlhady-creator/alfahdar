import Link from "next/link";

import { BRAND, CTA, NAV_LINKS } from "@/lib/nav";
import { SERVICES } from "@/lib/services";

/* The footer service list reads the catalogue directly, so a new category
   appears here without a second edit. */
const SERVICE_LINKS = SERVICES.map((service) => ({
  label: service.title,
  href: service.href,
}));

const CONTACT_ITEMS = [
  { label: "هاتف", value: "الهاتف قريباً", href: "#" },
  { label: "البريد", value: "البريد الإلكتروني قريباً", href: "#" },
  { label: "واتساب", value: "تواصل عبر واتساب", href: "#" },
];

const linkClass =
  "inline-block text-step--1 text-ink-invert/70 transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const headingClass =
  "text-step--1 font-medium tracking-[0.18em] text-ink-invert/45";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark text-ink-invert">
      {/* The only accent in the footer: a hairline that closes the page. */}
      <div aria-hidden className="h-px w-full bg-accent/50" />

      <div className="mx-auto w-full max-w-7xl px-6 py-section-sm lg:px-10">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="text-step-3 font-semibold tracking-tight transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent"
            >
              {BRAND.name}
            </Link>
            <p className="mt-5 max-w-xs text-step-0 leading-relaxed text-ink-invert/70">
              {BRAND.tagline}
            </p>
            <Link
              href={CTA.href}
              className="mt-9 inline-block rounded-full bg-accent px-8 py-3.5 text-step--1 font-medium text-ink transition-colors duration-fast ease-out hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {CTA.label}
            </Link>
          </div>

          <nav aria-labelledby="footer-nav-heading" className="lg:col-span-2">
            <h2 id="footer-nav-heading" className={headingClass}>
              روابط سريعة
            </h2>
            <ul className="mt-6 flex flex-col gap-3.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-services-heading" className="lg:col-span-3">
            <h2 id="footer-services-heading" className={headingClass}>
              خدماتنا
            </h2>
            <ul className="mt-6 flex flex-col gap-3.5">
              {SERVICE_LINKS.map((service) => (
                <li key={service.label}>
                  <Link href={service.href} className={linkClass}>
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={headingClass}>تواصل معنا</h2>
            <ul className="mt-6 flex flex-col gap-5">
              {CONTACT_ITEMS.map((item) => (
                <li key={item.label}>
                  <span className="block text-step--1 text-ink-invert/45">
                    {item.label}
                  </span>
                  <a href={item.href} className={`mt-1 ${linkClass}`}>
                    {item.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ink-invert/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-step--1 text-ink-invert/50">
            © {year} {BRAND.name}. جميع الحقوق محفوظة.
          </p>
          <p
            dir="ltr"
            className="font-inter text-step--1 tracking-[0.14em] text-ink-invert/40"
          >
            {BRAND.taglineLatin}
          </p>
        </div>
      </div>
    </footer>
  );
}
