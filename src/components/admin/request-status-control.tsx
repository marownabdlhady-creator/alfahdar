"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  REQUEST_STATUSES,
  REQUEST_STATUS_BADGE,
  REQUEST_STATUS_LABELS,
  type RequestStatusValue,
} from "@/lib/request-status";
import type { AdminRequestUpdateResponse } from "@/lib/validations/admin-request-update";

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، برجاء المحاولة مرة أخرى.";
const GENERIC_ERROR = "تعذّر تحديث حالة الطلب.";

/** The six statuses as a row of buttons: one tap to move a request along,
    which is what this screen is for. The chosen status is applied locally
    as soon as the API confirms, and `router.refresh()` re-renders the
    server page behind it so the badge at the top and the list agree. */
export function RequestStatusControl({
  requestId,
  initialStatus,
}: {
  requestId: string;
  initialStatus: RequestStatusValue;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatusValue>(initialStatus);
  const [pending, setPending] = useState<RequestStatusValue | null>(null);
  const [error, setError] = useState("");

  const change = async (next: RequestStatusValue) => {
    if (next === status || pending) return;

    setPending(next);
    setError("");

    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : GENERIC_ERROR;
        setError(message);
        return;
      }

      setStatus((data as AdminRequestUpdateResponse).request.status);
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setPending(null);
    }
  };

  return (
    <div>
      <fieldset disabled={pending !== null}>
        <legend className="text-step--1 text-muted">حالة الطلب</legend>

        <div className="mt-2.5 flex flex-wrap gap-2">
          {REQUEST_STATUSES.map((option) => {
            const active = option === status;

            return (
              <button
                key={option}
                type="button"
                onClick={() => change(option)}
                aria-pressed={active}
                className={[
                  "inline-flex items-center rounded-full border px-4 py-2 text-step--1 font-medium transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed",
                  active
                    ? REQUEST_STATUS_BADGE[option]
                    : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink",
                  pending === option ? "opacity-60" : "",
                  pending !== null && pending !== option ? "opacity-50" : "",
                ].join(" ")}
              >
                {REQUEST_STATUS_LABELS[option]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p aria-live="polite" className="mt-2 min-h-[1.5rem] text-step--1">
        {error ? (
          <span className="text-danger">{error}</span>
        ) : pending ? (
          <span className="text-muted">جارٍ الحفظ…</span>
        ) : null}
      </p>
    </div>
  );
}
