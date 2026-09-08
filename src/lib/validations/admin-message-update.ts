import { z } from "zod";

import { MESSAGE_STATUSES } from "@/lib/message-status";

/** The dashboard's update of a contact message. A message carries no
    internal notes, so the status is the only column this endpoint owns —
    nothing else the client sends can reach the database. */
export const adminMessageUpdateSchema = z.object({
  status: z.enum(MESSAGE_STATUSES, {
    message: "حالة الرسالة غير صحيحة.",
  }),
});

export type AdminMessageUpdateValues = z.infer<typeof adminMessageUpdateSchema>;
