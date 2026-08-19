"use client";

import { useState } from "react";
import { Contact } from "@/lib/types";
import { getColor, CONTACT_COLORS } from "@/lib/colors";
import { savePhotoToDevice } from "@/lib/savePhoto";

const EDIT_FIELDS: { key: keyof Contact; label: string; type?: string }[] = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "phone2", label: "Phone 2", type: "tel" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
  { key: "x_handle", label: "X (Twitter)" },
  { key: "website", label: "Website" },
  { key: "address", label: "Address" },
  { key: "event", label: "Where met" },
  { key: "follow_up", label: "Follow-up date", type: "date" },
];

const fieldInputStyle = { width: "100%", fontSize: 12, padding: "7px 9px", borderRadius: 8, border: "1px solid #e8e6e2", background: "#fff", color: "#1a1714", outline: "none", fontFamily: "inherit" } as const;

export default function ContactCard({ contact, onDeleted, onColorChange, onEdited }: { contact: Contact; onDeleted: (id: string) => void; onColorChange: (id: string, color: string) => void; onEdited: (id: string, updates: Partial<Contact>) => Promise<boolean> }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
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
      {confirming && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 300, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🗑</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1714", marginBottom: 6 }}>Delete contact?</div>
            <div style={{ fontSize: 13, color: "#b8b0a6", marginBottom: 20, lineHeight: 1.5 }}>
              {contact.first_name} {contact.last_name} will be permanently removed. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 30, background: "#f7f5f2", border: "none", fontSize: 13, color: "#888", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setConfirming(false); onDeleted(contact.id); }} style={{ flex: 1, padding: "11px 0", borderRadius: 30, background: "#ef4444", border: "none", fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
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
                <div style={{ marginBottom: 10 }}>
                  <img src={contact.card_image} alt="Scanned card" style={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 10, background: "#fff", border: "0.5px solid #f0ede8" }} />
                  <button
                    disabled={savingPhoto}
                    onClick={async () => {
                      setSavingPhoto(true);
                      try {
                        await savePhotoToDevice(contact.card_image!, `${contact.first_name}_${contact.last_name}_card.jpg`);
                      } finally {
                        setSavingPhoto(false);
                      }
                    }}
                    style={{ marginTop: 6, width: "100%", padding: "7px 0", borderRadius: 20, background: "#f7f5f2", border: "none", fontSize: 11, color: "#888", fontWeight: 600, cursor: "pointer", opacity: savingPhoto ? 0.6 : 1 }}
                  >
                    {savingPhoto ? "Saving..." : "Save card image to photos"}
                  </button>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
                {contact.email && <a href={`mailto:${contact.email}`} style={{ color: "#1a1714", textDecoration: "none" }}>✉ {contact.email}</a>}
                {contact.phone && <a href={`tel:${contact.phone}`} style={{ color: "#1a1714", textDecoration: "none" }}>✆ {contact.phone}</a>}
                {contact.phone2 && <a href={`tel:${contact.phone2}`} style={{ color: "#1a1714", textDecoration: "none" }}>✆ {contact.phone2} (2)</a>}
                {contact.linkedin && <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>in LinkedIn</a>}
                {contact.instagram && <a href={`https://instagram.com/${contact.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#e1306c", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="#e1306c"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>{contact.instagram}</a>}
                {contact.x_handle && <a href={`https://x.com/${contact.x_handle.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1714", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="#1a1714"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>{contact.x_handle}</a>}
                {contact.website && <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1714", textDecoration: "none" }}>↗ {contact.website}</a>}
              </div>
              {contact.address && (
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>📍 {contact.address}</div>
              )}
              {contact.follow_up && (
                <div style={{ fontSize: 11, color: dateUrgent ? "#ef4444" : "#b8b0a6", marginBottom: 6 }}>Follow-up: {contact.follow_up}</div>
              )}
              {contact.urgent && (
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, marginBottom: 6 }}>Marked urgent</div>
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
                <button onClick={(e) => { e.stopPropagation(); setConfirming(true); }} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
              </div>
            </>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                {EDIT_FIELDS.map(f => (
                  <div key={f.key} style={(f.key === "follow_up" || f.key === "address") ? { gridColumn: "1 / -1" } : undefined}>
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
