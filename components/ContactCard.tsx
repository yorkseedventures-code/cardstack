"use client";

import { useState } from "react";
import { Contact } from "@/lib/types";
import { getColor } from "@/lib/colors";

export default function ContactCard({ contact, onDeleted }: { contact: Contact; onDeleted: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const color = getColor(contact.color || "grey");
  const today = new Date().toISOString().split("T")[0];
  const urgent = contact.follow_up && contact.follow_up <= today;

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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
            {contact.email && <a href={`mailto:${contact.email}`} style={{ color: "#1a1714", textDecoration: "none" }}>✉ {contact.email}</a>}
            {contact.phone && <a href={`tel:${contact.phone}`} style={{ color: "#1a1714", textDecoration: "none" }}>✆ {contact.phone}</a>}
            {contact.linkedin && <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>in LinkedIn</a>}
            {contact.website && <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" style={{ color: "#1a1714", textDecoration: "none" }}>↗ {contact.website}</a>}
          </div>
          {contact.follow_up && (
            <div style={{ fontSize: 11, color: urgent ? "#ef4444" : "#b8b0a6", marginBottom: 6 }}>Follow-up: {contact.follow_up}</div>
          )}
          {contact.notes && (
            <div style={{ fontSize: 11, color: "#888", background: "#f0ede8", borderRadius: 8, padding: "8px 10px", marginBottom: 10, lineHeight: 1.5 }}>{contact.notes}</div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => onDeleted(contact.id)} style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
