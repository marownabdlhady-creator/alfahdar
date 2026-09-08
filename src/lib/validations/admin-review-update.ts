import { z } from "zod";

/** The dashboard's update of a review. Approval is the only thing an admin
    changes — the words are the client's — so it is the only field this
    endpoint accepts, and nothing else in the body can reach a column. */
export const adminReviewUpdateSchema = z.object({
  isApproved: z.boolean({ message: "قيمة الموافقة غير صحيحة." }),
});

export type AdminReviewUpdateValues = z.infer<typeof adminReviewUpdateSchema>;
