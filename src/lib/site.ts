/** Canonical origin, used for metadataBase, canonical URLs and JSON-LD.
    PLACEHOLDER domain — set NEXT_PUBLIC_SITE_URL once the real one is
    live, or edit the fallback here. No trailing slash. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://alfahdar.com";

/** Absolute URL for a site-relative path (JSON-LD needs absolute URLs). */
export function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}
