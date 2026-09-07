import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations/contact-message";

/** Prisma needs Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

const GENERIC_ERROR =
  "حدث خطأ أثناء إرسال رسالتك، برجاء المحاولة مرة أخرى أو التواصل عبر واتساب.";

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

  /* The same schema the form validates against, re-run here: a client can
     always be bypassed. */
  const parsed = contactMessageSchema.safeParse(body);
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

  const values = parsed.data;

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        subject: values.subject,
        message: values.message,
      },
      select: { id: true },
    });

    return NextResponse.json(
      { success: true, id: created.id },
      { status: 201 },
    );
  } catch (error) {
    /* Server-side only. The response says nothing about what went wrong. */
    console.error("[POST /api/contact] failed to create contact message", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 },
    );
  }
}
