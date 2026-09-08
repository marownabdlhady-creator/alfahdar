import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdmin } from "@/lib/auth";

/** Every dashboard page renders inside the chrome; /admin/login sits
    outside the group and keeps the bare shell.

    The proxy already turned anonymous requests away. Reading the admin
    here is the second check — it also catches a valid token whose row has
    since been deleted — and it gives the top bar someone to name. */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell adminLabel={admin.name ?? admin.email}>{children}</AdminShell>
  );
}
