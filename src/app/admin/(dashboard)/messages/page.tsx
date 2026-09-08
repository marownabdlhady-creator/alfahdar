import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { MessageStatusBadge } from "@/components/admin/status-badge";
import { formatDateTime } from "@/lib/format";
import {
  MESSAGE_STATUSES,
  MESSAGE_STATUS_LABELS,
  isMessageStatus,
  type MessageStatusValue,
} from "@/lib/message-status";
import { prisma } from "@/lib/prisma";

/** Rows change under the admin's feet; never serve a cached list. */
export const dynamic = "force-dynamic";

/** The same page size as /admin/requests, so the two lists behave alike. */
const PAGE_SIZE = 25;

type SearchParams = Record<string, string | string[] | undefined>;

/** A repeated ?q= is a malformed URL, not an error worth a page for. */
const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

/** Filters as the page understands them, after everything unrecognised has
    been dropped — a hand-edited ?status=FOO simply falls back to "all". */
type Filters = {
  status: MessageStatusValue | null;
  q: string;
  page: number;
};

function readFilters(params: SearchParams): Filters {
  const status = first(params.status);
  const page = Number.parseInt(first(params.page), 10);

  return {
    status: isMessageStatus(status) ? status : null,
    q: first(params.q),
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

/** A link that keeps the filters already in the URL and changes one of
    them, so no chip can quietly drop the search term. */
function buildHref(filters: Filters, overrides: Partial<Filters>) {
  const next = { ...filters, ...overrides };
  const search = new URLSearchParams();

  if (next.status) search.set("status", next.status);
  if (next.q) search.set("q", next.q);
  if (next.page > 1) search.set("page", String(next.page));

  const query = search.toString();
  return query ? `/admin/messages?${query}` : "/admin/messages";
}

const FIELD =
  "block w-full min-w-0 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = readFilters(await searchParams);

  /* The search alone, so the chips can show how many rows each status
     holds *within* the current search. */
  const baseWhere: Prisma.ContactMessageWhereInput = filters.q
    ? {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { phone: { contains: filters.q, mode: "insensitive" } },
          { email: { contains: filters.q, mode: "insensitive" } },
          { subject: { contains: filters.q, mode: "insensitive" } },
        ],
      }
    : {};

  const where: Prisma.ContactMessageWhereInput = {
    ...baseWhere,
    ...(filters.status && { status: filters.status }),
  };

  const [messages, total, byStatus, allCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        phone: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.contactMessage.count({ where: baseWhere }),
  ]);

  const counts = Object.fromEntries(
    MESSAGE_STATUSES.map((status) => [status, 0]),
  ) as Record<MessageStatusValue, number>;
  for (const row of byStatus) counts[row.status] = row._count._all;

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(filters.status || filters.q);

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* One GET form: no JavaScript, and the resulting URL is shareable. */}
      <form
        action="/admin/messages"
        className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
      >
        {/* Submitting the form keeps the chosen status and starts at page 1. */}
        {filters.status && (
          <input type="hidden" name="status" value={filters.status} />
        )}

        <div>
          <label htmlFor="q" className="block text-step--1 text-muted">
            بحث بالاسم أو الجوال أو البريد أو الموضوع
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="اسم المرسل أو موضوع الرسالة"
            className={`${FIELD} mt-1.5`}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex h-[46px] flex-1 items-center justify-center rounded-lg bg-ink px-5 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-none"
          >
            بحث
          </button>

          {hasFilters && (
            <Link
              href="/admin/messages"
              className="inline-flex h-[46px] items-center justify-center rounded-lg border border-line px-5 text-step--1 font-medium text-muted transition-colors duration-fast ease-out hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              مسح
            </Link>
          )}
        </div>
      </form>

      {/* Status chips. A horizontal scroller on a phone, so the row never
          widens the page. */}
      <nav
        aria-label="تصفية حسب الحالة"
        className="mt-5 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {[null, ...MESSAGE_STATUSES].map((status) => {
            const active = filters.status === status;
            const label = status ? MESSAGE_STATUS_LABELS[status] : "الكل";
            const count = status ? counts[status] : allCount;

            return (
              <li key={status ?? "all"}>
                <Link
                  href={buildHref(filters, { status, page: 1 })}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-step--1 font-medium whitespace-nowrap transition-colors duration-fast ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    active
                      ? "border-ink bg-ink text-ink-invert"
                      : "border-line bg-surface text-muted hover:border-ink/30 hover:text-ink",
                  ].join(" ")}
                >
                  {label}
                  <span className="tabular-nums opacity-70">{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="mt-5 text-step--1 text-muted">
        {total === 0
          ? "لا توجد نتائج"
          : `عدد النتائج: ${total} — صفحة ${filters.page} من ${pageCount}`}
      </p>

      {messages.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-12 text-center text-step-0 text-muted">
          لا توجد رسائل مطابقة.
        </p>
      ) : (
        <>
          {/* Mobile: one card per message. The table below never renders
              here, so nothing can overflow the viewport. */}
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:hidden">
            {messages.map((message) => (
              <li key={message.id}>
                <Link
                  href={`/admin/messages/${message.id}`}
                  className="block rounded-xl border border-line bg-surface p-4 transition-colors duration-fast ease-out hover:border-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <MessageStatusBadge status={message.status} />
                    <span className="ms-auto text-step--1 text-muted">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>

                  <p className="mt-3 truncate text-step-0 font-semibold">
                    {message.name}
                  </p>
                  <p className="mt-1 truncate text-step--1 text-muted tabular-nums">
                    {message.phone}
                  </p>
                  <p className="mt-2 line-clamp-2 text-step--1">
                    {message.subject}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: the same rows as a table. */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-line bg-surface lg:block">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">
                رسائل التواصل المطابقة للتصفية الحالية
              </caption>
              <thead>
                <tr className="border-b border-line text-step--1 text-muted">
                  <th
                    scope="col"
                    className="w-[20%] px-4 py-3 text-start font-medium"
                  >
                    المرسل
                  </th>
                  <th
                    scope="col"
                    className="w-[16%] px-4 py-3 text-start font-medium"
                  >
                    الجوال
                  </th>
                  <th
                    scope="col"
                    className="w-[32%] px-4 py-3 text-start font-medium"
                  >
                    الموضوع
                  </th>
                  <th
                    scope="col"
                    className="w-[16%] px-4 py-3 text-start font-medium"
                  >
                    الحالة
                  </th>
                  <th
                    scope="col"
                    className="w-[16%] px-4 py-3 text-start font-medium"
                  >
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className="transition-colors duration-fast ease-out hover:bg-bg"
                  >
                    <td className="truncate px-4 py-3">
                      <Link
                        href={`/admin/messages/${message.id}`}
                        className="text-step--1 font-semibold underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {message.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-step--1 tabular-nums">
                      {message.phone}
                    </td>
                    <td className="truncate px-4 py-3 text-step--1">
                      {message.subject}
                    </td>
                    <td className="px-4 py-3">
                      <MessageStatusBadge status={message.status} />
                    </td>
                    <td className="px-4 py-3 text-step--1 text-muted">
                      {formatDateTime(message.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pageCount > 1 && (
        <nav
          aria-label="تنقّل بين الصفحات"
          className="mt-6 flex items-center justify-between gap-3"
        >
          {filters.page > 1 ? (
            <Link
              href={buildHref(filters, { page: filters.page - 1 })}
              className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-step--1 font-medium transition-colors duration-fast ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              الصفحة السابقة
            </Link>
          ) : (
            <span />
          )}

          <span className="text-step--1 text-muted tabular-nums">
            {filters.page} / {pageCount}
          </span>

          {filters.page < pageCount ? (
            <Link
              href={buildHref(filters, { page: filters.page + 1 })}
              className="inline-flex items-center rounded-lg border border-line bg-surface px-4 py-2.5 text-step--1 font-medium transition-colors duration-fast ease-out hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              الصفحة التالية
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
