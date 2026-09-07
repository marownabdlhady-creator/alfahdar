import { z } from "zod";

import { SAUDI_MOBILE_ERROR, isSaudiMobile } from "@/lib/phone";
import { SERVICE_CATEGORIES } from "@/lib/service-category";

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
  /** Whatever <input type="datetime-local"> produced, or "" when left blank.
      The route turns it into a Date (or null) before it reaches Prisma. */
  preferredDate: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "صيغة التاريخ غير صحيحة",
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
