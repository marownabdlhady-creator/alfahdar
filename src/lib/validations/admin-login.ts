import { z } from "zod";

/** The login payload. The form uses this as its resolver and
    POST /api/admin/login re-parses the body with it, so there is one
    definition of a well-formed attempt. Note it only checks *shape* —
    whether the credentials are right is decided server-side, and the
    answer is always the same generic message. */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "الرجاء إدخال البريد الإلكتروني")
    .pipe(z.email("بريد إلكتروني غير صحيح. مثال: name@example.com")),
  password: z.string().min(1, "الرجاء إدخال كلمة المرور"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

/** Deliberately generic: it never says which of the two was wrong, so the
    endpoint cannot be used to discover which emails exist. */
export const ADMIN_LOGIN_FAILED = "بيانات الدخول غير صحيحة";

export type AdminLoginErrorResponse = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<keyof AdminLoginValues, string[]>>;
};

export type AdminLoginSuccessResponse = {
  success: true;
};
