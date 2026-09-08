/** The ContactMessageStatus enum values, mirroring prisma/schema.prisma.
    Plain literals, like src/lib/request-status.ts, so a client component
    can import the labels without pulling @prisma/client into the bundle. */
export const MESSAGE_STATUSES = [
  "NEW",
  "READ",
  "REPLIED",
  "ARCHIVED",
] as const;

export type MessageStatusValue = (typeof MESSAGE_STATUSES)[number];

/** The one place a message status is named in Arabic. */
export const MESSAGE_STATUS_LABELS: Record<MessageStatusValue, string> = {
  NEW: "جديدة",
  READ: "مقروءة",
  REPLIED: "تم الرد",
  ARCHIVED: "مؤرشفة",
};

/** Same tokens as the request badges, and the same meanings: blue for
    untouched, accent for seen, green for finished, grey for parked. No new
    colours were needed for the inbox. */
export const MESSAGE_STATUS_BADGE: Record<MessageStatusValue, string> = {
  NEW: "border-status-new/25 bg-status-new/10 text-status-new",
  READ: "border-accent/30 bg-accent/10 text-accent-hover",
  REPLIED: "border-status-done/25 bg-status-done/10 text-status-done",
  ARCHIVED: "border-line bg-muted/10 text-muted",
};

/** false for anything that isn't one of the four enum values. */
export function isMessageStatus(value: string): value is MessageStatusValue {
  return (MESSAGE_STATUSES as readonly string[]).includes(value);
}
