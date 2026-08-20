import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "card-images";

function decode(dataUrl) {
  const m = dataUrl?.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/s);
  if (!m) throw new Error("Invalid data URL");
  return Buffer.from(m[1], "base64");
}
async function optimize(buf) {
  const base = sharp(buf, { failOn: "none" }).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true });
  let last;
  for (const q of [82,76,70,64,58,52,48]) { last = await base.clone().jpeg({ quality:q, mozjpeg:true }).toBuffer(); if (last.length <= 250*1024) return last; }
  return last;
}

let migrated=0, failed=0;
while (true) {
  const { data: rows, error } = await supabase.from("contacts").select("id,user_id,card_image,card_image_path").not("card_image","is",null).neq("card_image","").is("card_image_path",null).limit(25);
  if (error) throw error;
  if (!rows?.length) break;
  for (const row of rows) {
    const path = `${row.user_id}/${row.id}.jpg`;
    try {
      const image = await optimize(decode(row.card_image));
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, image, { contentType:"image/jpeg", cacheControl:"31536000", upsert:true });
      if (upErr) throw upErr;
      const { data: check, error: checkErr } = await supabase.storage.from(BUCKET).download(path);
      if (checkErr || !check || check.size === 0) throw checkErr || new Error("Upload verification failed");
      const { error: dbErr } = await supabase.from("contacts").update({ card_image_path:path, image_migrated_at:new Date().toISOString(), card_image:null }).eq("id",row.id).eq("user_id",row.user_id);
      if (dbErr) throw dbErr;
      migrated++; console.log(`✓ ${row.id} -> ${path} (${Math.round(image.length/1024)} KB)`);
    } catch (e) { failed++; console.error(`✗ ${row.id}:`, e?.message || e); }
  }
  if (failed && migrated === 0) throw new Error("Migration made no progress; stop and fix errors before retrying.");
}
console.log(`Done. Migrated ${migrated}; failed ${failed}. Re-run safely after fixing any failures.`);
