import { NextResponse } from "next/server";
import { z } from "zod";

import { createServiceRequest } from "@/lib/service-requests";
import { serviceRequestSchema } from "@/lib/validations/service-request";

/** Prisma needs Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

const GENERIC_ERROR =
  "حدث خطأ أثناء إرسال الطلب، برجاء المحاولة مرة أخرى أو التواصل عبر واتساب.";

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
  const parsed = serviceRequestSchema.safeParse(body);
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
    const created = await createServiceRequest({
      fullName: values.fullName,
      phone: values.phone,
      category: values.category,
      description: values.description,
      city: values.city,
      district: values.district,
      address: values.address || null,
      /* YYYY-MM-DD parses as midnight UTC, which is 03:00 the same day in
         Riyadh — so the dashboard formats back the day that was picked.
         Blank stays null: the field is optional. */
      preferredDate: values.preferredDate
        ? new Date(values.preferredDate)
        : null,
      isUrgent: values.isUrgent,
      notes: values.notes || null,
      // TODO(next phase): wire the Vercel Blob upload. The form already
      // collects files; until they are uploaded this stays empty.
      mediaUrls: [],
    });

    return NextResponse.json(
      { success: true, id: created.id, requestNumber: created.requestNumber },
      { status: 201 },
    );
  } catch (error) {
    /* Server-side only. The response says nothing about what went wrong. */
    console.error("[POST /api/requests] failed to create service request", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 },
    );
  }
}
