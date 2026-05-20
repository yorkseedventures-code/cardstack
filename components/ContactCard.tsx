"use client";

import { Contact } from "@/lib/types";
import { initials, deleteContact } from "@/lib/contacts";
import { useState } from "react";

interface ContactCardProps {
  contact: Contact;
  onDeleted: () => void;
}

const COLORS = [
  "bg-[#fff1f1] text-[#A32D2D]",
  "bg-[#E6F1FB] text-[#185FA5]",
  "bg-[#EEEDFE] text-[#3C3489]",
  "bg-[#E6F8F1] text-[#1A6645]",
  "bg-[#FEF6E6] text-[#7A5318]",
];

function avatarColor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export default function ContactCard({ contact, onDeleted }: ContactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const ini = initials(contact);
  const colorClass = avatarColor(contact.first_name || "?");
  const today = new Date().toISOString().split("T")[0];
  const hasFollowup = contact.follow_up && contact.follow_up >= today;

  return (
    <div className="bg-white border border-[#ece9e4] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${colorClass}`}>
          {ini}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-[#111] truncate">{contact.first_name} {contact.last_name}</p>
          <p className="text-xs text-[#aaa] truncate">{[contact.title, contact.company].filter(Boolean).join(" · ") || "—"}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasFollowup && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fff1f1] text-brand border border-brand/20">follow-up</span>
          )}
          <span className="text-[#ccc] text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#f0eeeb] px-4 pb-4 pt-3 slide-up">
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[#666] hover:text-[#111] transition-colors truncate">
                <span className="text-[#ccc]">✉</span> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-[#666] hover:text-[#111] transition-colors">
                <span className="text-[#ccc]">✆</span> {contact.phone}
              </a>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors truncate">
                <span className="text-[#ccc]">in</span> LinkedIn
              </a>
            )}
            {contact.website && (
              <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#666] hover:text-[#111] transition-colors truncate">
                <span className="text-[#ccc]">↗</span> {contact.website}
              </a>
            )}
          </div>

          {contact.event && (
            <div className="flex items-center gap-2 text-xs text-[#888] mb-2">
              <span className="text-[#ccc]">📍</span> {contact.event}
            </div>
          )}
          {contact.follow_up && (
            <div className="flex items-center gap-2 text-xs mb-2" style={{ color: hasFollowup ? "#FF0A0A" : "#aaa" }}>
              <span className="text-[#ccc]">📅</span> Follow-up: {contact.follow_up}
            </div>
          )}
          {contact.notes && (
            <div className="bg-[#f8f7f5] rounded-xl p-3 text-xs text-[#666] mb-3 leading-relaxed border border-[#ece9e4]">
              {contact.notes}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#ccc]">Added {contact.added}</span>
            <button onClick={() => { deleteContact(contact.id); onDeleted(); }} className="text-[10px] text-red-400 hover:text-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
