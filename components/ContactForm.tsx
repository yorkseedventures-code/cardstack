"use client";

import { useState, useEffect } from "react";
import { Contact, ExtractedCard } from "@/lib/types";
import { CONTACT_COLORS } from "@/lib/colors";

interface ContactFormProps {
  extracted: ExtractedCard;
  imageDataUrl: string;
  onSaved: (contact: Omit<Contact, "id" | "user_id" | "created_at">) => void;
  onReset: () => void;
}

export default function ContactForm({ extracted, imageDataUrl, onSaved, onReset }: ContactFormProps) {
  const [form, setForm] = useState({ ...extracted, event: "", follow_up: "", notes: "", color: "grey" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...extracted, event: "", follow_up: "", notes: "", color: "grey" }); }, [extracted]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.first_name && !form.last_name) return;
    setSaving(true);
    await onSaved({ ...form, added: new Date().toISOString().split("T")[0], card_image: imageDataUrl });
    setSaving(false);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 8, color: "#b8b0a6", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>{children}</div>
  );

  return (
    <div className="slide-up">
      {imageDataUrl && (
        <img src={imageDataUrl} alt="Card" style={{ width: "100%", maxHeight: 120, objectFit: "contain", borderRadius: 12, background: "#f7f5f2", marginBottom: 16 }} />
      )}

      <div style={{ marginBottom: 6, fontSize: 10, color: "#b8b0a6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>AI filled this in, edit anything</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div><Label>First name</Label><input className="field-input" value={form.first_name} onChange={set("first_name")} placeholder="-" /></div>
        <div><Label>Last name</Label><input className="field-input" value={form.last_name} onChange={set("last_name")} placeholder="-" /></div>
        <div><Label>Title</Label><input className="field-input" value={form.title} onChange={set("title")} placeholder="-" /></div>
        <div><Label>Company</Label><input className="field-input" value={form.company} onChange={set("company")} placeholder="-" /></div>
        <div><Label>Email</Label><input className="field-input" type="email" value={form.email} onChange={set("email")} placeholder="-" /></div>
        <div><Label>Phone</Label><input className="field-input" type="tel" value={form.phone} onChange={set("phone")} placeholder="-" /></div>
        <div><Label>Phone 2</Label><input className="field-input" type="tel" value={form.phone2} onChange={set("phone2")} placeholder="-" /></div>
        <div><Label>Website</Label><input className="field-input" value={form.website} onChange={set("website")} placeholder="-" /></div>
        <div><Label>LinkedIn</Label><input className="field-input" value={form.linkedin} onChange={set("linkedin")} placeholder="-" /></div>
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

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onReset} style={{ flex: 1, padding: "12px 0", borderRadius: 30, background: "#f7f5f2", border: "none", fontSize: 13, color: "#888", fontWeight: 600, cursor: "pointer" }}>Redo</button>
        <button onClick={handleSave} disabled={saving || (!form.first_name && !form.last_name)} style={{ flex: 2, padding: "12px 0", borderRadius: 30, background: "#1a1714", border: "none", fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: (saving || (!form.first_name && !form.last_name)) ? 0.4 : 1 }}>
          {saving ? "Saving..." : "Save contact"}
        </button>
      </div>
    </div>
  );
}
