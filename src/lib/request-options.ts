/** Option lists and limits for the /request form UI. The validation rules
    themselves live in src/lib/validations/service-request.ts. */

export const CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الطائف",
  "تبوك",
  "أبها",
  "القصيم",
  "أخرى",
] as const;

/* Attachment limits. Enforced in the UI now; the same numbers apply
   server-side once uploads are wired. */
export const MAX_FILES = 5;
export const MAX_FILE_MB = 10;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
