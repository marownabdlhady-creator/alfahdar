import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { MessageStatusBadge } from "@/components/admin/status-badge";
import { StatusControl } from "@/components/admin/status-control";
import { formatDateTime } from "@/lib/format";
import {
  MESSAGE_STATUSES,
  MESSAGE_STATUS_BADGE,
  MESSAGE_STATUS_LABELS,
} from "@/lib/message-status";
import { telHref, whatsappHref } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

/** The status changes from this very page; never cache it. */
export const dynamic = "force-dynamic";

const NOT_SET = "غير محدد";

const QUICK_ACTION =
  "inline-flex items-center justify-center rounded-lg px-5 py-3 text-step--1 font-medium transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h3 className="text-step-0 font-semibold tracking-tight">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  const whatsapp = whatsappHref(
    message.phone,
    `السلام عليكم ${message.name}، معك فريق الفهدار بخصوص رسالتكم: ${message.subject}.`,
  );

  const mailto = message.email
    ? `mailto:${message.email}?subject=${encodeURIComponent(`رد: ${message.subject}`)}`
    : null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link
        href="/admin/messages"
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
        رجوع للرسائل
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-step-2 font-bold tracking-tight">
          {message.subject}
        </h2>
        <MessageStatusBadge status={message.status} />
      </div>

      <p className="mt-2 text-step--1 text-muted">
        وردت في {formatDateTime(message.createdAt)} · آخر تحديث{" "}
        {formatDateTime(message.updatedAt)}
      </p>

      {/* The point of opening a message is to answer it, so the two ways of
          doing that sit above everything else. */}
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${QUICK_ACTION} bg-ink text-ink-invert hover:bg-accent hover:text-ink`}
        >
          الرد عبر واتساب
        </a>

        {mailto ? (
          <a
            href={mailto}
            className={`${QUICK_ACTION} border border-line text-ink hover:border-ink hover:bg-bg`}
          >
            الرد عبر البريد
          </a>
        ) : (
          /* No address on the message, so there is nothing to open. */
          <span className={`${QUICK_ACTION} border border-line text-muted`}>
            لا يوجد بريد للرد
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Panel title="بيانات المرسل">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الاسم">{message.name}</Field>

            <Field label="رقم الجوال">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a
                  href={telHref(message.phone)}
                  className="font-medium tabular-nums underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {message.phone}
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

            <Field label="البريد الإلكتروني" wide>
              {message.email ? (
                <a
                  href={`mailto:${message.email}`}
                  className="underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  {message.email}
                </a>
              ) : (
                NOT_SET
              )}
            </Field>
          </dl>
        </Panel>

        <Panel title="الرسالة">
          <dl className="grid grid-cols-1 gap-4">
            <Field label="الموضوع">{message.subject}</Field>
            <Field label="نص الرسالة">{message.message}</Field>
          </dl>
        </Panel>

        <Panel title="إدارة الرسالة">
          <StatusControl
            endpoint={`/api/admin/messages/${message.id}`}
            statuses={MESSAGE_STATUSES}
            labels={MESSAGE_STATUS_LABELS}
            badges={MESSAGE_STATUS_BADGE}
            initialStatus={message.status}
            legend="حالة الرسالة"
            errorMessage="تعذّر تحديث حالة الرسالة."
          />
        </Panel>
      </div>
    </div>
  );
}
