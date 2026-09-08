import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AdminNotesForm } from "@/components/admin/admin-notes-form";
import { StatusBadge, UrgentTag } from "@/components/admin/status-badge";
import { StatusControl } from "@/components/admin/status-control";
import { formatDate, formatDateTime } from "@/lib/format";
import { telHref, whatsappHref } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import {
  REQUEST_STATUSES,
  REQUEST_STATUS_BADGE,
  REQUEST_STATUS_LABELS,
} from "@/lib/request-status";
import { CATEGORY_LABELS_AR } from "@/lib/service-category";

/** The status and notes change from this very page; never cache it. */
export const dynamic = "force-dynamic";

const NOT_SET = "غير محدد";

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-step--1 text-muted">{label}</dt>
      <dd className="mt-1 text-step-0 break-words whitespace-pre-line">
        {children}
      </dd>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h3 className="text-step-0 font-semibold tracking-tight">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) notFound();

  const whatsapp = whatsappHref(
    request.phone,
    `السلام عليكم ${request.fullName}، معك فريق الفهدار بخصوص طلبكم رقم ${request.requestNumber}.`,
  );

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-2 text-step--1 font-medium text-muted transition-colors duration-fast ease-out hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {/* RTL: "back" points to the right. An inline path rather than a
            character, so bidi reordering cannot flip it. */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
        رجوع للطلبات
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-step-2 font-bold tracking-tight tabular-nums">
          {request.requestNumber}
        </h2>
        <StatusBadge status={request.status} />
        {request.isUrgent && <UrgentTag />}
      </div>

      <p className="mt-2 text-step--1 text-muted">
        أُرسل في {formatDateTime(request.createdAt)} · آخر تحديث{" "}
        {formatDateTime(request.updatedAt)}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Panel title="بيانات العميل">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الاسم">{request.fullName}</Field>

            <Field label="رقم الجوال">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a
                  href={telHref(request.phone)}
                  className="font-medium tabular-nums underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {request.phone}
                </a>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-step--1 text-muted underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  واتساب
                </a>
              </span>
            </Field>

            <Field label="المدينة">{request.city}</Field>
            <Field label="الحي">{request.district}</Field>
            <Field label="العنوان" wide>
              {request.address || NOT_SET}
            </Field>
          </dl>
        </Panel>

        <Panel title="تفاصيل الطلب">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="نوع الخدمة">
              {CATEGORY_LABELS_AR[request.category]}
            </Field>
            <Field label="الموعد المفضل">
              {request.preferredDate ? formatDate(request.preferredDate) : NOT_SET}
            </Field>
            <Field label="طلب عاجل">{request.isUrgent ? "نعم" : "لا"}</Field>
            <Field label="وصف المشكلة أو المشروع" wide>
              {request.description}
            </Field>
            <Field label="ملاحظات العميل" wide>
              {request.notes || NOT_SET}
            </Field>
          </dl>
        </Panel>

        <Panel title="المرفقات">
          {request.mediaUrls.length === 0 ? (
            <p className="text-step--1 text-muted">لا توجد مرفقات.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {request.mediaUrls.map((url) => (
                <li key={url} className="min-w-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-step--1 underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="إدارة الطلب">
          <StatusControl
            endpoint={`/api/admin/requests/${request.id}`}
            statuses={REQUEST_STATUSES}
            labels={REQUEST_STATUS_LABELS}
            badges={REQUEST_STATUS_BADGE}
            initialStatus={request.status}
            legend="حالة الطلب"
            errorMessage="تعذّر تحديث حالة الطلب."
          />

          <div className="mt-6 border-t border-line pt-6">
            <AdminNotesForm
              requestId={request.id}
              initialNotes={request.adminNotes ?? ""}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
