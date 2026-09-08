import { z } from "zod";

import { REQUEST_STATUSES } from "@/lib/request-status";

/** The dashboard's partial update of a service request. Both fields are
    optional so the status control and the notes form can each send only
    what they changed, but a body with neither is rejected — an empty PATCH
    is a bug, not a no-op worth writing to the database.

    Nothing the client sends can touch any other column: PATCH
    /api/admin/requests/[id] passes only what this schema returns. */
export const adminRequestUpdateSchema = z
  .object({
    status: z.enum(REQUEST_STATUSES, {
      message: "حالة الطلب غير صحيحة.",
    }),
    /** Trimmed; an empty textarea clears the column rather than storing "". */
    adminNotes: z.string().trim().max(5000, "الملاحظات طويلة جداً."),
  })
  .partial()
  .refine(
    (values) => values.status !== undefined || values.adminNotes !== undefined,
    { message: "لا يوجد أي تغيير في الطلب." },
  );

export type AdminRequestUpdateValues = z.infer<typeof adminRequestUpdateSchema>;
