/** 05XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX. */
const SAUDI_MOBILE = /^(?:\+?966|00966)?0?5\d{8}$/;

const stripSeparators = (value: string) => value.replace(/[\s()-]/g, "");

/** The one Saudi mobile rule, shared by every form on the site. */
export const isSaudiMobile = (value: string) =>
  SAUDI_MOBILE.test(stripSeparators(value));

export const SAUDI_MOBILE_ERROR =
  "رقم جوال غير صحيح. مثال: 0512345678 أو +966512345678";
