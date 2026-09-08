"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، برجاء المحاولة مرة أخرى.";
const GENERIC_ERROR = "تعذّر حفظ الملاحظات.";

/** Internal notes on a request. Never shown to the client — the public
    site has no route that reads this column. */
export function AdminNotesForm({
  requestId,
  initialNotes,
}: {
  requestId: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(initialNotes);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const dirty = notes !== saved;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || !dirty) return;

    setPending(true);
    setError("");
    setDone(false);

    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : GENERIC_ERROR,
        );
        return;
      }

      setSaved(notes);
      setDone(true);
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <label htmlFor="adminNotes" className="block text-step--1 text-muted">
        ملاحظات داخلية (لا تظهر للعميل)
      </label>

      <textarea
        id="adminNotes"
        name="adminNotes"
        rows={5}
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value);
          setDone(false);
        }}
        maxLength={5000}
        placeholder="مثال: تم التواصل مع العميل، بانتظار تأكيد الموعد."
        className="mt-2 block w-full min-w-0 resize-y rounded-lg border border-line bg-surface px-3.5 py-3 text-step-0 leading-relaxed text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || !dirty}
          className="inline-flex items-center justify-center rounded-lg bg-ink px-6 py-3 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "جارٍ الحفظ…" : "حفظ الملاحظات"}
        </button>

        <p aria-live="polite" className="text-step--1">
          {error ? (
            <span className="text-danger">{error}</span>
          ) : done ? (
            <span className="text-muted">تم حفظ الملاحظات.</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
