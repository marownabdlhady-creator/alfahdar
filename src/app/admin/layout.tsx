import type { Metadata } from "next";

/** The dashboard is a separate app shell: no public header, footer or
    WhatsApp button, and nothing here should ever reach a search index.
    Deliberately bare — the chrome (sidebar, top bar) belongs to the
    (dashboard) group, so /admin/login keeps a clean full-page form. */
export const metadata: Metadata = {
  title: "لوحة التحكم | الفهدار",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg text-ink">
      {children}
    </div>
  );
}
