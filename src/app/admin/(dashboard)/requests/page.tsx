import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { StatusBadge, UrgentTag } from "@/components/admin/status-badge";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { CITIES } from "@/lib/request-options";
import {
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  isRequestStatus,
  type RequestStatusValue,
} from "@/lib/request-status";
import {
  CATEGORY_LABELS_AR,
  SERVICE_CATEGORIES,
  type ServiceCategoryValue,
} from "@/lib/service-category";

/** Rows change under the admin's feet; never serve a cached list. */
export const dynamic = "force-dynamic";

/** Enough to scan in one screen on desktop without a wall of cards on a
    phone. Anything past it is a page away. */
const PAGE_SIZE = 25;

type SearchParams = Record<string, string | string[] | undefined>;

/** A repeated ?q= is a malformed URL, not an error worth a page for. */
const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

/** Filters as the page understands them, after everything unrecognised has
    been dropped — a hand-edited ?status=FOO simply falls back to "all". */
type Filters = {
  status: RequestStatusValue | null;
  q: string;
  city: string;
  category: ServiceCategoryValue | null;
  page: number;
};

function readFilters(params: SearchParams): Filters {
  const status = first(params.status);
  const category = first(params.category);
  const city = first(params.city);
  const page = Number.parseInt(first(params.page), 10);

  return {
    status: isRequestStatus(status) ? status : null,
    q: first(params.q),
    city: (CITIES as readonly string[]).includes(city) ? city : "",
    category: (SERVICE_CATEGORIES as readonly string[]).includes(category)
      ? (category as ServiceCategoryValue)
      : null,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

/** A link that keeps the filters already in the URL and changes one of
    them. Every navigation on this page goes through here, so no chip can
    quietly drop the search term. */
function buildHref(filters: Filters, overrides: Partial<Filters>) {
  const next = { ...filters, ...overrides };
  const search = new URLSearchParams();

  if (next.status) search.set("status", next.status);
  if (next.q) search.set("q", next.q);
  if (next.city) search.set("city", next.city);
  if (next.category) search.set("category", next.category);
  if (next.page > 1) search.set("page", String(next.page));

  const query = search.toString();
  return query ? `/admin/requests?${query}` : "/admin/requests";
}

const FIELD =
  "block w-full min-w-0 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-step-0 text-ink transition-colors duration-fast ease-out placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = readFilters(await searchParams);

  /* Everything except the status, so the chips can show how many rows each
     status holds *within* the current search. */
  const baseWhere: Prisma.ServiceRequestWhereInput = {
    ...(filters.city && { city: filters.city }),
    ...(filters.category && { category: filters.category }),
    ...(filters.q && {
      OR: [
        { requestNumber: { contains: filters.q, mode: "insensitive" } },
        { fullName: { contains: filters.q, mode: "insensitive" } },
        { phone: { contains: filters.q, mode: "insensitive" } },
      ],
    }),
  };

  const where: Prisma.ServiceRequestWhereInput = {
    ...baseWhere,
    ...(filters.status && { status: filters.status }),
  };

  const [requests, total, byStatus, allCount] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        requestNumber: true,
        fullName: true,
        phone: true,
        category: true,
        city: true,
        status: true,
        isUrgent: true,
        createdAt: true,
      },
    }),
    prisma.serviceRequest.count({ where }),
    prisma.serviceRequest.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.serviceRequest.count({ where: baseWhere }),
  ]);

  const counts = Object.fromEntries(
    REQUEST_STATUSES.map((status) => [status, 0]),
  ) as Record<RequestStatusValue, number>;
  for (const row of byStatus) counts[row.status] = row._count._all;

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(
    filters.status || filters.q || filters.city || filters.category,
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* One GET form: no JavaScript, and the resulting URL is shareable. */}
      <form
        action="/admin/requests"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        {/* Submitting the form keeps the chosen status and starts at page 1. */}
        {filters.status && (
          <input type="hidden" name="status" value={filters.status} />
        )}

        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="q" className="block text-step--1 text-muted">
            بحث برقم الطلب أو الاسم أو الجوال
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="ALF-1001 أو اسم العميل"
            className={`${FIELD} mt-1.5`}
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-step--1 text-muted">
            المدينة
          </label>
          <select
            id="city"
            name="city"
            defaultValue={filters.city}
            className={`${FIELD} mt-1.5`}
          >
            <option value="">كل المدن</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-step--1 text-muted">
            الخدمة
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className={`${FIELD} mt-1.5`}
          >
            <option value="">كل الخدمات</option>
            {SERVICE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS_AR[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="inline-flex h-[46px] flex-1 items-center justify-center rounded-lg bg-ink px-5 text-step--1 font-medium text-ink-invert transition-colors duration-fast ease-out hover:bg-accent hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:flex-none"
          >
            تصفية
          </button>

          {hasFilters && (
            <Link
              href="/admin/requests"
              className="inline-flex h-[46px] items-center justify-center rounded-lg border border-line px-5 text-step--1 font-medium text-muted transition-colors duration-fast ease-out hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              مسح
            </Link>
          )}
        </div>
      </form>

      {/* Status chips. A horizontal scroller on a phone, so the row never
          widens the page. */}
      <nav aria-label="تصفية حسب الحالة" className="mt-5 -mx-4 px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {[null, ...REQUEST_STATUSES].map((status) => {
            const active = filters.status === status;
            const label = status ? REQUEST_STATUS_LABELS[status] : "الكل";
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

      {requests.length === 0 ? (
        <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-12 text-center text-step-0 text-muted">
          لا توجد طلبات مطابقة.
        </p>
      ) : (
        <>
          {/* Mobile: one card per request. The table below never renders
              here, so nothing can overflow the viewport. */}
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:hidden">
            {requests.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/admin/requests/${request.id}`}
                  className="block rounded-xl border border-line bg-surface p-4 transition-colors duration-fast ease-out hover:border-ink/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={request.status} />
                    {request.isUrgent && <UrgentTag />}
                    <span className="ms-auto text-step--1 text-muted tabular-nums">
                      {request.requestNumber}
                    </span>
                  </div>

                  <p className="mt-3 truncate text-step-0 font-semibold">
                    {request.fullName}
                  </p>
                  <p className="mt-1 truncate text-step--1 text-muted tabular-nums">
                    {request.phone}
                  </p>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-step--1">
                    <div className="min-w-0">
                      <dt className="text-muted">الخدمة</dt>
                      <dd className="truncate">
                        {CATEGORY_LABELS_AR[request.category]}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-muted">المدينة</dt>
                      <dd className="truncate">{request.city}</dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-step--1 text-muted">
                    {formatDateTime(request.createdAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: the same rows as a table. */}
          <div className="mt-4 hidden overflow-hidden rounded-xl border border-line bg-surface lg:block">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">
                طلبات الخدمة المطابقة للتصفية الحالية
              </caption>
              <thead>
                <tr className="border-b border-line text-step--1 text-muted">
                  <th scope="col" className="w-[13%] px-4 py-3 text-start font-medium">
                    رقم الطلب
                  </th>
                  <th scope="col" className="w-[18%] px-4 py-3 text-start font-medium">
                    العميل
                  </th>
                  <th scope="col" className="w-[14%] px-4 py-3 text-start font-medium">
                    الجوال
                  </th>
                  <th scope="col" className="w-[16%] px-4 py-3 text-start font-medium">
                    الخدمة
                  </th>
                  <th scope="col" className="w-[11%] px-4 py-3 text-start font-medium">
                    المدينة
                  </th>
                  <th scope="col" className="w-[15%] px-4 py-3 text-start font-medium">
                    الحالة
                  </th>
                  <th scope="col" className="w-[13%] px-4 py-3 text-start font-medium">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition-colors duration-fast ease-out hover:bg-bg"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/requests/${request.id}`}
                        className="text-step--1 font-semibold tabular-nums underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {request.requestNumber}
                      </Link>
                    </td>
                    <td className="truncate px-4 py-3 text-step--1">
                      {request.fullName}
                    </td>
                    <td className="px-4 py-3 text-step--1 tabular-nums">
                      {request.phone}
                    </td>
                    <td className="truncate px-4 py-3 text-step--1">
                      {CATEGORY_LABELS_AR[request.category]}
                    </td>
                    <td className="truncate px-4 py-3 text-step--1">
                      {request.city}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={request.status} />
                        {request.isUrgent && <UrgentTag />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-step--1 text-muted">
                      {formatDateTime(request.createdAt)}
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
