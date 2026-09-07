import { z } from "zod";

import { SAUDI_MOBILE_ERROR, isSaudiMobile } from "./phone";

const isEmail = (value: string) => z.email().safeParse(value).success;

/** A general inquiry — deliberately lighter than the service request form.
    Shared by the form today and by the API route in the backend phase. */
export const contactSchema = z.object({
  name: z.string().trim().min(3, "الرجاء إدخال الاسم"),
  phone: z
    .string()
    .trim()
    .min(1, "الرجاء إدخال رقم الجوال")
    .refine(isSaudiMobile, SAUDI_MOBILE_ERROR),
  /** Optional: blank passes, anything else must be a real address. */
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isEmail(value),
      "بريد إلكتروني غير صحيح. مثال: name@example.com",
    ),
  subject: z.string().trim().min(3, "الرجاء إدخال موضوع الرسالة"),
  message: z
    .string()
    .trim()
    .min(10, "الرجاء كتابة رسالتك في 10 أحرف على الأقل"),
});

export type ContactValues = z.infer<typeof contactSchema>;
