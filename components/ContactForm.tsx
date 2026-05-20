"use client";

import { useState, useEffect } from "react";
import { Contact, ExtractedCard } from "@/lib/types";

interface ContactFormProps {
  extracted: ExtractedCard;
  imageDataUrl: string;
  webhookUrl: string;
  onSaved: (contact: Contact) => void;
  onReset: () => void;
}

export default function ContactForm({ extracted, imageDataUrl, webhookUrl, onSaved, onReset }: ContactFormProps) {
  const [form, setForm] = useState({
    first_name: extracted.first_name || "",
    last_name: extracted.last_name || "",
    title: extracted.title || "",
    company: extracted.company || "",
    email: extracted.email || "",
    phone: extracted.phone || "",
    website: extracted.website || "",
    linkedin: extracted.linkedin || "",
    event: "",
    follow_up: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "ok" | "error">("idle");

  useEffect(() => {
    setForm({
      first_name: extracted.first_name || "",
      last_name: extracted.last_name || "",
      title: extracted.title || "",
      company: extracted.company || "",
      email: extracted.email || "",
      phone: extracted.phone || "",
      website: extracted.website || "",
      linkedin: extracted.linkedin || "",
      event: "",
      follow_up: "",
      notes: "",
    });
  }, [extracted]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.first_name && !form.last_name) return;
    setSaving(true);
    const contact: Contact = {
      id: Date.now().toString(),
      ...form,
      added: new Date().toISOString().split("T")[0],
      card_image: imageDataUrl,
    };
    if (webhookUrl) {
      setSyncStatus("syncing");
      try {
        const res = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, webhookUrl }),
        });
        setSyncStatus(res.ok ? "ok" : "error");
      } catch { setSyncStatus("error"); }
    }
    setSaving(false);
    onSaved(contact);
  };

  return (
    <div className="slide-up">
      {imageDataUrl && (
        <img src={imageDataUrl} alt="Scanned card" className="w-full max-h-40 object-contain rounded-xl border border-[#e8e6e2] mb-4 bg-white" />
      )}

      <div className="bg-white rounded-2xl border border-[#ece9e4] p-4 mb-4">
        <p className="text-xs text-[#bbb] font-medium mb-3 uppercase tracking-wider">Extracted info — review & edit</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-[#aaa] mb-1.5">First name</label><input className="field-input" value={form.first_name} onChange={set("first_name")} placeholder="—" /></div>
          <div><label className="block text-xs text-[#aaa] mb-1.5">Last name</label><input className="field-input" value={form.last_name} onChange={set("last_name")} placeholder="—" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-[#aaa] mb-1.5">Title</label><input className="field-input" value={form.title} onChange={set("title")} placeholder="—" /></div>
          <div><label className="block text-xs text-[#aaa] mb-1.5">Company</label><input className="field-input" value={form.company} onChange={set("company")} placeholder="—" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-[#aaa] mb-1.5">Email</label><input className="field-input" type="email" value={form.email} onChange={set("email")} placeholder="—" /></div>
          <div><label className="block text-xs text-[#aaa] mb-1.5">Phone</label><input className="field-input" type="tel" value={form.phone} onChange={set("phone")} placeholder="—" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className="block text-xs text-[#aaa] mb-1.5">LinkedIn</label><input className="field-input" value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/..." /></div>
          <div><label className="block text-xs text-[#aaa] mb-1.5">Website</label><input className="field-input" value={form.website} onChange={set("website")} placeholder="—" /></div>
        </div>

        <div className="border-t border-[#f0eeeb] pt-3 mt-1">
          <p className="text-xs text-[#bbb] font-medium mb-3 uppercase tracking-wider">Your context</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="block text-xs text-[#aaa] mb-1.5">Where we met</label><input className="field-input" value={form.event} onChange={set("event")} placeholder="e.g. VivaTech Paris" /></div>
            <div><label className="block text-xs text-[#aaa] mb-1.5">Follow-up date</label><input className="field-input" type="date" value={form.follow_up} onChange={set("follow_up")} /></div>
          </div>
          <div><label className="block text-xs text-[#aaa] mb-1.5">Notes</label><textarea className="field-input" value={form.notes} onChange={set("notes")} placeholder="Context, next steps, talking points..." /></div>
        </div>
      </div>

      {syncStatus === "syncing" && <p className="text-xs text-blue-500 mb-3">Syncing to Google Sheets...</p>}
      {syncStatus === "ok" && <p className="text-xs text-green-600 mb-3">✓ Synced to Google Sheets</p>}
      {syncStatus === "error" && <p className="text-xs text-red-500 mb-3">Sheets sync failed — saved locally</p>}

      <div className="flex gap-3">
        <button onClick={onReset} className="flex-1 py-3 rounded-xl border border-[#ddd] text-[#999] text-sm font-medium hover:border-[#bbb] transition-all bg-white">
          Scan another
        </button>
        <button onClick={handleSave} disabled={saving || (!form.first_name && !form.last_name)} className="flex-[2] py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "Saving..." : "Save to database"}
        </button>
      </div>
    </div>
  );
}
