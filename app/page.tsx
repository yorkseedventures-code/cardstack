"use client";

import { useState, useEffect, useCallback } from "react";
import Scanner from "@/components/Scanner";
import ContactForm from "@/components/ContactForm";
import ContactCard from "@/components/ContactCard";
import Settings from "@/components/Settings";
import { getContacts, saveContact, exportCSV } from "@/lib/contacts";
import { Contact, ExtractedCard } from "@/lib/types";

type Tab = "scan" | "database" | "settings";
type ScanState = "idle" | "form";

export default function Home() {
  const [tab, setTab] = useState<Tab>("scan");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [extracted, setExtracted] = useState<ExtractedCard | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setContacts(getContacts());
    setWebhookUrl(localStorage.getItem("cardstack_webhook") || "");
  }, []);

  const handleExtracted = useCallback((data: ExtractedCard, imgUrl: string) => {
    setExtracted(data);
    setImageDataUrl(imgUrl);
    setScanState("form");
  }, []);

  const handleSaved = useCallback((contact: Contact) => {
    saveContact(contact);
    setContacts(getContacts());
    setScanState("idle");
    setExtracted(null);
    setImageDataUrl("");
    setTab("database");
  }, []);

  const handleReset = useCallback(() => {
    setScanState("idle");
    setExtracted(null);
    setImageDataUrl("");
  }, []);

  const handleWebhookSave = useCallback((url: string) => {
    setWebhookUrl(url);
    localStorage.setItem("cardstack_webhook", url);
  }, []);

  const handleDeleted = useCallback(() => {
    setContacts(getContacts());
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const followUpCount = contacts.filter((c) => c.follow_up && c.follow_up >= today).length;

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [c.first_name, c.last_name, c.company, c.email, c.event]
      .some((v) => v?.toLowerCase().includes(q));
  });

  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-safe pt-6 pb-4 border-b border-[#ece9e4] bg-[#f8f7f5]">
        <div>
          <h1 className="text-xl font-display italic text-[#111]">CardStack</h1>
          <p className="text-[11px] text-[#aaa] mt-0.5">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            {followUpCount > 0 ? ` · ${followUpCount} follow-up${followUpCount !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        {tab === "database" && contacts.length > 0 && (
          <button
            onClick={() => exportCSV(contacts)}
            className="text-xs text-[#888] border border-[#ddd] bg-white px-3 py-1.5 rounded-lg hover:border-[#bbb] transition-all"
          >
            Export CSV
          </button>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pb-28 pt-5 overflow-y-auto">
        {tab === "scan" && (
          <div>
            {scanState === "idle" ? (
              <Scanner onExtracted={handleExtracted} />
            ) : extracted ? (
              <ContactForm
                extracted={extracted}
                imageDataUrl={imageDataUrl}
                webhookUrl={webhookUrl}
                onSaved={handleSaved}
                onReset={handleReset}
              />
            ) : null}
          </div>
        )}

        {tab === "database" && (
          <div>
            {contacts.length > 0 && (
              <input
                className="field-input mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
              />
            )}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🪪</p>
                <p className="text-[#bbb] text-sm">
                  {contacts.length === 0
                    ? "No contacts yet — scan your first card"
                    : "No results found"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((c) => (
                  <ContactCard key={c.id} contact={c} onDeleted={handleDeleted} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "settings" && (
          <Settings webhookUrl={webhookUrl} onSave={handleWebhookSave} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#f8f7f5]/95 backdrop-blur border-t border-[#e8e6e2] flex pb-safe">
        {(["scan", "database", "settings"] as Tab[]).map((t) => {
          const icons: Record<Tab, string> = { scan: "🪪", database: "🗂", settings: "⚙️" };
          const labels: Record<Tab, string> = { scan: "Scan", database: "Database", settings: "Settings" };
          return (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === "scan") handleReset(); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] transition-colors ${
                tab === t ? "text-brand" : "text-[#bbb] hover:text-[#888]"
              }`}
            >
              <span className="text-lg leading-none">{icons[t]}</span>
              {labels[t]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
