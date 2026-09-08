import {
  MESSAGE_STATUS_BADGE,
  MESSAGE_STATUS_LABELS,
  type MessageStatusValue,
} from "@/lib/message-status";
import {
  REQUEST_STATUS_BADGE,
  REQUEST_STATUS_LABELS,
  type RequestStatusValue,
} from "@/lib/request-status";

const BADGE =
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-step--1 font-medium whitespace-nowrap";

/** The one way a request status is drawn — list, detail and stat cards
    all render this, so a status always looks the same. */
export function StatusBadge({
  status,
  className = "",
}: {
  status: RequestStatusValue;
  className?: string;
}) {
  return (
    <span className={[BADGE, REQUEST_STATUS_BADGE[status], className].join(" ")}>
      {REQUEST_STATUS_LABELS[status]}
    </span>
  );
}

/** The same badge for the contact inbox. */
export function MessageStatusBadge({
  status,
  className = "",
}: {
  status: MessageStatusValue;
  className?: string;
}) {
  return (
    <span className={[BADGE, MESSAGE_STATUS_BADGE[status], className].join(" ")}>
      {MESSAGE_STATUS_LABELS[status]}
    </span>
  );
}

/** The "عاجل" flag, shown next to a status wherever isUrgent is true. */
export function UrgentTag() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-danger/25 bg-danger/10 px-2.5 py-1 text-step--1 font-medium whitespace-nowrap text-danger">
      عاجل
    </span>
  );
}
