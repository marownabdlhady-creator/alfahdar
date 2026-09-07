import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthCookie, signAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_LOGIN_FAILED,
  adminLoginSchema,
} from "@/lib/validations/admin-login";

/** bcrypt and Prisma both need Node APIs. */
export const runtime = "nodejs";

const GENERIC_ERROR = "حدث خطأ أثناء تسجيل الدخول، برجاء المحاولة مرة أخرى.";

/* A hash to compare against when no admin matches the email. Without it the
   endpoint would answer noticeably faster for unknown addresses, which is a
   way to enumerate accounts even behind an identical message. The value is
   a bcrypt hash of a random string; it never matches anything. */
const DUMMY_HASH =
  "$2b$12$VZJZ.k3WR8eGZb6UVqZgtO9quN5JLpMKBolrseMTMAZ/gH/OU5Gkq";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "صيغة الطلب غير صحيحة." },
      { status: 400 },
    );
  }

  const parsed = adminLoginSchema.safeParse(body);
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

  const { email, password } = parsed.data;

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true },
    });

    const matches = await bcrypt.compare(
      password,
      admin?.passwordHash ?? DUMMY_HASH,
    );

    /* One message for "no such admin" and for "wrong password" alike. */
    if (!admin || !matches) {
      return NextResponse.json(
        { success: false, error: ADMIN_LOGIN_FAILED },
        { status: 401 },
      );
    }

    const token = await signAdminToken({ sub: admin.id, email: admin.email });
    await setAuthCookie(token);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    /* Server-side only, and never the credentials themselves. */
    console.error("[POST /api/admin/login] login failed", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 },
    );
  }
}
