"use client";

import { useState } from "react";

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loadingPlan, setLoadingPlan] = useState<"pass" | "monthly" | null>(null);
  const [error, setError] = useState("");

  const startCheckout = async (plan: "pass" | "monthly") => {
    setError("");
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Couldn't start checkout, try again");
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't start checkout, try again");
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,17,14,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", maxWidth: 360, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1714", marginBottom: 4 }}>You've hit your free scans</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
          You get 20 free scans a month. Upgrade to keep scanning without limits.
        </div>

        <button
          disabled={loadingPlan !== null}
          onClick={() => startCheckout("monthly")}
          style={{
            width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #1a1714",
            background: "#1a1714", color: "#fff", cursor: "pointer", marginBottom: 10, opacity: loadingPlan && loadingPlan !== "monthly" ? 0.5 : 1,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>{loadingPlan === "monthly" ? "Redirecting..." : "$7.99 / month"}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Unlimited scans, cancel anytime</div>
        </button>

        <button
          disabled={loadingPlan !== null}
          onClick={() => startCheckout("pass")}
          style={{
            width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #e0dbd4",
            background: "#fff", color: "#1a1714", cursor: "pointer", opacity: loadingPlan && loadingPlan !== "pass" ? 0.5 : 1,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>{loadingPlan === "pass" ? "Redirecting..." : "$5.99 / Event Pass"}</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Unlimited scans for 4 days, one-time</div>
        </button>

        {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</p>}

        <button
          onClick={onClose}
          style={{ width: "100%", marginTop: 16, padding: "8px 0", background: "none", border: "none", color: "#b8b0a6", fontSize: 12, cursor: "pointer" }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
