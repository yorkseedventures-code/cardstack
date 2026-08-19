"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100dvh", background: "#fff", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1714", letterSpacing: -0.5 }}>
          koi<span style={{ color: "#FF7A3D" }}>card</span>
        </div>
        <button onClick={() => router.push("/auth")} style={{ fontSize: 13, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          Log in
        </button>
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 60px", textAlign: "center", maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff4ef", border: "1px solid #ffd4bc", borderRadius: 30, padding: "5px 14px", fontSize: 12, color: "#FF7A3D", fontWeight: 600, marginBottom: 24 }}>
          Built for founders and investors
        </div>

        <h1 style={{ fontSize: 40, fontWeight: 900, color: "#1a1714", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
          Scan a card.<br />
          <span style={{ color: "#FF7A3D" }}>Done.</span>
        </h1>

        <p style={{ fontSize: 15, color: "#b8b0a6", lineHeight: 1.6, marginBottom: 32, maxWidth: 300 }}>
          Point your camera at any business card. AI reads it and saves the contact instantly.
        </p>

        <button
          onClick={() => router.push("/auth")}
          style={{ background: "#1a1714", color: "#fff", padding: "14px 32px", borderRadius: 30, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 10 }}
        >
          Get started free
        </button>
        <p style={{ fontSize: 11, color: "#c8c0b8" }}>No credit card required</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 48, width: "100%" }}>
          {[
            { icon: "📷", label: "Camera scan" },
            { icon: "🤖", label: "AI extracts info" },
            { icon: "☁️", label: "Syncs everywhere" },
          ].map(f => (
            <div key={f.label} style={{ background: "#f7f5f2", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 10, color: "#888", fontWeight: 600, lineHeight: 1.3 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "16px 0 24px", fontSize: 11, color: "#c8c0b8" }}>
        A Yorkseed Ventures product
      </footer>
    </div>
  );
}
