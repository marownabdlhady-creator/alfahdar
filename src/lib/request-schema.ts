import { z } from "zod";

import { SERVICES } from "./services";

/** Valid values for the "نوع الخدمة" select. */
export const SERVICE_SLUGS = SERVICES.map((service) => service.slug);

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

/** 05XXXXXXXX, +9665XXXXXXXX or 009665XXXXXXXX. */
const SAUDI_MOBILE = /^(?:\+?966|00966)?0?5\d{8}$/;

const stripSeparators = (value: string) => value.replace(/[\s()-]/g, "");

/* Attachment limits. Enforced in the UI now; the same numbers apply
   server-side once uploads are wired. */
export const MAX_FILES = 5;
export const MAX_FILE_MB = 10;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

/** Shared by the form today and by the API route in the backend phase. */
export const requestSchema = z.object({
  fullName: z.string().trim().min(3, "الرجاء إدخال الاسم الكامل"),
  phone: z
    .string()
    .trim()
    .min(1, "الرجاء إدخال رقم الجوال")
    .refine(
      (value) => SAUDI_MOBILE.test(stripSeparators(value)),
      "رقم جوال غير صحيح. مثال: 0512345678 أو +966512345678",
    ),
  service: z
    .string()
    .refine(
      (value) => SERVICE_SLUGS.includes(value),
      "الرجاء اختيار نوع الخدمة",
    ),
  description: z
    .string()
    .trim()
    .min(10, "الرجاء وصف المشكلة أو المشروع في 10 أحرف على الأقل"),
  urgent: z.boolean(),
  city: z.string().min(1, "الرجاء اختيار المدينة"),
  district: z.string().trim().min(2, "الرجاء إدخال اسم الحي"),
  address: z.string().trim(),
  preferredAt: z.string(),
  notes: z.string().trim(),
});

export type RequestValues = z.infer<typeof requestSchema>;
