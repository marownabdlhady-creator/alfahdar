import type { ReactNode } from "react";

import { CONTACT, SOCIAL_LINKS } from "@/lib/contact";

/* --- Icons (hand-drawn, same stroke language as the rest of the site) --- */

function Stroke({
  children,
  className = "h-5 w-5 shrink-0",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <Stroke className="h-6 w-6 shrink-0">
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.3-4.5A8.5 8.5 0 1 1 20.5 11.7Z" />
      <path d="M9 9.4c.3 2.6 2.6 4.9 5.2 5.2.5 0 1-.4 1-1v-.7l-1.8-.6-.8.8a6.4 6.4 0 0 1-2.1-2.1l.8-.8-.6-1.8h-.7c-.6 0-1 .4-1 1Z" />
    </Stroke>
  );
}

function PhoneIcon() {
  return (
    <Stroke className="h-6 w-6 shrink-0">
      <path d="M8.1 3.5H5.4A1.9 1.9 0 0 0 3.5 5.6C3.9 12.9 11.1 20.1 18.4 20.5a1.9 1.9 0 0 0 2.1-1.9v-2.7l-4.1-1.4-1.6 2a13.6 13.6 0 0 1-5.3-5.3l2-1.6Z" />
    </Stroke>
  );
}

function MailIcon() {
  return (
    <Stroke className="h-6 w-6 shrink-0">
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="m3.8 7 7.1 5.2a1.8 1.8 0 0 0 2.2 0L20.2 7" />
    </Stroke>
  );
}

function ClockIcon() {
  return (
    <Stroke className="h-5 w-5 shrink-0 text-accent">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 1.9" />
    </Stroke>
  );
}

function PinIcon() {
  return (
    <Stroke className="h-5 w-5 shrink-0 text-accent">
      <path d="M19 10.4c0 4.6-5.4 9.4-6.6 10.4a.6.6 0 0 1-.8 0C10.4 19.8 5 15 5 10.4a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </Stroke>
  );
}

/* Points to the end of the line — the left, in RTL. */
function ChevronEndIcon() {
  return (
    <Stroke className="h-4 w-4 shrink-0">
      <path d="m15 6-6 6 6 6" />
    </Stroke>
  );
}

const SOCIAL_ICONS: Record<string, ReactNode> = {
  instagram: (
    <Stroke>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M16.9 7.1h.01" />
    </Stroke>
  ),
  x: (
    <Stroke>
      <path d="m4.5 4.5 15 15" />
      <path d="m19.5 4.5-15 15" />
    </Stroke>
  ),
  tiktok: (
    <Stroke>
      <path d="M14.2 3.5v10.9a4.1 4.1 0 1 1-4.1-4.1" />
      <path d="M14.2 3.5a5.4 5.4 0 0 0 5.4 5.4" />
    </Stroke>
  ),
  snapchat: (
    <Stroke>
      <path d="M12 3.4c2.7 0 4.5 2 4.5 4.7 0 .7 0 1.4-.1 2 .7.3 1.4.1 1.8-.2.4.6-.3 1.5-1.5 1.9.5 1.6 1.7 2.6 3.1 2.9-.3.7-1.7 1-2.7 1.1-.2.3-.2 1-.5 1.2-.6.2-1.7-.4-2.9-.2-1 .2-1.6 1.2-2.9 1.2s-1.9-1-2.9-1.2c-1.2-.2-2.3.4-2.9.2-.3-.2-.3-.9-.5-1.2-1-.1-2.4-.4-2.7-1.1 1.4-.3 2.6-1.3 3.1-2.9-1.2-.4-1.9-1.3-1.5-1.9.4.3 1.1.5 1.8.2-.1-.6-.1-1.3-.1-2 0-2.7 1.8-4.7 4.5-4.7Z" />
    </Stroke>
  ),
};

/* --- Rows ---------------------------------------------------------- */

function ChannelRow({
  href,
  label,
  value,
  icon,
  external = false,
  featured = false,
}: {
  href: string;
  label: string;
  value: string;
  icon: ReactNode;
  external?: boolean;
  featured?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={[
        "flex items-center gap-4 rounded-xl border p-4",
        "transition-colors duration-fast ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        featured
          ? "border-accent bg-accent text-ink hover:bg-accent-hover"
          : "border-line bg-bg text-ink hover:border-ink",
      ].join(" ")}
    >
      <span className={featured ? "" : "text-accent"}>{icon}</span>

      <span className="min-w-0 flex-1">
        <span className="block text-step--1 font-medium">{label}</span>
        <span
          className={[
            "mt-0.5 block truncate text-step--1",
            featured ? "text-ink/70" : "text-muted",
          ].join(" ")}
        >
          {/* bdi keeps the number reading left-to-right inside the RTL row. */}
          <bdi dir="ltr">{value}</bdi>
        </span>
      </span>

      <ChevronEndIcon />
    </a>
  );
}

/* --- The panel ------------------------------------------------------ */

export function ContactChannels() {
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="contact-direct"
        className="rounded-2xl border border-line bg-surface p-5 sm:p-7"
      >
        <h2 id="contact-direct" className="text-step-1 font-semibold tracking-tight">
          طرق التواصل المباشر
        </h2>
        <p className="mt-2 text-step--1 text-muted">
          اختر الطريقة الأسرع بالنسبة لك — نرد عليك في أقرب وقت.
        </p>

        <div className="mt-5 space-y-3">
          <ChannelRow
            featured
            external
            href={CONTACT.whatsapp.href}
            label="واتساب"
            value={CONTACT.whatsapp.display}
            icon={<WhatsappIcon />}
          />
          <ChannelRow
            href={CONTACT.phone.href}
            label="اتصال هاتفي"
            value={CONTACT.phone.display}
            icon={<PhoneIcon />}
          />
          <ChannelRow
            href={CONTACT.email.href}
            label="البريد الإلكتروني"
            value={CONTACT.email.display}
            icon={<MailIcon />}
          />
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-step--1 font-medium tracking-[0.14em] text-muted">
            مواقع التواصل الاجتماعي
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.key}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors duration-fast ease-out hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {SOCIAL_ICONS[social.key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-label="ساعات العمل والموقع"
        className="rounded-2xl border border-line bg-surface p-5 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <ClockIcon />
          <h2 className="text-step-0 font-semibold tracking-tight">
            ساعات العمل
          </h2>
        </div>

        <dl className="mt-4 space-y-2.5">
          {CONTACT.hours.map((entry) => (
            <div
              key={entry.days}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="min-w-0 text-step--1 text-muted">{entry.days}</dt>
              <dd className="min-w-0 text-step--1 font-medium">{entry.time}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-line pt-6">
          <div className="flex items-center gap-3">
            <PinIcon />
            <h2 className="text-step-0 font-semibold tracking-tight">الموقع</h2>
          </div>
          <p className="mt-3 text-step--1">{CONTACT.location.city}</p>
          <p className="mt-1.5 text-step--1 text-muted">
            {CONTACT.location.note}
          </p>
        </div>
      </section>
    </div>
  );
}
