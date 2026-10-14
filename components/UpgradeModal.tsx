"use client";

import { useState } from "react";
import { FREE_SCANS_PER_MONTH, PASS_PRICE, MONTHLY_PRICE, MINI_PRICE, MINI_SCANS, PRICING, PASS_SCAN_CAP, MONTHLY_SCAN_CAP, SUPPORT_EMAIL, type PlanId } from "@/lib/pricing";

// mode: "free" = out of free scans; "pass" = used up an Event Pass; "monthly" = used up the monthly allowance
export default function UpgradeModal({ onClose, mode = "free" }: { onClose: () => void; mode?: "free" | "pass" | "monthly" }) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  const startCheckout = async (plan: PlanId) => {
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

  const options: { id: PlanId; title: string; sub: string }[] = [];
  const monthly = { id: "monthly" as PlanId, title: `${MONTHLY_PRICE} / month`, sub: `Up to ${MONTHLY_SCAN_CAP} scans a month, cancel anytime` };
  const pass = { id: "pass" as PlanId, title: `${PASS_PRICE} / ${mode === "pass" ? "Another Event Pass" : "Event Pass"}`, sub: `Up to ${PASS_SCAN_CAP} scans for ${PRICING.pass.durationDays} days, one-time` };
  const mini = { id: "mini" as PlanId, title: `${MINI_PRICE} / Mini Pass`, sub: `${MINI_SCANS} more scans, valid ${PRICING.mini.validDays} days, one-time` };
  if (mode === "free") options.push(monthly, pass, mini);
  else if (mode === "pass") options.push(mini, pass, monthly);
  else options.push(mini);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,17,14,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", maxWidth: 360, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1714", marginBottom: 4 }}>
          {mode === "free" ? "You've hit your free scans" : "You've used all your scans"}
        </div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
          {mode === "free" && <>You get {FREE_SCANS_PER_MONTH} free scans a month. Pick an option to keep scanning.</>}
          {mode === "pass" && <>Your Event Pass includes {PASS_SCAN_CAP} scans. Add a Mini Pass, get another pass, or go Monthly.</>}
          {mode === "monthly" && <>Your plan includes {MONTHLY_SCAN_CAP} scans a month. Add a Mini Pass, or email <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "#1a1714", fontWeight: 600 }}>{SUPPORT_EMAIL}</a> if you need more.</>}
        </div>

        {options.map((o, i) => {
          const primary = i === 0;
          return (
            <button
              key={o.id}
              disabled={loadingPlan !== null}
              onClick={() => startCheckout(o.id)}
              style={{
                width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 14,
                border: primary ? "1.5px solid #1a1714" : "1.5px solid #e0dbd4",
                background: primary ? "#1a1714" : "#fff", color: primary ? "#fff" : "#1a1714",
                cursor: "pointer", marginBottom: 10, opacity: loadingPlan && loadingPlan !== o.id ? 0.5 : 1,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700 }}>{loadingPlan === o.id ? "Redirecting..." : o.title}</div>
              <div style={{ fontSize: 12, opacity: primary ? 0.75 : 1, color: primary ? undefined : "#888", marginTop: 2 }}>{o.sub}</div>
            </button>
          );
        })}

        {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</p>}

        <button
          onClick={onClose}
          style={{ width: "100%", marginTop: 6, padding: "8px 0", background: "none", border: "none", color: "#b8b0a6", fontSize: 12, cursor: "pointer" }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
