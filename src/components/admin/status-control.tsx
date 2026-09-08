"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، برجاء المحاولة مرة أخرى.";

/** A row of statuses as buttons: one tap moves a row along, which is what
    these screens are for. Shared by service requests and contact messages
    — the two differ only in their endpoint and their label and badge maps,
    so they pass those in rather than each carrying a copy of the fetch,
    pending and error handling.

    The button that answers 200 is the new status; the API validated the
    value it was sent, so there is nothing to read back off the response.
    `router.refresh()` then re-renders the server page behind it, keeping
    the badge at the top of the page and the list in agreement. */
export function StatusControl<T extends string>({
  endpoint,
  statuses,
  labels,
  badges,
  initialStatus,
  legend,
  errorMessage,
}: {
  /** The PATCH endpoint. It receives `{ status }` as JSON. */
  endpoint: string;
  statuses: readonly T[];
  labels: Record<T, string>;
  badges: Record<T, string>;
  initialStatus: T;
  legend: string;
  /** Fallback when the API answers without a usable Arabic message. */
  errorMessage: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<T>(initialStatus);
  const [pending, setPending] = useState<T | null>(null);
  const [error, setError] = useState("");

  const change = async (next: T) => {
    if (next === status || pending) return;

    setPending(next);
    setError("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);
        setError(
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : errorMessage,
        );
        return;
      }

      setStatus(next);
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
        <legend className="text-step--1 text-muted">{legend}</legend>

        <div className="mt-2.5 flex flex-wrap gap-2">
          {statuses.map((option) => {
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
                    ? badges[option]
                    : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink",
                  pending !== null && pending !== option ? "opacity-50" : "",
                  pending === option ? "opacity-60" : "",
                ].join(" ")}
              >
                {labels[option]}
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
