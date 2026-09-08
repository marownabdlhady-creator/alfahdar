import { del, put } from "@vercel/blob";

import { imageSize } from "@/lib/image-size";
import { workImagePathname } from "@/lib/work-image";

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

/** True for a URL that lives in a Vercel Blob store — as opposed to a
    /public path, which is a file in the repository. */
export function isBlobUrl(url: string) {
  return /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(url);
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
