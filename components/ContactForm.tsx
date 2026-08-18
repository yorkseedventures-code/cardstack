"use client";

import { useState, useEffect } from "react";
import { Contact, ExtractedCard } from "@/lib/types";
import { CONTACT_COLORS } from "@/lib/colors";
import { savePhotoToDevice, SavePhotoResult } from "@/lib/savePhoto";

interface ContactFormProps {
  extracted: ExtractedCard;
  imageDataUrl: string;
  onSaved: (contact: Omit<Contact, "id" | "user_id" | "created_at">) => Promise<void>;
  onReset: () => void;
}

export default function ContactForm({ extracted, imageDataUrl, onSaved, onReset }: ContactFormProps) {
  const [form, setForm] = useState({ ...extracted, event: "", follow_up: "", notes: "", color: "grey" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoSave, setPhotoSave] = useState<"idle" | "saving" | SavePhotoResult>("idle");

  useEffect(() => { setForm({ ...extracted, event: "", follow_up: "", notes: "", color: "grey" }); setPhotoSave("idle"); setError(null); }, [extracted]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.first_name && !form.last_name) return;
    setSaving(true);
    setError(null);
    // Note: we intentionally don't persist the card photo itself. Storing base64 images
    // directly in the database rows would blow past Supabase's free-tier 500MB database
    // size limit after only a few hundred/thousand scans. The photo is only used to help
    // fill out this form; once saved, just the extracted text fields are kept.
    try {
      await onSaved({ ...form, added: new Date().toISOString().split("T")[0] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save contact. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhoto = async () => {
    setPhotoSave("saving");
    const namePart = `${form.first_name}-${form.last_name}`.trim().replace(/^-|-$/g, "").replace(/\s+/g, "-").toLowerCase();
    const filename = `${namePart || "business-card"}.jpg`;
    const result = await savePhotoToDevice(imageDataUrl, filename);
    setPhotoSave(result);
    if (result !== "unsupported") setTimeout(() => setPhotoSave("idle"), 2500);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 8, color: "#b8b0a6", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>{children}</div>
  );

  return (
    <div className="slide-up">
      {imageDataUrl && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <img src={imageDataUrl} alt="Card" style={{ width: "100%", maxHeight: 120, objectFit: "contain", borderRadius: 12, background: "#f7f5f2" }} />
          <button
            onClick={handleSavePhoto}
            disabled={photoSave === "saving"}
            style={{
              position: "absolute", top: 8, right: 8, padding: "6px 10px", borderRadius: 20,
              background: "rgba(26,23,20,0.75)", border: "none", color: "#fff", fontSize: 10, fontWeight: 600,
              cursor: photoSave === "saving" ? "default" : "pointer", backdropFilter: "blur(4px)",
            }}
          >
            {photoSave === "saving" && "Saving..."}
            {photoSave === "shared" && "Saved ✓"}
            {photoSave === "downloaded" && "Downloaded ✓"}
            {photoSave === "cancelled" && "Cancelled"}
            {photoSave === "unsupported" && "Save failed"}
            {photoSave === "idle" && "⬇ Save to Photos"}
          </button>
        </div>
      )}

      <div style={{ marginBottom: 6, fontSize: 10, color: "#b8b0a6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>AI filled this in, edit anything</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div><Label>First name</Label><input className="field-input" value={form.first_name} onChange={set("first_name")} placeholder="" /></div>
        <div><Label>Last name</Label><input className="field-input" value={form.last_name} onChange={set("last_name")} placeholder="" /></div>
        <div><Label>Title</Label><input className="field-input" value={form.title} onChange={set("title")} placeholder="" /></div>
        <div><Label>Company</Label><input className="field-input" value={form.company} onChange={set("company")} placeholder="" /></div>
        <div><Label>Email</Label><input className="field-input" type="email" value={form.email} onChange={set("email")} placeholder="" /></div>
        <div><Label>Phone</Label><input className="field-input" type="tel" value={form.phone} onChange={set("phone")} placeholder="" /></div>
        <div><Label>Phone 2</Label><input className="field-input" type="tel" value={form.phone2} onChange={set("phone2")} placeholder="" /></div>
        <div><Label>LinkedIn</Label><input className="field-input" value={form.linkedin} onChange={set("linkedin")} placeholder="" /></div>
        <div><Label>Website</Label><input className="field-input" value={form.website} onChange={set("website")} placeholder="" /></div>
        <div><Label>Where met</Label><input className="field-input" value={form.event} onChange={set("event")} placeholder="e.g. Slush 2026" /></div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <Label>Follow-up date</Label>
        <input className="field-input" type="date" value={form.follow_up} onChange={set("follow_up")} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label>Notes</Label>
        <textarea className="field-input" value={form.notes} onChange={set("notes")} placeholder="Context, next steps..." />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Label>Pick a color</Label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          {CONTACT_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setForm(f => ({ ...f, color: c.id }))}
              style={{
                width: 24, height: 24, borderRadius: "50%", background: c.strip,
                border: form.color === c.id ? "2.5px solid #1a1714" : "2.5px solid transparent",
                cursor: "pointer", flexShrink: 0
              }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "#fff1f1", color: "#c0392b", fontSize: 12, lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onReset} style={{ flex: 1, padding: "12px 0", borderRadius: 30, background: "#f7f5f2", border: "none", fontSize: 13, color: "#888", fontWeight: 600, cursor: "pointer" }}>Redo</button>
        <button onClick={handleSave} disabled={saving || (!form.first_name && !form.last_name)} style={{ flex: 2, padding: "12px 0", borderRadius: 30, background: "#1a1714", border: "none", fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: (saving || (!form.first_name && !form.last_name)) ? 0.4 : 1 }}>
          {saving ? "Saving..." : "Save contact"}
        </button>
      </div>
    </div>
  );
}
