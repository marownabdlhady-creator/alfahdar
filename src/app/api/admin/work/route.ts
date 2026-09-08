import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth";
import { uploadWorkImage } from "@/lib/blob";
import { imageFileError } from "@/lib/image-limits";
import { prisma } from "@/lib/prisma";
import { workCreateSchema } from "@/lib/validations/admin-work";

/** Prisma, the session helper and the Blob SDK all need Node APIs. */
export const runtime = "nodejs";

const GENERIC_ERROR = "حدث خطأ أثناء إضافة العمل، برجاء المحاولة مرة أخرى.";
const UNAUTHORIZED = "الجلسة منتهية، برجاء تسجيل الدخول مرة أخرى.";

/** Adds a gallery item: the image goes to the Blob store, the row to the
    database. Admin-only — the proxy guards /admin pages, never /api, so
    this handler checks the session itself. */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: UNAUTHORIZED },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "صيغة الطلب غير صحيحة." },
      { status: 400 },
    );
  }

  const parsed = workCreateSchema.safeParse({
    title: form.get("title") ?? "",
    category: form.get("category") ?? "",
    order: form.get("order") ?? "",
    isPublished: form.get("isPublished") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "بعض الحقول غير صحيحة، الرجاء مراجعتها.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const file = form.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "الرجاء اختيار صورة للعمل." },
      { status: 400 },
    );
  }

  const fileError = imageFileError(file);
  if (fileError) {
    return NextResponse.json(
      { success: false, error: fileError },
      { status: 400 },
    );
  }

  try {
    const imageUrl = await uploadWorkImage(file);

    const created = await prisma.workItem.create({
      data: { ...parsed.data, imageUrl },
      select: { id: true },
    });

    /* The public gallery is cached; without this the new photo would wait
       for the hourly backstop. */
    revalidatePath("/work");

    return NextResponse.json(
      { success: true, id: created.id },
      { status: 201 },
    );
  } catch (error) {
    /* Server-side only, and never the blob token. */
    console.error("[POST /api/admin/work] could not add the item", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 },
    );
  }
}
