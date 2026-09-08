import type { ImageSize } from "@/lib/image-size";
import { WORK_ITEMS } from "@/lib/work";

/* Where a gallery image's pixel size comes from.

   next/image needs a width and a height to reserve the tile's box, but
   the WorkItem table has no columns for them. Rather than change the
   schema, each source carries its own size:

   - the seeded /public photos are in WORK_ITEMS, with the sizes the
     gallery has always used;
   - an upload is stored under a pathname that starts with its own
     dimensions — work/1600x1067-photo-x1y2.jpg — which the parser below
     reads straight back out of the URL;
   - anything else falls back to 4:3, which costs one layout shift on
     first load and nothing after.

   If the model ever gains width/height columns, this module is the only
   thing to delete. */

/** 4:3, the least surprising shape for a photo of a building site. */
export const FALLBACK_SIZE: ImageSize = { width: 1600, height: 1200 };

/** /public path → the size the static gallery declared for it. Derived,
    so a change in src/lib/work.ts needs no edit here. */
const STATIC_SIZES: Record<string, ImageSize> = Object.fromEntries(
  WORK_ITEMS.map((item) => [
    item.src,
    { width: item.width, height: item.height },
  ]),
);

/** "…/work/1600x1067-photo-x1y2.jpg" → 1600 × 1067. */
const ENCODED_SIZE = /\/(\d{2,5})x(\d{2,5})-/;

export function workImageSize(url: string): ImageSize {
  const known = STATIC_SIZES[url];
  if (known) return known;

  const encoded = ENCODED_SIZE.exec(url);
  if (encoded) {
    return { width: Number(encoded[1]), height: Number(encoded[2]) };
  }

  return FALLBACK_SIZE;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** A web-safe stem: the client's filename with everything but ASCII
    letters, digits, dot, dash and underscore dropped. An Arabic filename
    reduces to nothing, hence the fallback. */
function safeStem(fileName: string) {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const stem = base.replace(/\.[^.]+$/, "");
  const cleaned = stem
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return cleaned || "image";
}

/** The blob pathname for an upload. `put()` adds the random suffix that
    keeps two photos of the same name apart. */
export function workImagePathname(
  fileName: string,
  contentType: string,
  size: ImageSize | null,
) {
  const extension = EXTENSIONS[contentType] ?? "jpg";
  const prefix = size ? `${size.width}x${size.height}-` : "";

  return `work/${prefix}${safeStem(fileName)}.${extension}`;
}
