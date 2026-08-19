export type SavePhotoResult = "shared" | "downloaded" | "cancelled" | "unsupported";

/**
 * Lets the user save a file to their own device — nothing is uploaded to our servers.
 *
 * Web apps can't request OS-level "save to Files/Photos" access the way a native app can.
 * The standard mechanism is the Web Share API: it opens the device's native share sheet, and
 * the user explicitly taps "Save" (that tap is effectively their permission grant, on both
 * iOS and Android). If the browser doesn't support sharing files, we fall back to a normal
 * file download.
 *
 * iOS Safari in particular does NOT honor the `download` attribute on a programmatically
 * clicked <a> tag — instead of saving, it opens its Quick Look file-preview screen, which is
 * a confusing extra step. Routing through the share sheet avoids that entirely.
 */
export async function saveFileToDevice(blob: Blob, filename: string): Promise<SavePhotoResult> {
  try {
    const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });

    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return "shared";
      } catch (err) {
        // AbortError just means the user closed the share sheet without picking anything.
        // not a real failure.
        if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
        throw err;
      }
    }

    // Fallback for browsers without Web Share support for files (e.g. most desktop browsers).
    // On mobile Safari without share support this opens/downloads the file so the user can
    // save it themselves.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 200);
    return "downloaded";
  } catch {
    return "unsupported";
  }
}

/**
 * Convenience wrapper for the common case: a data URL (e.g. a scanned card image)
 * that needs to be saved to the device's photo library.
 */
export async function savePhotoToDevice(dataUrl: string, filename = "business-card.jpg"): Promise<SavePhotoResult> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return saveFileToDevice(blob, filename);
  } catch {
    return "unsupported";
  }
}

