"use client";

import { useState } from "react";
import { Contact } from "@/lib/types";
import { getColor, CONTACT_COLORS } from "@/lib/colors";

const EDIT_FIELDS: { key: keyof Contact; label: string; type?: string }[] = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "phone2", label: "Phone 2", type: "tel" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "website", label: "Website" },
  { key: "event", label: "Where met" },
  { key: "follow_up", label: "Follow-up date", type: "date" },
];

const fieldInputStyle = { width: "100%", fontSize: 12, padding: "7px 9px", borderRadius: 8, border: "1px solid #e8e6e2", background: "#fff", color: "#1a1714", outline: "none", fontFamily: "inherit" } as const;

export default function ContactCard({ contact, onDeleted, onColorChange, onEdited }: { contact: Contact; onDeleted: (id: string) => void; onColorChange: (id: string, color: string) => void; onEdited: (id: string, updates: Partial<Contact>) => Promise<boolean> }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>(contact);
  const color = getColor(contact.color || "grey");
  const today = new Date().toISOString().split("T")[0];
  const dateUrgent = !!contact.follow_up && contact.follow_up <= today;
  const urgent = !!contact.urgent || dateUrgent;

  const startEditing = () => { setForm(contact); setEditing(true); };
  const cancelEditing = () => { setForm(contact); setEditing(false); };

  const saveEditing = async () => {
    setSaving(true);
    const changed: Partial<Contact> = {};
    for (const f of EDIT_FIELDS) {
      if ((form[f.key] ?? "") !== (contact[f.key] ?? "")) (changed as any)[f.key] = form[f.key] ?? "";
    }
    if ((form.notes ?? "") !== (contact.notes ?? "")) changed.notes = form.notes ?? "";
    if (!!form.urgent !== !!contact.urgent) changed.urgent = !!form.urgent;
    const ok = Object.keys(changed).length === 0 ? true : await onEdited(contact.id, changed);
    setSaving(false);
    if (ok) setEditing(false);
  };

  return (
    <div>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "0.5px solid #f5f2ee", cursor: "pointer" }}
      >
        <div style={{ width: 3, height: 34, borderRadius: 2, background: color.strip, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714" }}>{contact.first_name} {contact.last_name}</div>
          <div style={{ fontSize: 10, color: "#b8b0a6", marginTop: 1 }}>
            {[contact.company, contact.event, urgent ? "urgent" : ""].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#c8c0b8", flexShrink: 0 }}>
          {contact.added ? new Date(contact.added).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </div>
      </div>

      {expanded && (
        <div className="slide-up" style={{ background: "#fafaf8", borderRadius: 14, padding: "12px 14px", margin: "4px 0 8px 13px", border: "0.5px solid #f0ede8" }}>
          {!editing ? (
            <>
              {contact.card_image && (
                <img src={contact.card_image} alt="Scanned card" style={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 10, background: "#fff", marginBottom: 10, border: "0.5px solid #f0ede8" }} />
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
                {contact.email && <a href={`mailto:${contact.email}`} style={{ color: "#1a1714", textDecoration: "none" }}>✉ {contact.email}</a>}
                {contact.phone && <a href={`tel:${contact.phone}`} style={{ color: "#1a1714", textDecoration: "none" }}>✆ {contact.phone}</a>}
                {contact.phone2 && <a href={`tel:${contact.phone2}`} style={{ color: "#1a1714", textDecoration: "none" }}>✆ {contact.phone2} (2)</a>}
                {contact.linkedin && <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>in LinkedIn</a>}
                {contact.website && <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1714", textDecoration: "none" }}>↗ {contact.website}</a>}
              </div>
              {contact.follow_up && (
                <div style={{ fontSize: 11, color: dateUrgent ? "#ef4444" : "#b8b0a6", marginBottom: 6 }}>Follow-up: {contact.follow_up}</div>
              )}
              {contact.urgent && (
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginBottom: 6 }}>⚠ Marked urgent</div>
              )}
              {contact.notes && (
                <div style={{ fontSize: 11, color: "#888", background: "#f0ede8", borderRadius: 8, padding: "8px 10px", marginBottom: 10, lineHeight: 1.5 }}>{contact.notes}</div>
              )}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 8, color: "#b8b0a6", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Color</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {CONTACT_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={(e) => { e.stopPropagation(); onColorChange(contact.id, c.id); }}
                      aria-label={c.label}
                      style={{
                        width: 22, height: 22, borderRadius: "50%", background: c.strip,
                        border: (contact.color || "grey") === c.id ? "2.5px solid #1a1714" : "2.5px solid transparent",
                        cursor: "pointer", flexShrink: 0
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={(e) => { e.stopPropagation(); startEditing(); }} style={{ fontSize: 11, color: "#1a1714", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>✎ Edit</button>
                <button onClick={() => onDeleted(contact.id)} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
              </div>
            </>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                {EDIT_FIELDS.map(f => (
                  <div key={f.key} style={f.key === "follow_up" ? { gridColumn: "1 / -1" } : undefined}>
                    <div style={{ fontSize: 9, color: "#b8b0a6", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 3 }}>{f.label}</div>
                    {f.key === "follow_up" ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <input
                          type={f.type || "text"}
                          value={(form[f.key] as string) || ""}
                          onChange={(e) => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                          style={{ ...fieldInputStyle, flex: 1 }}
                        />
                        {form.follow_up && (
                          <button
                            type="button"
                            onClick={() => setForm(x => ({ ...x, follow_up: "" }))}
                            aria-label="Clear follow-up date"
                            style={{ fontSize: 11, color: "#888", background: "#fff", border: "1px solid #e8e6e2", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontWeight: 600 }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        type={f.type || "text"}
                        value={(form[f.key] as string) || ""}
                        onChange={(e) => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                        style={fieldInputStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "#b8b0a6", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 3 }}>Notes</div>
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => setForm(x => ({ ...x, notes: e.target.value }))}
                  rows={3}
                  style={{ ...fieldInputStyle, resize: "vertical" as const }}
                />
              </div>
              <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id={`urgent-${contact.id}`}
                  checked={!!form.urgent}
                  onChange={(e) => setForm(x => ({ ...x, urgent: e.target.checked }))}
                  style={{ width: 15, height: 15, accentColor: "#ef4444", cursor: "pointer" }}
                />
                <label htmlFor={`urgent-${contact.id}`} style={{ fontSize: 12, color: "#1a1714", fontWeight: 600, cursor: "pointer" }}>Mark as urgent</label>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={cancelEditing} disabled={saving} style={{ flex: 1, padding: "8px 0", borderRadius: 20, background: "#fff", border: "1px solid #e0dbd4", fontSize: 12, color: "#888", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={saveEditing} disabled={saving} style={{ flex: 1, padding: "8px 0", borderRadius: 20, background: "#1a1714", border: "none", fontSize: 12, color: "#fff", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
