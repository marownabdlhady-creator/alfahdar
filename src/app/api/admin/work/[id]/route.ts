import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth";
import { deleteWorkImage, uploadWorkImage } from "@/lib/blob";
import { imageFileError } from "@/lib/image-limits";
import { prisma } from "@/lib/prisma";
import { workUpdateSchema } from "@/lib/validations/admin-work";

/** Prisma, the session helper and the Blob SDK all need Node APIs. */
export const runtime = "nodejs";

const UNAUTHORIZED = "الجلسة منتهية، برجاء تسجيل الدخول مرة أخرى.";
const NOT_FOUND = "العمل غير موجود.";

function missing(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/** Edits a gallery item. A file under `image` replaces the picture — the
    old blob is then dropped, best effort — and no file leaves it alone.
    The publish toggle sends only `isPublished` and the rest unchanged. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: UNAUTHORIZED },
      { status: 401 },
    );
  }

  const { id } = await params;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "صيغة الطلب غير صحيحة." },
      { status: 400 },
    );
  }

  const parsed = workUpdateSchema.safeParse({
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

  /* An untouched file input posts an empty File; treat that as "no new
     image" rather than as a broken upload. */
  const file = form.get("image");
  const replacement = file instanceof File && file.size > 0 ? file : null;

  if (replacement) {
    const fileError = imageFileError(replacement);
    if (fileError) {
      return NextResponse.json(
        { success: false, error: fileError },
        { status: 400 },
      );
    }
  }

  try {
    const current = await prisma.workItem.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!current) {
      return NextResponse.json(
        { success: false, error: NOT_FOUND },
        { status: 404 },
      );
    }

    const imageUrl = replacement
      ? await uploadWorkImage(replacement)
      : current.imageUrl;

    const updated = await prisma.workItem.update({
      where: { id },
      data: { ...parsed.data, imageUrl },
      select: { id: true },
    });

    /* Only once the row points at the new file, so a failed update never
       leaves the gallery showing a picture that has been deleted. */
    if (replacement) await deleteWorkImage(current.imageUrl);

    revalidatePath("/work");

    return NextResponse.json({ success: true, id: updated.id }, { status: 200 });
  } catch (error) {
    if (missing(error)) {
      return NextResponse.json(
        { success: false, error: NOT_FOUND },
        { status: 404 },
      );
    }

    /* Server-side only, and never the blob token. */
    console.error("[PATCH /api/admin/work/[id]] update failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء تعديل العمل، برجاء المحاولة مرة أخرى.",
      },
      { status: 500 },
    );
  }
}

/** Removes a gallery item, and its blob with it. A /public path is a file
    in the repository, so only the row goes. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: UNAUTHORIZED },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    const deleted = await prisma.workItem.delete({
      where: { id },
      select: { imageUrl: true },
    });

    await deleteWorkImage(deleted.imageUrl);

    revalidatePath("/work");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (missing(error)) {
      return NextResponse.json(
        { success: false, error: NOT_FOUND },
        { status: 404 },
      );
    }

    console.error("[DELETE /api/admin/work/[id]] delete failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء حذف العمل، برجاء المحاولة مرة أخرى.",
      },
      { status: 500 },
    );
  }
}
