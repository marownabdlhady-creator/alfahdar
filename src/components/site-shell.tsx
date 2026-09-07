import type { ReactNode } from "react";

import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";

/** The public site's chrome. It lives here rather than in the root layout
    because /admin is a separate app shell with none of it, and the root
    layout is shared by both. Used by the (site) route group and by the
    global not-found page, which renders outside that group. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* No top padding: the fixed header overlays the top of the page so a
          dark hero can sit flush beneath it. Light-topped pages add their own. */}
      <main id="main" className="flex-1">
        {/* Only the page content animates on navigation — the header, the
            footer and the WhatsApp button stay put across routes. */}
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <WhatsappFab />
    </>
  );
}
