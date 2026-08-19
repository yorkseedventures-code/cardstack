import jsQR from "jsqr";
import { ExtractedCard } from "./types";

/** Decode a QR code from an already-drawn canvas. Returns the raw decoded text, or null if none found. */
export function decodeQRFromCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height);
  return result?.data || null;
}

/** Load an image data URL into an offscreen canvas and decode any QR code found in it. */
export function decodeQRFromDataUrl(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0);
      resolve(decodeQRFromCanvas(canvas));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

/** Very small vCard (VCF) parser covering the fields KoiCard cares about. */
export function parseVCard(text: string): Partial<ExtractedCard> {
  const out: Partial<ExtractedCard> = {};
  const lines = text.split(/\r\n|\n|\r/);
  const phones: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).toUpperCase();
    const value = line.slice(colonIdx + 1).trim();
    if (!value) continue;

    if (key.startsWith("FN")) {
      const parts = value.split(/\s+/);
      out.first_name = parts[0] || "";
      out.last_name = parts.slice(1).join(" ");
    } else if (key.startsWith("N") && !key.startsWith("NOTE")) {
      // N:Last;First;;;
      const [last, first] = value.split(";");
      if (first) out.first_name = first.trim();
      if (last) out.last_name = last.trim();
    } else if (key.startsWith("ORG")) {
      out.company = value.split(";")[0];
    } else if (key.startsWith("TITLE")) {
      out.title = value;
    } else if (key.startsWith("EMAIL")) {
      if (!out.email) out.email = value;
    } else if (key.startsWith("TEL")) {
      phones.push(value);
    } else if (key.startsWith("URL")) {
      if (value.includes("linkedin.com")) out.linkedin = value;
      else if (!out.website) out.website = value;
    }
  }

  if (phones[0]) out.phone = phones[0];
  if (phones[1]) out.phone2 = phones[1];

  return out;
}

/** Classify raw QR text and pull out whatever structured contact fields we can, with no AI involved. */
export function extractFromQRText(text: string): Partial<ExtractedCard> {
  const trimmed = text.trim();
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    return parseVCard(trimmed);
  }
  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes("linkedin.com")) return { linkedin: trimmed };
    return { website: trimmed };
  }
  // MECARD format (common on Japanese/some Android-generated business card QRs): MECARD:N:Doe,John;TEL:123;EMAIL:a@b.com;;
  if (/^MECARD:/i.test(trimmed)) {
    const out: Partial<ExtractedCard> = {};
    const body = trimmed.replace(/^MECARD:/i, "").replace(/;;$/, "");
    for (const field of body.split(";")) {
      const [key, ...rest] = field.split(":");
      const value = rest.join(":").trim();
      if (!value) continue;
      if (key === "N") {
        const [last, first] = value.split(",");
        if (first) out.first_name = first.trim();
        if (last) out.last_name = last.trim();
      } else if (key === "TEL") {
        if (!out.phone) out.phone = value; else if (!out.phone2) out.phone2 = value;
      } else if (key === "EMAIL") {
        out.email = value;
      } else if (key === "ORG") {
        out.company = value;
      } else if (key === "URL") {
        out.website = value;
      }
    }
    return out;
  }
  return {};
}
