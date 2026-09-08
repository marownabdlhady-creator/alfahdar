/** Upload limits, shared by the form and the API. Kept free of the Blob
    SDK so the client can import the numbers without pulling a server-only
    package — and its token — into the bundle. */

export const MAX_IMAGE_MB = 8;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

/** What a browser will hand us from accept="image/*" and we can serve. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const IMAGE_TYPE_ERROR =
  "صيغة الصورة غير مدعومة. الصيغ المسموحة: JPG، PNG، WEBP، GIF، AVIF.";
export const IMAGE_SIZE_ERROR = `حجم الصورة كبير. الحد الأقصى ${MAX_IMAGE_MB} ميجابايت.`;
export const IMAGE_EMPTY_ERROR = "الملف فارغ.";

/** A message when the file is unusable, or null when it passes. The form
    calls this to save a doomed upload; the route calls it again because a
    client can always be bypassed. */
export function imageFileError(file: File) {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return IMAGE_TYPE_ERROR;
  }
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_SIZE_ERROR;
  if (file.size === 0) return IMAGE_EMPTY_ERROR;

  return null;
}
