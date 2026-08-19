"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async () => {
    setLoading(true); setError(""); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) setError(error.message);
    else setMessage("Check your email for a password reset link!");
    setLoading(false);
  };

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

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#1a1714", letterSpacing: -0.8, marginBottom: 6 }}>
            koi<span style={{ color: "#DC2626" }}>card</span>
          </div>
          <p style={{ fontSize: 13, color: "#b8b0a6" }}>Scan cards. Build your network.</p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 30, background: "#fff",
            border: "1.5px solid #e0dbd4", fontSize: 14, color: "#1a1714", fontWeight: 600,
            cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10, opacity: googleLoading ? 0.6 : 1
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "#f0ede8" }} />
          <div style={{ fontSize: 11, color: "#c8c0b8", fontWeight: 600 }}>or</div>
          <div style={{ flex: 1, height: 1, background: "#f0ede8" }} />
        </div>

        {/* Email/Password toggle */}
        {mode !== "reset" && (
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
        )}

        {mode === "reset" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1714", marginBottom: 4 }}>Reset password</div>
            <div style={{ fontSize: 12, color: "#b8b0a6", marginBottom: 14 }}>Enter your email and we'll send you a reset link.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#b8b0a6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: ".06em", marginBottom: 5 }}>Email</div>
            <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#b8b0a6", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: ".06em", marginBottom: 5 }}>Password</div>
            <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 12, marginBottom: 10 }}>{error}</p>}
        {message && <p style={{ color: "#22c55e", fontSize: 12, marginBottom: 10 }}>{message}</p>}

        {mode === "reset" ? (
          <>
            <button onClick={handleReset} disabled={loading || !email} style={{
              width: "100%", padding: "13px 0", borderRadius: 30, background: "#1a1714", border: "none",
              fontSize: 14, color: "#fff", fontWeight: 700, cursor: "pointer",
              opacity: (loading || !email) ? 0.4 : 1, marginBottom: 12
            }}>
              {loading ? "..." : "Send reset link"}
            </button>
            <button onClick={() => setMode("login")} style={{ width: "100%", background: "none", border: "none", fontSize: 12, color: "#b8b0a6", cursor: "pointer" }}>
              Back to log in
            </button>
          </>
        ) : (
          <>
            <button onClick={handleSubmit} disabled={loading || !email || !password} style={{
              width: "100%", padding: "13px 0", borderRadius: 30, background: "#1a1714", border: "none",
              fontSize: 14, color: "#fff", fontWeight: 700, cursor: "pointer",
              opacity: (loading || !email || !password) ? 0.4 : 1
            }}>
              {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
            </button>
            {mode === "login" && (
              <button onClick={() => { setMode("reset"); setError(""); setMessage(""); }} style={{ width: "100%", background: "none", border: "none", fontSize: 12, color: "#b8b0a6", cursor: "pointer", marginTop: 12 }}>
                Forgot password?
              </button>
            )}
          </>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#c8c0b8", marginTop: 16 }}>
          By continuing you agree to our terms
        </p>
      </div>
    </div>
  );
}
