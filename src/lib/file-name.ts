/** Turning a file the user picked into something safe to put in a URL.
    Shared: the dashboard names gallery blobs with this on the server, and
    the request form names its photo blobs with it in the browser. */

/** A web-safe stem: the client's filename with everything but ASCII
    letters, digits, dot, dash and underscore dropped. An Arabic filename
    reduces to nothing, hence the fallback. */
export function safeStem(fileName: string) {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const stem = base.replace(/\.[^.]+$/, "");
  const cleaned = stem
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return cleaned || "image";
}

/** The extension to write in a pathname for a given media type. Falls back
    to the type's own subtype, and to jpg when there isn't one. */
export function extensionFor(contentType: string) {
  const subtype = contentType.split("/")[1] ?? "jpg";
  return subtype === "jpeg" ? "jpg" : subtype;
}
