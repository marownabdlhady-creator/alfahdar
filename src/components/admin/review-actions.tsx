"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، برجاء المحاولة مرة أخرى.";

const SECONDARY =
  "inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-step--1 font-medium text-muted transition-colors duration-fast ease-out hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const APPROVE =
  "inline-flex items-center justify-center rounded-lg border border-status-done/40 bg-status-done/10 px-4 py-2 text-step--1 font-medium text-status-done transition-colors duration-fast ease-out hover:border-status-done focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const DANGER =
  "inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-step--1 font-medium text-danger transition-colors duration-fast ease-out hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const DANGER_CONFIRM =
  "inline-flex items-center justify-center rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-step--1 font-medium text-danger transition-colors duration-fast ease-out hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

/** Reads the API's Arabic message, or falls back to our own. */
async function readError(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);

  return data && typeof data === "object" && "error" in data
    ? String((data as { error: unknown }).error)
    : fallback;
}

/** Approve, take the approval back, or drop the review for good. Delete
    asks for a second tap rather than opening a browser dialog. */
export function ReviewActions({
  id,
  isApproved,
}: {
  id: string;
  isApproved: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const setApproval = async (next: boolean) => {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: next }),
      });

      if (!response.ok) {
        setError(await readError(response, "تعذّر تحديث التقييم."));
        return;
      }

      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError(await readError(response, "تعذّر حذف التقييم."));
        return;
      }

      setConfirming(false);
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {isApproved ? (
          <button
            type="button"
            onClick={() => setApproval(false)}
            disabled={pending}
            className={SECONDARY}
          >
            إلغاء الموافقة
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setApproval(true)}
            disabled={pending}
            className={APPROVE}
          >
            موافقة
          </button>
        )}

        {confirming ? (
          <>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className={DANGER_CONFIRM}
            >
              {pending ? "جارٍ الحذف…" : "تأكيد الحذف"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className={SECONDARY}
            >
              تراجع
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={pending}
            className={DANGER}
          >
            حذف
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-step--1 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
