/* Every value below is a PLACEHOLDER. One edit here updates the contact
   page, and later the footer, without touching any component.

   TODO: replace with the real WhatsApp number, phone number, email address
   and social handles once the brand's accounts are live. */

const WHATSAPP_NUMBER = "9665XXXXXXXX";

/** Prefilled on wa.me, so the first message already has context. */
const WHATSAPP_MESSAGE = "السلام عليكم، لدي استفسار بخصوص خدمات الفهدار.";

/** A wa.me link on the one number, with whatever opener suits the place
    it is offered from — the request form asks for a video, the floating
    button asks a general question. */
export function whatsappHref(message: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  whatsapp: {
    href: whatsappHref(),
    display: "+966 5X XXX XXXX",
  },
  phone: {
    href: "tel:+9665XXXXXXXX",
    display: "+966 5X XXX XXXX",
  },
  email: {
    href: "mailto:info@alfahdar.com",
    display: "info@alfahdar.com",
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
