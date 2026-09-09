/** Recognising a Vercel Blob URL, without the Blob SDK.

    Kept apart from src/lib/blob.ts because both sides of the wire need
    this test: the shared request schema runs in the browser, and importing
    the SDK there would pull a server-only package — and its token — into
    the client bundle. */

/** The public store's URL shape. The subdomain is per-account, hence the
    wildcard. */
const BLOB_URL = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s]+$/i;

/** True for a URL that lives in a Vercel Blob store — as opposed to a
    /public path, which is a file in the repository. */
export function isBlobUrl(url: string) {
  return BLOB_URL.test(url);
}
