/** The RequestStatus enum values, mirroring prisma/schema.prisma. Plain
    literals, like src/lib/service-category.ts, so a client component can
    import the labels without pulling @prisma/client into the bundle. */
export const REQUEST_STATUSES = [
  "NEW",
  "CONTACTED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RequestStatusValue = (typeof REQUEST_STATUSES)[number];

/** The one place a status is named in Arabic. */
export const REQUEST_STATUS_LABELS: Record<RequestStatusValue, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  SCHEDULED: "تم تحديد موعد",
  IN_PROGRESS: "جاري التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

/** Badge colours, one hue per status (tokens only — see globals.css).
    Tinted background, hairline border, coloured text: legible on both
    --color-bg and --color-surface without shouting. */
export const REQUEST_STATUS_BADGE: Record<RequestStatusValue, string> = {
  NEW: "border-status-new/25 bg-status-new/10 text-status-new",
  CONTACTED: "border-accent/30 bg-accent/10 text-accent-hover",
  SCHEDULED:
    "border-status-scheduled/25 bg-status-scheduled/10 text-status-scheduled",
  IN_PROGRESS:
    "border-status-progress/25 bg-status-progress/10 text-status-progress",
  COMPLETED: "border-status-done/25 bg-status-done/10 text-status-done",
  CANCELLED: "border-line bg-muted/10 text-muted",
};

/** false for anything that isn't one of the six enum values. */
export function isRequestStatus(value: string): value is RequestStatusValue {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}
