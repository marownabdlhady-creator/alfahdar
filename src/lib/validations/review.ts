import { z } from "zod";

import { SERVICES } from "@/lib/services";

/** The service names a review may carry: the seven category titles, taken
    from the catalogue so the dropdown and the check can never disagree. */
export const REVIEW_SERVICE_LABELS = SERVICES.map((service) => service.title);

export const REVIEW_MIN_RATING = 1;
export const REVIEW_MAX_RATING = 5;
export const REVIEW_MAX_COMMENT = 500;

/** A review as a visitor submits it. The form uses this as its resolver
    and POST /api/reviews re-parses the body with the very same schema, so
    there is one definition of a valid review.

    `isApproved` is deliberately absent: approval is the dashboard's to
    give, and the route never reads it off the request. */
export const reviewSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "الرجاء إدخال الاسم")
    .max(80, "الاسم طويل جداً"),
  serviceLabel: z
    .string()
    .trim()
    .refine(
      (value) => REVIEW_SERVICE_LABELS.includes(value),
      "الرجاء اختيار نوع الخدمة",
    ),
  rating: z
    .number({ message: "الرجاء اختيار التقييم" })
    .int("التقييم يجب أن يكون رقماً صحيحاً")
    .min(REVIEW_MIN_RATING, "الرجاء اختيار التقييم")
    .max(REVIEW_MAX_RATING, "التقييم لا يزيد عن 5 نجوم"),
  comment: z
    .string()
    .trim()
    .min(10, "الرجاء كتابة تعليقك في 10 أحرف على الأقل")
    .max(REVIEW_MAX_COMMENT, `التعليق لا يزيد عن ${REVIEW_MAX_COMMENT} حرف`),
});

export type ReviewValues = z.infer<typeof reviewSchema>;

/** The 400 body from POST /api/reviews. */
export type ReviewErrorResponse = {
  success: false;
  error: string;
  fieldErrors?: Partial<Record<keyof ReviewValues, string[]>>;
};
