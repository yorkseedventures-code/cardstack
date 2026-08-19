"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Scanner from "@/components/Scanner";
import ContactForm from "@/components/ContactForm";
import ContactCard from "@/components/ContactCard";
import AddToHomeScreen from "@/components/AddToHomeScreen";
import { Contact, ExtractedCard } from "@/lib/types";
import { getColor } from "@/lib/colors";

type Tab = "scan" | "database" | "settings";
type SortOption = "date" | "color" | "urgency" | "az" | "company";

export default function Home() {
  const [tab, setTab] = useState<Tab>("scan");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extracted, setExtracted] = useState<ExtractedCard | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date");
  const [page, setPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [containerWidth, setContainerWidth] = useState(480);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const updateWidth = () => setContainerWidth(window.innerWidth >= 834 ? 680 : window.innerWidth >= 600 ? 560 : 480);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/landing");
      else { setUser(user); setLoading(false); loadContacts(); }
    });
  }, []);

  const loadContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        setContacts(await res.json());
        setErrorMsg("");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error || `Failed to load contacts (${res.status})`);
      }
    } catch (e) {
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
    }
  };

  const handleExtracted = useCallback((data: ExtractedCard, imgUrl: string) => {
    setExtracted(data); setImageDataUrl(imgUrl);
  }, []);

  const handleSaved = useCallback(async (contact: Omit<Contact, "id" | "user_id" | "created_at">) => {
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        setErrorMsg("");
        await loadContacts(); setExtracted(null); setImageDataUrl(""); setTab("database");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error || `Couldn't save contact (${res.status})`);
      }
    } catch (e) {
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
    }
  }, []);

  const handleColorChange = useCallback(async (id: string, color: string) => {
    const prev = contacts;
    setContacts(c => c.map(x => x.id === id ? { ...x, color } : x)); // optimistic
    try {
      const res = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, color }),
      });
      if (!res.ok) {
        setContacts(prev); // revert
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error || `Couldn't update color (${res.status})`);
      }
    } catch (e) {
      setContacts(prev); // revert
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
    }
  }, [contacts]);

  const handleEdited = useCallback(async (id: string, updates: Partial<Contact>): Promise<boolean> => {
    const prev = contacts;
    setContacts(c => c.map(x => x.id === id ? { ...x, ...updates } : x)); // optimistic
    try {
      const res = await fetch("/api/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setErrorMsg("");
        return true;
      }
      setContacts(prev); // revert
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error || `Couldn't save changes (${res.status})`);
      return false;
    } catch (e) {
      setContacts(prev); // revert
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
      return false;
    }
  }, [contacts]);

  const handleDeleted = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) {
        setContacts(c => c.filter(x => x.id !== id));
        setErrorMsg("");
      } else {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body.error || `Couldn't delete contact (${res.status})`);
      }
    } catch (e) {
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
    }
  }, []);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/landing"); };

  const handleShare = async () => {
    const shareData = {
      title: "KoiCard",
      text: "Scan business cards and build your network with KoiCard.",
      url: "https://koicard.app",
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {}
    }
  };

  const exportCSV = () => {
    const headers = ["First name","Last name","Title","Company","Email","Phone","Phone 2","Website","LinkedIn","Where met","Follow-up","Notes","Added","Color"];
    const rows = contacts.map(c => [c.first_name,c.last_name,c.title,c.company,c.email,c.phone,c.phone2,c.website,c.linkedin,c.event,c.follow_up,c.notes,c.added,c.color].map(v => `"${(v||"").replace(/"/g,'""')}"`));
    const csv = [headers,...rows].map(r => r.join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "koicard-contacts.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 200);
  };

  const today = new Date().toISOString().split("T")[0];
  const isUrgent = (c: Contact) => !!c.urgent || (!!c.follow_up && c.follow_up <= today);
  const urgentCount = contacts.filter(isUrgent).length;

  const sorted = useMemo(() => {
    let list = contacts.filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return [c.first_name,c.last_name,c.company,c.email,c.event].some(v => v?.toLowerCase().includes(q));
    });
    if (sort === "date") return [...list].sort((a, b) => b.added?.localeCompare(a.added || "") || 0);
    if (sort === "color") return [...list].sort((a, b) => (a.color || "grey").localeCompare(b.color || "grey"));
    if (sort === "urgency") return [...list].sort((a, b) => { const ua = isUrgent(a) ? 0 : 1; const ub = isUrgent(b) ? 0 : 1; return ua - ub; });
    if (sort === "az") return [...list].sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`));
    if (sort === "company") return [...list].sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    return list;
  }, [contacts, search, sort, today]);

  const PAGE_SIZE = 100;
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SORTS: { key: SortOption; label: string }[] = [
    { key: "date", label: "Date added" },
    { key: "color", label: "By color" },
    { key: "urgency", label: "Urgency" },
    { key: "az", label: "A-Z" },
    { key: "company", label: "Company" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #1a1714", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="app-sidebar">
        <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1714", letterSpacing: -0.8, marginBottom: 4 }}>
          koi<span style={{ color: "#FF7A3D" }}>card</span>
        </div>
        <div style={{ fontSize: 11, color: "#b8b0a6", marginBottom: 32 }}>
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          {urgentCount > 0 ? ` · ${urgentCount} urgent` : ""}
        </div>

        {(["scan", "database", "settings"] as Tab[]).map(t => {
          const icons: Record<Tab, string> = { scan: "ti-scan", database: "ti-address-book", settings: "ti-settings" };
          const labels: Record<Tab, string> = { scan: "Scan card", database: "Contacts", settings: "Settings" };
          return (
            <button key={t} onClick={() => { setTab(t); if (t === "scan") { setExtracted(null); setImageDataUrl(""); } }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                borderRadius: 12, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                marginBottom: 4, fontSize: 13, fontWeight: tab === t ? 700 : 500,
                background: tab === t ? "#1a1714" : "transparent",
                color: tab === t ? "#fff" : "#888",
              }}>
              <i className={`ti ${icons[t]}`} style={{ fontSize: 16 }} aria-hidden="true" />
              {labels[t]}
            </button>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: 32 }}>
          <div style={{ fontSize: 11, color: "#c8c0b8", lineHeight: 1.6 }}>
            Signed in as<br />
            <span style={{ color: "#888" }}>{user?.email}</span>
          </div>
          <button onClick={handleSignOut} style={{ marginTop: 10, fontSize: 11, color: "#b8b0a6", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="app-content">
      <header className="desktop-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 20px 16px", borderBottom: "0.5px solid #f0ede8" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1714", letterSpacing: -1, lineHeight: 1 }}>koi<span style={{ color: "#DC2626" }}>card</span></div>
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

      <main className="desktop-main" style={{ flex: 1, padding: "20px 20px 100px", overflowY: "auto" }}>
        {errorMsg && (
          <div style={{ background: "#fff4ef", border: "1px solid #DC2626", color: "#DC2626", fontSize: 12, fontWeight: 600, padding: "10px 14px", borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} style={{ background: "none", border: "none", color: "#DC2626", fontWeight: 900, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
        )}
        {tab === "scan" && (
          !extracted ? <Scanner onExtracted={handleExtracted} /> :
          <ContactForm extracted={extracted} imageDataUrl={imageDataUrl} onSaved={handleSaved} onReset={() => { setExtracted(null); setImageDataUrl(""); }} />
        )}

        {tab === "database" && (
          <div>
            {urgentCount > 0 && (
              <button
                onClick={() => setSort("urgency")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#fff4ef", border: "1px solid #f6c9b8", borderRadius: 12, padding: "10px 14px", marginBottom: 14, cursor: "pointer", textAlign: "left" }}
              >
                <span style={{ fontSize: 12, color: "#c2410c", fontWeight: 700 }}>
                  ⚠ {urgentCount} follow-up{urgentCount !== 1 ? "s" : ""} overdue
                </span>
                <span style={{ fontSize: 11, color: "#c2410c", fontWeight: 600 }}>View →</span>
              </button>
            )}
            <input
              style={{ width: "100%", background: "#f7f5f2", border: "none", borderRadius: 30, padding: "9px 16px", fontSize: 13, color: "#1a1714", outline: "none", marginBottom: 14, fontFamily: "inherit" }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search contacts"
            />
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {SORTS.map(s => (
                <button key={s.key} onClick={() => setSort(s.key)} style={{
                  fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
                  background: sort === s.key ? "#1a1714" : "#f7f5f2",
                  color: sort === s.key ? "#fff" : "#888",
                }} onClick={() => { setSort(s.key); setPage(1); }}>
                  {s.label}
                </button>
              ))}
            </div>

            {sorted.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#b8b0a6", fontSize: 14 }}>
                {contacts.length === 0 ? "No contacts yet, scan your first card" : "No results"}
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {paginated.map(c => <ContactCard key={c.id} contact={c} onDeleted={handleDeleted} onColorChange={handleColorChange} onEdited={handleEdited} />)}
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "0.5px solid #f0ede8" }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: "6px 14px", borderRadius: 20, border: "0.5px solid #e0dbd4", background: "#fff", fontSize: 12, color: page === 1 ? "#ccc" : "#1a1714", cursor: page === 1 ? "default" : "pointer", fontWeight: 500 }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: 12, color: "#b8b0a6" }}>
                    Page {page} of {totalPages} ({sorted.length} contacts)
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: "6px 14px", borderRadius: 20, border: "0.5px solid #e0dbd4", background: "#fff", fontSize: 12, color: page === totalPages ? "#ccc" : "#1a1714", cursor: page === totalPages ? "default" : "pointer", fontWeight: 500 }}
                  >
                    Next
                  </button>
                </div>
              )}
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
            <div style={{ background: "#f7f5f2", borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", marginBottom: 4 }}>Share</div>
              <div style={{ fontSize: 12, color: "#b8b0a6", marginBottom: 14, lineHeight: 1.6 }}>Know someone who'd like KoiCard? Send them the app.</div>
              <button onClick={handleShare} style={{ width: "100%", padding: "11px 0", borderRadius: 30, background: "#1a1714", border: "none", fontSize: 13, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <i className="ti ti-share-2" aria-hidden="true" />
                {shareCopied ? "Link copied!" : "Share KoiCard"}
              </button>
            </div>
            <div style={{ background: "#f7f5f2", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", marginBottom: 4 }}>About</div>
              <div style={{ fontSize: 12, color: "#b8b0a6", lineHeight: 1.6 }}>AI-powered business card scanner. Contacts sync across all your devices.</div>
            </div>
          </div>
        )}
      </main>

      <nav className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)", borderTop: "0.5px solid #f0ede8", display: "flex", paddingTop: 8, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        {(["scan","database","settings"] as Tab[]).map(t => {
          const icons: Record<Tab, string> = { scan: "ti-scan", database: "ti-address-book", settings: "ti-settings" };
          const labels: Record<Tab, string> = { scan: "Scan", database: "Contacts", settings: "Settings" };
          return (
            <button key={t} onClick={() => { setTab(t); if (t === "scan") { setExtracted(null); setImageDataUrl(""); } }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 10, background: "none", border: "none", cursor: "pointer", color: tab === t ? "#1a1714" : "#ccc" }}>
              <i className={`ti ${icons[t]}`} style={{ fontSize: 20 }} aria-hidden="true" />
              <span style={{ fontSize: 11, fontWeight: tab === t ? 700 : 400 }}>{labels[t]}</span>
            </button>
          );
        })}
      </nav>

      <AddToHomeScreen />
    </div>
    </div>
  );
}
