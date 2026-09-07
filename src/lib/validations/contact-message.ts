import { z } from "zod";

import { SAUDI_MOBILE_ERROR, isSaudiMobile } from "@/lib/phone";

const isEmail = (value: string) => z.email().safeParse(value).success;

/** A general inquiry from /contact — deliberately lighter than a service
    request. The form uses this as its resolver and POST /api/contact
    re-parses the body with it, so there is one definition of a valid
    message. Phone validation comes from src/lib/phone.ts, the same helper
    the service request schema uses. */
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "الرجاء إدخال الاسم"),
  phone: z
    .string()
    .trim()
    .min(1, "الرجاء إدخال رقم الجوال")
    .refine(isSaudiMobile, SAUDI_MOBILE_ERROR),
  /** Optional: blank passes, anything else must be a real address. */
  email: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || isEmail(value),
      "بريد إلكتروني غير صحيح. مثال: name@example.com",
    ),
  subject: z.string().trim().min(2, "الرجاء إدخال موضوع الرسالة"),
  message: z
    .string()
    .trim()
    .min(10, "الرجاء كتابة رسالتك في 10 أحرف على الأقل"),
});

export type ContactMessageValues = z.infer<typeof contactMessageSchema>;

/** The 400 body from POST /api/contact. */
export type ContactMessageErrorResponse = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<keyof ContactMessageValues, string[]>>;
};

export type ContactMessageSuccessResponse = {
  success: true;
  id: string;
};
