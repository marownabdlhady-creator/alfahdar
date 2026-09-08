"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { MAX_IMAGE_BYTES, MAX_IMAGE_MB } from "@/lib/image-limits";
import {
  CATEGORY_LABELS_AR,
  SERVICE_CATEGORIES,
  type ServiceCategoryValue,
} from "@/lib/service-category";

/** A gallery row as the dashboard passes it in. */
export type AdminWorkItem = {
  id: string;
  title: string;
  category: ServiceCategoryValue;
  imageUrl: string;
  order: number;
  isPublished: boolean;
};

const NETWORK_ERROR = "تعذّر الاتصال بالخادم، برجاء المحاولة مرة أخرى.";
const GENERIC_ERROR = "تعذّر حفظ العمل.";

const FIELD =
  "block w-full min-w-0 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent";

const PRIMARY =
  "inline-flex items-center justify-center rounded-lg bg-ink px-5 py-3 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY =
  "inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-step--1 font-medium text-muted transition-colors duration-fast ease-out hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

/** The blank form, and the shape the editor keeps while it is open. */
type FormState = {
  title: string;
  category: ServiceCategoryValue;
  order: string;
  isPublished: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  category: SERVICE_CATEGORIES[0],
  order: "0",
  isPublished: true,
};

/** Reads the API's Arabic message, or falls back to our own. */
async function readError(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);

  return data && typeof data === "object" && "error" in data
    ? String((data as { error: unknown }).error)
    : fallback;
}

export function WorkManager({ items }: { items: AdminWorkItem[] }) {
  const router = useRouter();

  /* null = the editor is closed; "new" = adding; an id = editing that row. */
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [listError, setListError] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  /* An object URL is a live handle to the file; letting it pile up leaks. */
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const closeEditor = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setFormError("");
  };

  const startAdding = () => {
    closeEditor();
    setEditing("new");
  };

  const startEditing = (item: AdminWorkItem) => {
    closeEditor();
    setEditing(item.id);
    setForm({
      title: item.title,
      category: item.category,
      order: String(item.order),
      isPublished: item.isPublished,
    });
  };

  const pickFile = (chosen: File | null) => {
    setFormError("");
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    if (!chosen) {
      setFile(null);
      return;
    }

    /* The same two limits the API enforces, checked here so a mistake
       costs no upload. */
    if (!chosen.type.startsWith("image/")) {
      setFormError("الرجاء اختيار ملف صورة.");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    if (chosen.size > MAX_IMAGE_BYTES) {
      setFormError(`حجم الصورة كبير. الحد الأقصى ${MAX_IMAGE_MB} ميجابايت.`);
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      return;
    }

    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || !editing) return;

    const adding = editing === "new";
    if (adding && !file) {
      setFormError("الرجاء اختيار صورة للعمل.");
      return;
    }

    setSaving(true);
    setFormError("");

    const body = new FormData();
    body.set("title", form.title);
    body.set("category", form.category);
    body.set("order", form.order);
    body.set("isPublished", String(form.isPublished));
    if (file) body.set("image", file);

    try {
      const response = await fetch(
        adding ? "/api/admin/work" : `/api/admin/work/${editing}`,
        { method: adding ? "POST" : "PATCH", body },
      );

      if (!response.ok) {
        setFormError(await readError(response, GENERIC_ERROR));
        return;
      }

      closeEditor();
      router.refresh();
    } catch {
      setFormError(NETWORK_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: AdminWorkItem) => {
    if (busyId) return;

    setBusyId(item.id);
    setListError("");

    const body = new FormData();
    body.set("title", item.title);
    body.set("category", item.category);
    body.set("order", String(item.order));
    body.set("isPublished", String(!item.isPublished));

    try {
      const response = await fetch(`/api/admin/work/${item.id}`, {
        method: "PATCH",
        body,
      });

      if (!response.ok) {
        setListError(await readError(response, "تعذّر تغيير حالة النشر."));
        return;
      }

      router.refresh();
    } catch {
      setListError(NETWORK_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (busyId) return;

    setBusyId(id);
    setListError("");

    try {
      const response = await fetch(`/api/admin/work/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setListError(await readError(response, "تعذّر حذف العمل."));
        return;
      }

      setConfirming(null);
      if (editing === id) closeEditor();
      router.refresh();
    } catch {
      setListError(NETWORK_ERROR);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-step-1 font-semibold tracking-tight">
            معرض الأعمال
          </h2>
          <p className="mt-1 text-step--1 text-muted">
            عدد الأعمال: <span className="tabular-nums">{items.length}</span> —
            المنشور يظهر في صفحة الأعمال.
          </p>
        </div>

        {editing === null && (
          <button type="button" onClick={startAdding} className={PRIMARY}>
            إضافة عمل جديد
          </button>
        )}
      </div>

      {editing !== null && (
        <form
          onSubmit={submit}
          className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6"
        >
          <h3 className="text-step-0 font-semibold tracking-tight">
            {editing === "new" ? "إضافة عمل جديد" : "تعديل العمل"}
          </h3>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="image" className="block text-step--1 text-muted">
                {editing === "new"
                  ? "صورة العمل (مطلوبة)"
                  : "استبدال الصورة (اختياري)"}
              </label>
              <input
                ref={fileInput}
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                className={`${FIELD} mt-1.5 file:me-3 file:rounded-md file:border-0 file:bg-bg file:px-3 file:py-1.5 file:text-step--1 file:text-ink`}
              />
              <p className="mt-1.5 text-step--1 text-muted">
                JPG أو PNG أو WEBP — بحد أقصى {MAX_IMAGE_MB} ميجابايت.
              </p>

              {preview && (
                /* A blob: URL is local to this tab; next/image cannot
                   optimize it, so the preview is a plain <img>. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="معاينة الصورة المختارة"
                  className="mt-3 h-40 w-auto max-w-full rounded-lg border border-line object-contain"
                />
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-step--1 text-muted">
                عنوان العمل
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="مثال: تشطيب فيلا سكنية"
                className={`${FIELD} mt-1.5`}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-step--1 text-muted"
              >
                القسم
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as ServiceCategoryValue,
                  }))
                }
                className={`${FIELD} mt-1.5`}
              >
                {SERVICE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS_AR[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="order" className="block text-step--1 text-muted">
                الترتيب (الأصغر يظهر أولاً)
              </label>
              <input
                id="order"
                name="order"
                type="number"
                min={0}
                max={9999}
                value={form.order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    order: event.target.value,
                  }))
                }
                className={`${FIELD} mt-1.5`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-3 text-step-0">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isPublished: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 shrink-0 rounded border-line accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                منشور في معرض الأعمال
              </label>
            </div>
          </div>

          {formError && (
            <p role="alert" className="mt-4 text-step--1 text-danger">
              {formError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className={PRIMARY}>
              {saving ? "جارٍ الحفظ…" : "حفظ"}
            </button>
            <button
              type="button"
              onClick={closeEditor}
              disabled={saving}
              className={SECONDARY}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {listError && (
        <p role="alert" className="mt-5 text-step--1 text-danger">
          {listError}
        </p>
      )}

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-line bg-surface px-4 py-12 text-center text-step-0 text-muted">
          لا توجد أعمال بعد. ابدأ بإضافة أول عمل.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const busy = busyId === item.id;

            return (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface"
              >
                <div className="relative aspect-[4/3] w-full bg-bg">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-step--1 font-medium whitespace-nowrap",
                        item.isPublished
                          ? "border-status-done/25 bg-status-done/10 text-status-done"
                          : "border-line bg-muted/10 text-muted",
                      ].join(" ")}
                    >
                      {item.isPublished ? "منشور" : "مخفي"}
                    </span>
                    <span className="text-step--1 text-muted">
                      ترتيب <span className="tabular-nums">{item.order}</span>
                    </span>
                  </div>

                  <p className="mt-3 text-step-0 font-semibold break-words">
                    {item.title}
                  </p>
                  <p className="mt-1 text-step--1 text-muted">
                    {CATEGORY_LABELS_AR[item.category]}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      disabled={busy}
                      className={SECONDARY}
                    >
                      تعديل
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePublished(item)}
                      disabled={busy}
                      className={SECONDARY}
                    >
                      {item.isPublished ? "إخفاء" : "نشر"}
                    </button>

                    {confirming === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          disabled={busy}
                          className="inline-flex items-center justify-center rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-step--1 font-medium text-danger transition-colors duration-fast ease-out hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? "جارٍ الحذف…" : "تأكيد الحذف"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          disabled={busy}
                          className={SECONDARY}
                        >
                          تراجع
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(item.id)}
                        disabled={busy}
                        className="inline-flex items-center justify-center rounded-lg border border-line px-4 py-2 text-step--1 font-medium text-danger transition-colors duration-fast ease-out hover:border-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
