import { del, put } from "@vercel/blob";

import { isBlobUrl } from "@/lib/blob-url";
import { imageSize } from "@/lib/image-size";
import { workImagePathname } from "@/lib/work-image";

/* Re-exported so server callers keep one import for everything Blob. */
export { isBlobUrl };

/* Server-only: importing this module pulls in the Blob SDK, which reads
   BLOB_READ_WRITE_TOKEN from the environment. The token never reaches the
   client or a log line. The form shares only the limits, which live in
   src/lib/image-limits.ts for exactly that reason. */

/** Uploads to the public store and returns the URL to save on the row.
    The pixel size is parsed from the file's own header and written into
    the pathname — see src/lib/work-image.ts for why. */
export async function uploadWorkImage(file: File) {
  const buffer = await file.arrayBuffer();
  const size = imageSize(buffer);

  const blob = await put(
    workImagePathname(file.name, file.type, size),
    buffer,
    {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    },
  );

  return blob.url;
}

/** Best effort: a blob that outlives its row is litter, but it must never
    be the reason a delete or a replace fails. */
export async function deleteWorkImage(url: string) {
  if (!isBlobUrl(url)) return;

  try {
    await del(url);
  } catch (error) {
    console.error("[blob] could not delete an orphaned image", error);
  }
}
