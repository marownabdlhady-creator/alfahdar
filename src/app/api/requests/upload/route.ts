import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/image-limits";

/** The Blob SDK needs Node APIs; it cannot run on the edge runtime. */
export const runtime = "nodejs";

const GENERIC_ERROR =
  "تعذّر رفع الصورة، برجاء المحاولة مرة أخرى أو إرسالها عبر واتساب.";

/** Where a request's photos live in the store. Anything else is refused. */
const PREFIX = "requests/";

/* Hands the browser a short-lived, single-upload token so the photo can go
   straight to the Blob store.

   Why not take the file here and put() it: a serverless function's request
   body is capped at 4.5 MB on Vercel, well under the 8 MB the form allows,
   and a photo straight off a phone routinely lands in between. The bytes
   never touch this function; only the token does.

   The store's own credentials stay in this process — the token that leaves
   is scoped to one upload, and the two limits below are attached to it
   server-side, so a client that lies about a file's type or size gets the
   upload rejected by the store rather than by its own good manners.

   Unlike the dashboard's upload this route is open: a visitor filling the
   form has no session to check. TODO: add rate limiting once the site is
   live — this is the only public endpoint that writes to storage. */
export async function POST(request: Request) {
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "صيغة الطلب غير صحيحة." },
      { status: 400 },
    );
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        /* The client names the file, so the folder is checked here: no
           writing into the gallery's own prefix. */
        if (!pathname.startsWith(PREFIX)) {
          throw new Error(`refusing a token for "${pathname}"`);
        }

        return {
          allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
        };
      },
      /* Nothing to do on completion: the form reads the URL from its own
         upload call and posts it with the request. */
    });

    return NextResponse.json(result);
  } catch (error) {
    /* Server-side only, and never the store's credentials. */
    console.error("[POST /api/requests/upload] could not issue a token", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 400 },
    );
  }
}
