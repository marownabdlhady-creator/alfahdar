import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";

/** Prisma needs Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

const GENERIC_ERROR =
  "حدث خطأ أثناء إرسال تقييمك، برجاء المحاولة مرة أخرى.";

/** The one public write on this resource. A review lands unapproved and
    stays invisible until an admin says otherwise: `isApproved` is set
    here, never read from the body, so no payload can publish itself. */
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
     always be bypassed. It also caps every field's length, which is what
     keeps a scripted submission from writing an essay into the table. */
  const parsed = reviewSchema.safeParse(body);
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

  try {
    await prisma.review.create({
      data: { ...parsed.data, isApproved: false },
      select: { id: true },
    });

    /* No id in the response: the visitor has nothing to do with it, and a
       pending review is not theirs to look up. */
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    /* Server-side only. The response says nothing about what went wrong. */
    console.error("[POST /api/reviews] failed to create review", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 },
    );
  }
}
