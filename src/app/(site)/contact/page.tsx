import type { Metadata } from "next";

import { ContactChannels } from "@/components/contact-channels";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "تواصل معنا | الفهدار",
  description:
    "تواصل مع الفهدار عبر واتساب أو الهاتف أو البريد الإلكتروني، أو أرسل استفسارك عبر النموذج. خدمة عملاء في المملكة العربية السعودية للمقاولات والتشطيبات والصيانة.",
  keywords: [
    "تواصل معنا",
    "اتصل بنا",
    "الفهدار",
    "خدمة العملاء",
    "مقاولات السعودية",
  ],
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    /* No dark hero on this page, so it clears the fixed header itself. */
    <section
      aria-labelledby="contact-title"
      className="bg-bg pt-28 pb-section lg:pt-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <Reveal className="min-w-0">
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="h-0.5 w-10 shrink-0 bg-accent sm:w-14"
            />
            <span className="text-step--1 tracking-[0.14em] text-muted">
              تواصل معنا
            </span>
          </div>

          <h1
            id="contact-title"
            className="mt-5 text-step-4 font-bold tracking-tight"
          >
            تواصل معنا
          </h1>

          <p className="mt-4 max-w-[54ch] text-step-0 text-muted">
            نحن هنا لمساعدتك — تواصل معنا لأي استفسار أو اطلب خدمتك مباشرة.
          </p>
        </Reveal>

        {/* Contact methods lead in the RTL start column and, on mobile,
            come first in the stack. min-w-0 keeps a grid item from being
            sized by its content and pushing the page sideways. */}
        <div className="mt-9 grid gap-8 lg:mt-14 lg:grid-cols-5 lg:items-start lg:gap-10">
          <Reveal className="min-w-0 lg:col-span-2">
            <ContactChannels />
          </Reveal>

          <Reveal delay={90} className="min-w-0 lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
