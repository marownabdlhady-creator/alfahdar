import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/admin/logout-button";
import { getCurrentAdmin } from "@/lib/auth";

/** Placeholder home for the dashboard. It exists to prove the session
    works end to end; the real dashboard replaces it next phase. */
export default async function AdminHomePage() {
  /* The proxy already turned anonymous requests away. Reading the admin
     here is the second check — it also catches a valid token whose row
     has since been deleted. */
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <main className="flex-1 px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-0.5 w-10 shrink-0 bg-accent sm:w-14" />
          <span className="text-step--1 tracking-[0.14em] text-muted">
            لوحة التحكم
          </span>
        </div>

        <h1 className="mt-5 text-step-3 font-bold tracking-tight">
          لوحة تحكم الفهدار
        </h1>

        <p className="mt-4 text-step-0 text-muted">
          مرحباً، تم تسجيل الدخول بنجاح.
        </p>

        <p className="mt-2 text-step--1 text-muted">
          {admin.name ?? admin.email}
        </p>

        <div className="mt-9">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
