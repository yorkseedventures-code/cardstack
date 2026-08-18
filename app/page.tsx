"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Scanner from "@/components/Scanner";
import ContactForm from "@/components/ContactForm";
import ContactCard from "@/components/ContactCard";
import { Contact, ExtractedCard } from "@/lib/types";
import { getColor } from "@/lib/colors";

type Tab = "scan" | "database" | "settings";
type SortOption = "date" | "color" | "urgency" | "az";

export default function Home() {
  const [tab, setTab] = useState<Tab>("scan");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extracted, setExtracted] = useState<ExtractedCard | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/landing");
      else { setUser(user); setLoading(false); loadContacts(); }
    });
  }, []);

  const loadContacts = async () => {
    const res = await fetch("/api/contacts");
    if (res.ok) setContacts(await res.json());
  };

  const handleExtracted = useCallback((data: ExtractedCard, imgUrl: string) => {
    setExtracted(data); setImageDataUrl(imgUrl);
  }, []);

  const handleSaved = useCallback(async (contact: Omit<Contact, "id" | "user_id" | "created_at">) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    if (res.ok) {
      await loadContacts(); setExtracted(null); setImageDataUrl(""); setTab("database");
    } else {
      const body = await res.json().catch(() => ({}));
      console.error("Failed to save contact:", res.status, body);
      throw new Error(body.error || `Save failed (${res.status})`);
    }
  }, []);

  const handleDeleted = useCallback(async (id: string) => {
    await fetch("/api/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setContacts(c => c.filter(x => x.id !== id));
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/landing"); };

  const exportCSV = () => {
    const headers = ["First name","Last name","Title","Company","Email","Phone","Phone 2","Website","LinkedIn","Where met","Follow-up","Notes","Added","Color"];
    const rows = contacts.map(c => [c.first_name,c.last_name,c.title,c.company,c.email,c.phone,c.phone2,c.website,c.linkedin,c.event,c.follow_up,c.notes,c.added,c.color].map(v => `"${(v||"").replace(/"/g,'""')}"`));
    const csv = [headers,...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "scanbiz-contacts.csv"; a.click();
  };

  const today = new Date().toISOString().split("T")[0];
  const urgentCount = contacts.filter(c => c.follow_up && c.follow_up <= today).length;

  const sorted = useMemo(() => {
    let list = contacts.filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return [c.first_name,c.last_name,c.company,c.email,c.event].some(v => v?.toLowerCase().includes(q));
    });
    if (sort === "date") return [...list].sort((a, b) => b.added?.localeCompare(a.added || "") || 0);
    if (sort === "color") return [...list].sort((a, b) => (a.color || "grey").localeCompare(b.color || "grey"));
    if (sort === "urgency") return [...list].sort((a, b) => { const ua = a.follow_up && a.follow_up <= today ? 0 : 1; const ub = b.follow_up && b.follow_up <= today ? 0 : 1; return ua - ub; });
    if (sort === "az") return [...list].sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
    return list;
  }, [contacts, search, sort, today]);

  const SORTS: { key: SortOption; label: string }[] = [
    { key: "date", label: "Date added" },
    { key: "color", label: "By color" },
    { key: "urgency", label: "Urgency" },
    { key: "az", label: "A–Z" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #1a1714", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px", borderBottom: "0.5px solid #f0ede8" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1714", letterSpacing: -1, lineHeight: 1 }}>ScanBiz</div>
          <div style={{ fontSize: 11, color: "#b8b0a6", marginTop: 2 }}>
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
            {urgentCount > 0 ? ` · ${urgentCount} urgent` : ""}
          </div>
        </div>
        {tab === "database" && contacts.length > 0 && (
          <button onClick={exportCSV} style={{ fontSize: 11, color: "#888", background: "#f7f5f2", border: "none", padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontWeight: 600 }}>
            Export CSV
          </button>
        )}
      </header>

      <main style={{ flex: 1, padding: "20px 20px 100px", overflowY: "auto" }}>
        {tab === "scan" && (
          !extracted ? <Scanner onExtracted={handleExtracted} /> :
          <ContactForm extracted={extracted} imageDataUrl={imageDataUrl} onSaved={handleSaved} onReset={() => { setExtracted(null); setImageDataUrl(""); }} />
        )}

        {tab === "database" && (
          <div>
            <input
              style={{ width: "100%", background: "#f7f5f2", border: "none", borderRadius: 30, padding: "9px 16px", fontSize: 13, color: "#1a1714", outline: "none", marginBottom: 14, fontFamily: "inherit" }}
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts"
            />
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {SORTS.map(s => (
                <button key={s.key} onClick={() => setSort(s.key)} style={{
                  fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
                  background: sort === s.key ? "#1a1714" : "#f7f5f2",
                  color: sort === s.key ? "#fff" : "#888",
                }}>
                  {s.label}
                </button>
              ))}
            </div>

            {sorted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#b8b0a6", fontSize: 14 }}>
                {contacts.length === 0 ? "No contacts yet. Scan your first card" : "No results"}
              </div>
            ) : (
              sorted.map(c => <ContactCard key={c.id} contact={c} onDeleted={handleDeleted} />)
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="slide-up">
            <div style={{ background: "#f7f5f2", borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", marginBottom: 4 }}>Account</div>
              <div style={{ fontSize: 12, color: "#b8b0a6", marginBottom: 14 }}>{user?.email}</div>
              <button onClick={handleSignOut} style={{ width: "100%", padding: "11px 0", borderRadius: 30, background: "#fff", border: "0.5px solid #e0dbd4", fontSize: 13, color: "#666", fontWeight: 600, cursor: "pointer" }}>
                Sign out
              </button>
            </div>
            <div style={{ background: "#f7f5f2", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", marginBottom: 4 }}>About</div>
              <div style={{ fontSize: 12, color: "#b8b0a6", lineHeight: 1.6 }}>AI-powered business card scanner. Contacts sync across all your devices.</div>
            </div>
          </div>
        )}
      </main>

      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)", borderTop: "0.5px solid #f0ede8", display: "flex", paddingBottom: 12 }}>
        {(["scan","database","settings"] as Tab[]).map(t => {
          const icons: Record<Tab, string> = { scan: "ti-scan", database: "ti-address-book", settings: "ti-settings" };
          const labels: Record<Tab, string> = { scan: "Scan", database: "Contacts", settings: "Settings" };
          return (
            <button key={t} onClick={() => { setTab(t); if (t === "scan") { setExtracted(null); setImageDataUrl(""); } }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 10, background: "none", border: "none", cursor: "pointer", color: tab === t ? "#1a1714" : "#ccc" }}>
              <i className={`ti ${icons[t]}`} style={{ fontSize: 20 }} aria-hidden="true" />
              <span style={{ fontSize: 9, fontWeight: tab === t ? 700 : 400 }}>{labels[t]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
