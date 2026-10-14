import jsQR from "jsqr";
import { ExtractedCard } from "./types";
import { extractFromQRText } from "./qr";

export const EMPTY_CARD: ExtractedCard = {
  first_name: "", last_name: "", title: "", company: "", email: "", phone: "", phone2: "",
  website: "", linkedin: "", instagram: "", x_handle: "", address: "",
};

/** A "full contact QR" (vCard / MECARD) carries a person's name, so it can fill the whole form with no AI. */
export function isContactQR(f: Partial<ExtractedCard>): boolean {
  return !!(f.first_name || f.last_name);
}

/** Like extractFromQRText, plus mailto: and tel: links (partial info: merged into the AI result instead of replacing it). */
export function parseQRText(text: string): Partial<ExtractedCard> {
  const t = text.trim();
  if (/^mailto:/i.test(t)) return { email: decodeURIComponent(t.slice(7).split("?")[0]) };
  if (/^tel:/i.test(t)) return { phone: decodeURIComponent(t.slice(4)) };
  // Social profile links go to the matching field instead of "website".
  const ig = t.match(/^https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)\/?(?:[?#].*)?$/i);
  if (ig && !["p", "reel", "explore", "stories"].includes(ig[1].toLowerCase())) return { instagram: "@" + ig[1] };
  const x = t.match(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]+)\/?(?:[?#].*)?$/i);
  if (x && !["home", "i", "share", "intent", "search"].includes(x[1].toLowerCase())) return { x_handle: "@" + x[1] };
  return extractFromQRText(t);
}

function decodeCanvas(canvas: HTMLCanvasElement, inverted = true): string | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height);
  return jsQR(data.data, width, height, { inversionAttempts: inverted ? "attemptBoth" : "dontInvert" })?.data || null;
}

/**
 * Styled QR codes (LinkedIn's own blue QR with round dots and a logo, branded QR codes) fail a plain decode because the
 * dots don't touch. Blurring the picture a little and then forcing it to pure black and white joins the dots back up.
 */
function decodeStyled(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const px = img.data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < gray.length; i++) gray[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  for (const frac of [0.008, 0.006]) {
    const r = Math.max(1, Math.round(Math.max(w, h) * frac));
    const blurred = boxBlur(boxBlur(gray, w, h, r, true), w, h, r, false);
    let lo = 255, hi = 0;
    for (let i = 0; i < blurred.length; i++) { if (blurred[i] < lo) lo = blurred[i]; if (blurred[i] > hi) hi = blurred[i]; }
    if (hi - lo < 40) continue;
    for (const k of [0.8, 0.7, 0.6]) {
      const thr = lo + k * (hi - lo);
      const out = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < blurred.length; i++) {
        const v = blurred[i] < thr ? 0 : 255;
        out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v; out[i * 4 + 3] = 255;
      }
      const text = jsQR(out, w, h, { inversionAttempts: "dontInvert" })?.data;
      if (text) return text;
    }
  }
  return null;
}

function boxBlur(src: Float32Array, w: number, h: number, r: number, horizontal: boolean): Float32Array {
  const out = new Float32Array(src.length);
  const len = horizontal ? w : h, lines = horizontal ? h : w;
  const at = (line: number, i: number) => (horizontal ? line * w + i : i * w + line);
  for (let l = 0; l < lines; l++) {
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += src[at(l, Math.min(len - 1, Math.max(0, i)))];
    for (let i = 0; i < len; i++) {
      out[at(l, i)] = sum / (2 * r + 1);
      sum += src[at(l, Math.min(len - 1, i + r + 1))] - src[at(l, Math.max(0, i - r))];
    }
  }
  return out;
}

/** The crop sweep may add at most this long to a photo that has no QR code (the AI read starts right after). */
const SWEEP_BUDGET_MS = 1500;

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

function loadImage(dataUrl: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

function drawScaled(img: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, targetMax: number): HTMLCanvasElement {
  const scale = targetMax / Math.max(sw, sh);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw * scale));
  canvas.height = Math.max(1, Math.round(sh * scale));
  canvas.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Look for a QR code in a photo. Tries the whole picture at a couple of sizes first (fast), then sweeps
 * overlapping crops so small QR codes on badges, lanyards or far-away screens still get found.
 * Prefers a full contact QR (has a name); otherwise returns the first useful link/email/phone it saw.
 */
export async function qrFieldsFromDataUrl(dataUrl: string): Promise<Partial<ExtractedCard>> {
  const img = await loadImage(dataUrl);
  if (!img) return {};
  const W = img.naturalWidth, H = img.naturalHeight;
  let fallback: Partial<ExtractedCard> = {};

  const attempt = (c: HTMLCanvasElement, inverted: boolean, styled = false): Partial<ExtractedCard> | null => {
    try {
      const text = decodeCanvas(c, inverted) || (styled ? decodeStyled(c) : null);
      if (!text) return null;
      const f = parseQRText(text);
      return Object.keys(f).length ? f : null;
    } catch { return null; }
  };
  const consider = (f: Partial<ExtractedCard> | null): Partial<ExtractedCard> | null => {
    if (!f) return null;
    if (isContactQR(f)) return f;
    if (!Object.keys(fallback).length) fallback = f;
    return null;
  };

  // Pass 1: the whole picture (handles QR codes that fill a good part of the frame, also light-on-dark ones).
  let hit = consider(attempt(drawScaled(img, 0, 0, W, H, Math.min(1400, Math.max(W, H))), true));
  if (hit) return hit;
  hit = consider(attempt(drawScaled(img, 0, 0, W, H, Math.min(900, Math.max(W, H))), true, true));
  if (hit) return hit;

  // Pass 2: overlapping crops, centre first (cards and badges are usually framed in the middle), upscaled so a
  // small QR gets enough pixels. Stops when the time budget is used up.
  const start = performance.now();
  const windows: { x: number; y: number; f: number; d: number }[] = [];
  for (const [f, offs] of [[0.6, [0, 0.4]], [0.4, [0, 0.3, 0.6]], [0.25, [0, 0.25, 0.5, 0.75]]] as [number, number[]][]) {
    const group: { x: number; y: number; f: number; d: number }[] = [];
    for (const oy of offs) for (const ox of offs) {
      const cx = ox + f / 2, cy = oy + f / 2;
      group.push({ x: ox, y: oy, f, d: Math.hypot(cx - 0.5, cy - 0.5) });
    }
    group.sort((a, b) => a.d - b.d);
    windows.push(...group);
  }
  for (const w of windows) {
    if (performance.now() - start > SWEEP_BUDGET_MS) break;
    await tick();
    hit = consider(attempt(drawScaled(img, W * w.x, H * w.y, W * w.f, H * w.f, 700), false));
    if (hit) return hit;
  }
  return fallback;
}

/** Decode a QR from a live video frame (used while the camera is open). Only full contact QR codes auto-capture. */
export function qrFieldsFromVideo(video: HTMLVideoElement, scratch: HTMLCanvasElement): Partial<ExtractedCard> {
  if (video.readyState < 2 || !video.videoWidth) return {};
  const scale = Math.min(1, 800 / video.videoWidth);
  scratch.width = Math.round(video.videoWidth * scale);
  scratch.height = Math.round(video.videoHeight * scale);
  scratch.getContext("2d", { willReadFrequently: true })?.drawImage(video, 0, 0, scratch.width, scratch.height);
  const text = decodeCanvas(scratch);
  return text ? parseQRText(text) : {};
}
