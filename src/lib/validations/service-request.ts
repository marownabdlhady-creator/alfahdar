import { z } from "zod";

import { SAUDI_MOBILE_ERROR, isSaudiMobile } from "@/lib/phone";
import { SERVICE_CATEGORIES } from "@/lib/service-category";

/* --- The preferred day -------------------------------------------

   The visitor picks a day, never a time — the hour is settled on the
   phone. Both sides of the boundary are expressed as YYYY-MM-DD in the
   one timezone the company works in, so "today" means the same thing on
   the form, in the route, and in the dashboard. */

const TIME_ZONE = "Asia/Riyadh";

/* en-CA is the locale that formats as YYYY-MM-DD, which is exactly what
   <input type="date"> reads and writes. */
const ISO_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in Riyadh, as YYYY-MM-DD. Called per render and per request
    rather than cached: a server process outlives midnight. */
export function todayInRiyadh() {
  return ISO_DATE.format(new Date());
}

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A real day, not just the right shape. Parsing alone is not enough —
    2026-02-31 rolls over to March rather than failing — so the parsed date
    has to come back out as the string that went in. */
function isCalendarDate(value: string) {
  if (!CALENDAR_DATE.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
}

/** The service request payload. The /request form uses this as its resolver
    and POST /api/requests re-parses the body with the very same schema, so
    there is exactly one definition of what a valid request is. */
export const serviceRequestSchema = z.object({
  fullName: z.string().trim().min(2, "الرجاء إدخال الاسم الكامل"),
  phone: z
    .string()
    .trim()
    .min(1, "الرجاء إدخال رقم الجوال")
    .refine(isSaudiMobile, SAUDI_MOBILE_ERROR),
  category: z.enum(SERVICE_CATEGORIES, {
    message: "الرجاء اختيار نوع الخدمة",
  }),
  description: z
    .string()
    .trim()
    .min(10, "الرجاء وصف المشكلة أو المشروع في 10 أحرف على الأقل"),
  city: z.string().trim().min(1, "الرجاء اختيار المدينة"),
  district: z.string().trim().min(2, "الرجاء إدخال اسم الحي"),
  address: z.string().trim().optional(),
  /** A day, no time: what <input type="date"> produces (YYYY-MM-DD), or ""
      when left blank. Optional — an empty value is valid and the route
      turns it into null before it reaches Prisma. */
  preferredDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || isCalendarDate(value),
      "صيغة التاريخ غير صحيحة",
    )
    /* ISO dates sort lexicographically, so comparing the strings needs no
       Date arithmetic and cannot drift by a timezone. */
    .refine(
      (value) => !value || value >= todayInRiyadh(),
      "الرجاء اختيار تاريخ اليوم أو بعده",
    ),
  isUrgent: z.boolean().default(false),
  notes: z.string().trim().optional(),
});

/** What a caller sends: `isUrgent` may be omitted. This is the form's shape. */
export type ServiceRequestInput = z.input<typeof serviceRequestSchema>;

/** What parsing yields: defaults applied. This is what the route stores. */
export type ServiceRequestValues = z.output<typeof serviceRequestSchema>;

/** The 400 body from POST /api/requests. */
export type ServiceRequestErrorResponse = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<keyof ServiceRequestValues, string[]>>;
};

export type ServiceRequestSuccessResponse = {
  success: true;
  id: string;
  requestNumber: string;
};
