/** The dashboard's own navigation. Separate from src/lib/nav.ts: nothing
    here is ever rendered on the public site. */
export type AdminNavLink = {
  label: string;
  href: string;
  /** Also matches nested routes, e.g. /admin/requests/[id]. */
  match: "exact" | "prefix";
};

export const ADMIN_NAV: AdminNavLink[] = [
  { label: "لوحة التحكم", href: "/admin", match: "exact" },
  { label: "طلبات الخدمة", href: "/admin/requests", match: "prefix" },
  { label: "رسائل التواصل", href: "/admin/messages", match: "prefix" },
];

export function isActiveAdminLink(link: AdminNavLink, pathname: string) {
  return link.match === "exact"
    ? pathname === link.href
    : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

/** The heading the top bar shows. Longest prefix wins, so a detail page
    gets its own title rather than the list's. */
const SECTION_TITLES: { href: string; title: string }[] = [
  { href: "/admin/requests", title: "طلبات الخدمة" },
  { href: "/admin/messages", title: "رسائل التواصل" },
  { href: "/admin", title: "نظرة عامة" },
];

export function adminSectionTitle(pathname: string) {
  if (/^\/admin\/requests\/[^/]+$/.test(pathname)) return "تفاصيل الطلب";
  if (/^\/admin\/messages\/[^/]+$/.test(pathname)) return "تفاصيل الرسالة";

  const section = SECTION_TITLES.find(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  );

  return section?.title ?? "لوحة التحكم";
}
