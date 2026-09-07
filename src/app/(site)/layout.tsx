import { SiteShell } from "@/components/site-shell";

/** Everything the public visits renders inside the site chrome. The group
    adds no URL segment: (site)/about is still /about. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
