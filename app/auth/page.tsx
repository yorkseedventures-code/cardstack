"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#1a1714", letterSpacing: -0.8, marginBottom: 6 }}>
            koi<span style={{ color: "#FF7A3D" }}>card</span>
          </div>
          <p style={{ fontSize: 13, color: "#b8b0a6" }}>Scan cards. Build your network.</p>
        </div>

        <div style={{ background: "#f7f5f2", borderRadius: 30, display: "flex", marginBottom: 20, padding: 4 }}>
          {(["login", "signup"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "9px 0", borderRadius: 26, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: mode === m ? "#1a1714" : "transparent",
              color: mode === m ? "#fff" : "#888",
              transition: "all 0.2s"
            }}>
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#b8b0a6", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>Email</div>
            <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#b8b0a6", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>Password</div>
            <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{error}</p>}
        {message && <p style={{ color: "#22c55e", fontSize: 12, marginBottom: 10 }}>{message}</p>}

        <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
          width: "100%", padding: "13px 0", borderRadius: 30, background: "#1a1714", border: "none",
          fontSize: 14, color: "#fff", fontWeight: 700, cursor: "pointer",
          opacity: (loading || !email || !password) ? 0.4 : 1
        }}>
          {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#c8c0b8", marginTop: 16 }}>
          By continuing you agree to our terms
        </p>
      </div>
    </div>
  );
}
