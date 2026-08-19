"use client";

import { useState, useEffect } from "react";

interface Stats {
  signups: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
    daily: { label: string; count: number }[];
  };
  total_contacts: number;
  total_scans: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_secret");
    if (saved) { setAuthed(true); fetchStats(saved); }
  }, []);

  const fetchStats = async (secret: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": secret }
      });
      if (!res.ok) { setError("Wrong password"); setAuthed(false); sessionStorage.removeItem("admin_secret"); return; }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Failed to load stats");
    } finally { setLoading(false); }
  };

  const handleLogin = () => {
    sessionStorage.setItem("admin_secret", password);
    setAuthed(true);
    fetchStats(password);
  };

  const maxDaily = stats?.signups.daily ? Math.max(...stats.signups.daily.map(d => d.count), 1) : 1;

  if (!authed) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5f2", fontFamily: "-apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 320, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1714", marginBottom: 4 }}>
          koi<span style={{ color: "#FF7A3D" }}>card</span> admin
        </div>
        <div style={{ fontSize: 12, color: "#b8b0a6", marginBottom: 20 }}>Private dashboard</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Password"
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e0dbd4", fontSize: 14, marginBottom: 12, outline: "none", fontFamily: "inherit" }}
        />
        {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{error}</p>}
        <button onClick={handleLogin} style={{ width: "100%", padding: "11px 0", borderRadius: 30, background: "#1a1714", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Enter
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#f7f5f2", padding: "24px 20px", fontFamily: "-apple-system, sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#1a1714" }}>koi<span style={{ color: "#FF7A3D" }}>card</span> admin</div>
            <div style={{ fontSize: 12, color: "#b8b0a6" }}>Your private dashboard</div>
          </div>
          <button onClick={() => { sessionStorage.removeItem("admin_secret"); setAuthed(false); }} style={{ fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
        </div>

        {loading && <div style={{ textAlign: "center", color: "#b8b0a6", padding: 40 }}>Loading...</div>}

        {stats && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Total signups", value: stats.signups.total },
                { label: "This month", value: stats.signups.this_month },
                { label: "This week", value: stats.signups.this_week },
                { label: "Today", value: stats.signups.today },
                { label: "Total contacts saved", value: stats.total_contacts },
                { label: "Total scans", value: stats.total_scans },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1714" }}>{s.value.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "#b8b0a6", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {stats.signups.daily && (
              <div style={{ background: "#fff", borderRadius: 14, padding: "16px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1714", marginBottom: 16 }}>Daily signups — last 14 days</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                  {stats.signups.daily.map(d => (
                    <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 8, color: "#b8b0a6" }}>{d.count > 0 ? d.count : ""}</div>
                      <div style={{
                        width: "100%", borderRadius: 4,
                        background: d.count > 0 ? "#FF7A3D" : "#f0ede8",
                        height: Math.max((d.count / maxDaily) * 60, d.count > 0 ? 4 : 2)
                      }} />
                      <div style={{ fontSize: 7, color: "#c8c0b8", whiteSpace: "nowrap", transform: "rotate(-45deg)", transformOrigin: "center", marginTop: 4 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
