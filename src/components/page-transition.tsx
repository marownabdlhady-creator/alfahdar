"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Remounts on every route change so the incoming page replays one short
    fade-and-settle. Children arrive as a prop, so everything inside stays
    a server component — this wrapper only reads the pathname.

    Query-string changes (the ?service= preselect, say) leave the pathname
    alone and so pass without re-animating. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
