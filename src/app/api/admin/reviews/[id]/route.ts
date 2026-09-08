import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminReviewUpdateSchema } from "@/lib/validations/admin-review-update";

/** Prisma and the session helper both need Node APIs. */
export const runtime = "nodejs";

const UNAUTHORIZED = "الجلسة منتهية، برجاء تسجيل الدخول مرة أخرى.";
const NOT_FOUND = "التقييم غير موجود.";

function missing(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

/** Approves a review, or takes the approval back.

    The proxy only guards /admin pages, never /api, so this handler does
    its own check: no valid session, no update. Nothing here is reachable
    from the public site — which is what makes POST /api/reviews safe to
    leave open. */
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "صيغة الطلب غير صحيحة." },
      { status: 400 },
    );
  }

  const parsed = adminReviewUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "بعض القيم غير صحيحة، الرجاء مراجعتها.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: parsed.data.isApproved },
      select: { id: true, isApproved: true, updatedAt: true },
    });

    /* The home page carries the approved reviews, so it is the thing that
       has to change — a newly approved review appears, an unapproved one
       disappears, without waiting for the hourly backstop. */
    revalidatePath("/");

    return NextResponse.json(
      { success: true, review: updated },
      { status: 200 },
    );
  } catch (error) {
    if (missing(error)) {
      return NextResponse.json(
        { success: false, error: NOT_FOUND },
        { status: 404 },
      );
    }

    /* Server-side only; the response says nothing about what went wrong. */
    console.error("[PATCH /api/admin/reviews/[id]] update failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء تحديث التقييم، برجاء المحاولة مرة أخرى.",
      },
      { status: 500 },
    );
  }
}

/** Removes a review for good — the dashboard's "reject". */
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
    await prisma.review.delete({ where: { id }, select: { id: true } });

    revalidatePath("/");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (missing(error)) {
      return NextResponse.json(
        { success: false, error: NOT_FOUND },
        { status: 404 },
      );
    }

    console.error("[DELETE /api/admin/reviews/[id]] delete failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ أثناء حذف التقييم، برجاء المحاولة مرة أخرى.",
      },
      { status: 500 },
    );
  }
}
