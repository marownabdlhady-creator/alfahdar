/** Intrinsic pixel size, read from an image file's own header.

    The gallery hands next/image a width and a height so the masonry
    reserves the right box before the file arrives. Uploads therefore need
    their dimensions at the moment they are stored — and a header parse is
    a few dozen bytes of arithmetic, which is a better trade than adding an
    image library to the bundle for one number.

    Covers the formats a browser will actually hand us from a file input:
    JPEG, PNG, WebP and GIF. Anything else (AVIF, HEIC, a truncated file)
    returns null and the caller falls back. */
export type ImageSize = { width: number; height: number };

function pngSize(bytes: Uint8Array, view: DataView): ImageSize | null {
  /* \x89PNG\r\n\x1a\n, then the IHDR chunk: width and height are the two
     big-endian 32-bit values at byte 16. */
  if (bytes.length < 24) return null;
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e) return null;

  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function jpegSize(bytes: Uint8Array, view: DataView): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  /* Walk the segment chain to the start-of-frame marker, which is the one
     that carries the dimensions. C4, C8 and CC share the range but are
     tables, not frames. */
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return {
        height: view.getUint16(offset + 5),
        width: view.getUint16(offset + 7),
      };
    }

    const length = view.getUint16(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }

  return null;
}

function gifSize(bytes: Uint8Array, view: DataView): ImageSize | null {
  /* "GIF87a"/"GIF89a", then the logical screen descriptor: two
     little-endian 16-bit values at byte 6. */
  if (bytes.length < 10) return null;
  if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) return null;

  return {
    width: view.getUint16(6, true),
    height: view.getUint16(8, true),
  };
}

function webpSize(bytes: Uint8Array, view: DataView): ImageSize | null {
  /* "RIFF" ....  "WEBP" then one of three chunk layouts. */
  if (bytes.length < 30) return null;
  const tag = (at: number) =>
    String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  if (tag(0) !== "RIFF" || tag(8) !== "WEBP") return null;

  const chunk = tag(12);

  if (chunk === "VP8X") {
    /* Extended: canvas size as two 24-bit little-endian values, minus one. */
    const width = (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) + 1;
    const height = (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) + 1;
    return { width, height };
  }

  if (chunk === "VP8 ") {
    /* Lossy: after the 3-byte start code, 14 bits each. */
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    /* Lossless: 14 bits each, minus one, packed across four bytes. */
    const packed =
      bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    return {
      width: (packed & 0x3fff) + 1,
      height: ((packed >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

/** null when the format isn't one we parse, or the header is malformed. */
export function imageSize(buffer: ArrayBuffer): ImageSize | null {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  const size =
    pngSize(bytes, view) ??
    jpegSize(bytes, view) ??
    webpSize(bytes, view) ??
    gifSize(bytes, view);

  if (!size) return null;
  /* A zero in either axis is a broken header, not a picture. */
  if (!Number.isFinite(size.width) || !Number.isFinite(size.height)) return null;
  if (size.width < 1 || size.height < 1) return null;

  return size;
}
