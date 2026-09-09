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

/* How many photos a request may carry. The form counts them as they are
   picked and the schema counts the URLs that come back, so a bypassed
   client cannot store more. The per-file type and size rules live in
   src/lib/image-limits.ts, which the upload route enforces again.

   Video is not accepted here at all: a clip is far heavier than a photo
   and the form points those at WhatsApp instead. */
export const MAX_REQUEST_IMAGES = 5;
