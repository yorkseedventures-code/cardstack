import sharp from "sharp";

const TARGET_BYTES = 250 * 1024;
const MAX_EDGE = 1800;

export function dataUrlToBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,([\s\S]+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return Buffer.from(match[1], "base64");
}

export async function optimizeCardImage(input: Buffer): Promise<Buffer> {
  const base = sharp(input, { failOn: "none" }).rotate().resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  let last: Buffer | null = null;
  for (const quality of [82, 76, 70, 64, 58, 52, 48]) {
    const output = await base.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
    last = output;
    if (output.length <= TARGET_BYTES) return output;
  }
  return last!;
}
