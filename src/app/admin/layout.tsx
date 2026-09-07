import type { Metadata } from "next";

/** The dashboard is a separate app shell: no public header, footer or
    WhatsApp button, and nothing here should ever reach a search index.
    Real dashboard chrome (sidebar, top bar) arrives with the dashboard
    itself; this stays deliberately bare for now. */
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
