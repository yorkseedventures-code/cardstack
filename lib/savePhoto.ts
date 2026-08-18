export type SavePhotoResult = "shared" | "downloaded" | "cancelled" | "unsupported";

/**
 * Lets the user save a photo to their own device — nothing is uploaded to our servers.
 *
 * Web apps can't request OS-level "photo library" access the way a native app can. The
 * standard mechanism is the Web Share API: it opens the device's native share sheet, and
 * the user explicitly taps "Save Image" (that tap is effectively their permission grant,
 * on both iOS and Android). If the browser doesn't support sharing files, we fall back to
 * a normal file download.
 */
export async function savePhotoToDevice(dataUrl: string, filename = "business-card.jpg"): Promise<SavePhotoResult> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return "shared";
      } catch (err) {
        // AbortError just means the user closed the share sheet without picking anything —
        // not a real failure.
        if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
        throw err;
      }
    }

    // Fallback for browsers without Web Share support for files (e.g. most desktop browsers).
    // On mobile Safari without share support this opens/downloads the image so the user can
    // long-press → "Add to Photos" themselves.
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return "downloaded";
  } catch {
    return "unsupported";
  }
}
