"use client";

import { useRouter } from "next/navigation";
import { FAQS } from "@/lib/faqs";
import SignupCounter from "@/components/SignupCounter";

export default function LandingContent() {
  const router = useRouter();

  return (
    <div style={{ minHeight: "100dvh", background: "#fff", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", maxWidth: 480, margin: "0 auto", width: "100%" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#1a1714", letterSpacing: -0.5 }}>
          koi<span style={{ color: "#DC2626" }}>card</span>
        </div>
        <button onClick={() => router.push("/auth")} style={{ fontSize: 13, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          Log in
        </button>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 60px", textAlign: "center", maxWidth: 480, margin: "0 auto", width: "100%" }}>

        <h1 style={{ fontSize: 42, fontWeight: 900, color: "#1a1714", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 20 }}>
          Scan a card.<br />
          <span style={{ color: "#DC2626" }}>Done.</span>
        </h1>

        <p style={{ fontSize: 18, color: "#1a1714", fontWeight: 700, lineHeight: 1.5, marginBottom: 8, maxWidth: 340 }}>
          You'll spend $20 on drinks at the event.
        </p>
        <p style={{ fontSize: 18, color: "#DC2626", fontWeight: 700, lineHeight: 1.5, marginBottom: 24, maxWidth: 340 }}>
          Spend $7.99 remembering who you met.
        </p>

        <p style={{ fontSize: 13, color: "#b8b0a6", lineHeight: 1.7, marginBottom: 32, maxWidth: 320 }}>
          For anyone who networks: conferences, meetups,<br />trade shows, job fairs, coffee chats.
        </p>

        <SignupCounter />

        <button
          onClick={() => router.push("/auth")}
          style={{ background: "#1a1714", color: "#fff", padding: "15px 36px", borderRadius: 30, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 10 }}
        >
          Get started free
        </button>
        <p style={{ fontSize: 11, color: "#c8c0b8", marginBottom: 48 }}>No credit card required · 20 free scans/month</p>

        {/* Pricing pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "Free", sub: "20 scans/month" },
            { label: "Event Pass", sub: "$5.99 · 4 days" },
            { label: "Monthly", sub: "$7.99/month" },
          ].map(p => (
            <div key={p.label} style={{ background: "#f7f5f2", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1714" }}>{p.label}</div>
              <div style={{ fontSize: 10, color: "#b8b0a6", marginTop: 2 }}>{p.sub}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%", marginBottom: 56 }}>
          {[
            { icon: "📷", label: "Camera scan" },
            { icon: "🤖", label: "AI extracts info" },
            { icon: "📇", label: "CSV export" },
            { icon: "☁️", label: "Syncs everywhere" },
            { icon: "🎨", label: "Color coding" },
            { icon: "🎁", label: "Gift a pass" },
          ].map(f => (
            <div key={f.label} style={{ background: "#f7f5f2", borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 10, color: "#888", fontWeight: 600, lineHeight: 1.3 }}>{f.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1a1714", marginBottom: 16, textAlign: "center" }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map(f => (
              <details key={f.q} style={{ background: "#f7f5f2", borderRadius: 14, padding: "14px 16px" }}>
                <summary style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", cursor: "pointer", listStyle: "none" }}>{f.q}</summary>
                <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginTop: 8 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "16px 0 28px", fontSize: 11, color: "#c8c0b8" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10 }}>
          <button onClick={() => router.push("/terms")} style={{ fontSize: 11, color: "#b8b0a6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Terms
          </button>
          <span style={{ color: "#e0dcd6" }}>·</span>
          <button onClick={() => router.push("/privacy")} style={{ fontSize: 11, color: "#b8b0a6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Privacy
          </button>
        </div>
        Built with ❤️ by Yorkseed Venture Studio
      </footer>
    </div>
  );
}
