/* The company's own contact details — one number for both WhatsApp and
   calls. Every link on the site is built from the values below, so a
   change of number is a change of this file alone.

   Note: the admin dashboard reaches a *client* through src/lib/phone.ts,
   built from that request's own phone field. Nothing here applies to it. */

/** +966 53 052 3364, in the shapes each consumer needs. */
export const PHONE_E164 = "+966530523364";
/** Digits only — wa.me rejects the plus and the spaces. */
export const PHONE_WA = "966530523364";
export const PHONE_TEL = "tel:+966530523364";
/** Shown as text. Always render inside a bdi/dir="ltr" so RTL keeps the
    digit groups in order. */
export const PHONE_DISPLAY = "+966 53 052 3364";

export const EMAIL = "info@alfahdar.com";
export const EMAIL_HREF = `mailto:${EMAIL}`;

/** Prefilled on wa.me, so the first message already has context. */
const WHATSAPP_MESSAGE = "السلام عليكم، لدي استفسار بخصوص خدمات الفهدار.";

/** A wa.me link on the one number, with whatever opener suits the place
    it is offered from — the request form asks for a video, the floating
    button asks a general question. */
export function whatsappHref(message: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  whatsapp: {
    href: whatsappHref(),
    display: PHONE_DISPLAY,
  },
  phone: {
    href: PHONE_TEL,
    display: PHONE_DISPLAY,
  },
  email: {
    href: EMAIL_HREF,
    display: EMAIL,
  },
  /** TODO: embed map later — the copy below stands in until then. */
  location: {
    city: "الرياض، المملكة العربية السعودية",
    note: "سنضيف الموقع على الخريطة قريباً.",
  },
  hours: [
    { days: "السبت - الخميس", time: "8 صباحاً - 10 مساءً" },
    { days: "الجمعة", time: "مغلق" },
  ],
} as const;

/** Placeholder hrefs; the icons live with the component that draws them. */
export const SOCIAL_LINKS = [
  { key: "instagram", label: "إنستغرام", href: "#" },
  { key: "x", label: "إكس (تويتر)", href: "#" },
  { key: "tiktok", label: "تيك توك", href: "#" },
  { key: "snapchat", label: "سناب شات", href: "#" },
] as const;
