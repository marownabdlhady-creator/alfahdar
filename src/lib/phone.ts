/** 05XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX. */
const SAUDI_MOBILE = /^(?:\+?966|00966)?0?5\d{8}$/;

const stripSeparators = (value: string) => value.replace(/[\s()-]/g, "");

/** The one Saudi mobile rule, shared by every form on the site. */
export const isSaudiMobile = (value: string) =>
  SAUDI_MOBILE.test(stripSeparators(value));

export const SAUDI_MOBILE_ERROR =
  "رقم جوال غير صحيح. مثال: 0512345678 أو +966512345678";

/** Digits only, in the international form wa.me and tel: both accept:
    966XXXXXXXXX. Falls back to the stripped input when the value isn't a
    Saudi mobile, so a hand-entered number still produces a usable link. */
export function toInternational(value: string) {
  const digits = stripSeparators(value).replace(/\D/g, "");

  if (digits.startsWith("00966")) return digits.slice(2);
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;

  return digits;
}

export const telHref = (value: string) => `tel:+${toInternational(value)}`;

/** wa.me link, optionally prefilled. Used by the dashboard to reach a
    client straight from a request. */
export function whatsappHref(value: string, message?: string) {
  const base = `https://wa.me/${toInternational(value)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
