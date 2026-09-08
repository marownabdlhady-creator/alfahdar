import { z } from "zod";

import { SERVICE_CATEGORIES } from "@/lib/service-category";

/* The gallery form posts multipart/form-data — the image has to travel as
   a file — so every field arrives as a string. These schemas coerce and
   validate what the routes then hand to Prisma; nothing else in the body
   can reach a column. */

const title = z.string().trim().min(2, "الرجاء إدخال عنوان العمل");

const category = z.enum(SERVICE_CATEGORIES, {
  message: "الرجاء اختيار القسم",
});

/** An empty field means 0, the default the column already carries. */
const order = z
  .string()
  .trim()
  .transform((value) => (value === "" ? 0 : Number(value)))
  .pipe(
    z
      .number({ message: "الترتيب يجب أن يكون رقماً" })
      .int("الترتيب يجب أن يكون رقماً صحيحاً")
      .min(0, "الترتيب لا يقل عن صفر")
      .max(9999, "الترتيب كبير جداً"),
  );

/** A checkbox posts "on" when ticked and nothing at all when not, so the
    form sends the value explicitly instead. */
const isPublished = z
  .string()
  .trim()
  .transform((value) => value === "true" || value === "on");

export const workCreateSchema = z.object({
  title,
  category,
  order,
  isPublished,
});

/** The same fields on edit. The image is optional there — no file means
    the row keeps the one it has — and is checked by the route, not here,
    because zod has no business validating a File. */
export const workUpdateSchema = workCreateSchema;

export type WorkCreateValues = z.infer<typeof workCreateSchema>;
