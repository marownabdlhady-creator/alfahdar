import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminMessageUpdateSchema } from "@/lib/validations/admin-message-update";

/** Prisma and the session helper both need Node APIs. */
export const runtime = "nodejs";

const GENERIC_ERROR = "حدث خطأ أثناء تحديث الرسالة، برجاء المحاولة مرة أخرى.";
const UNAUTHORIZED = "الجلسة منتهية، برجاء تسجيل الدخول مرة أخرى.";

/** Updates a contact message's status.

    The proxy only guards /admin pages, never /api, so this handler does
    its own check: no valid session, no update. Nothing here is reachable
    from the public site. */
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

  const parsed = adminMessageUpdateSchema.safeParse(body);
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
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json(
      { success: true, message: updated },
      { status: 200 },
    );
  } catch (error) {
    /* P2025: the row is gone — a 404 rather than a server fault. */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "الرسالة غير موجودة." },
        { status: 404 },
      );
    }

    /* Server-side only; the response says nothing about what went wrong. */
    console.error("[PATCH /api/admin/messages/[id]] update failed", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 },
    );
  }
}
