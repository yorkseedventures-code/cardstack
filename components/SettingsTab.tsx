"use client";

import { useState, useEffect } from "react";
import { CONTACT_COLORS } from "@/lib/colors";
import { IN_APP_TIPS, FAQS } from "@/lib/faqs";

const DEFAULT_LABELS: Record<string, string> = {
  grey: "",
  purple: "",
  pink: "",
  blue: "",
  green: "",
  yellow: "",
  red: "",
};

interface SettingsTabProps {
  user: any;
  onSignOut: () => void;
  onShare: () => void;
  shareCopied: boolean;
}

export default function SettingsTab({ user, onSignOut, onShare, shareCopied }: SettingsTabProps) {
  const [labels, setLabels] = useState<Record<string, string>>(DEFAULT_LABELS);
  const [labelsSaved, setLabelsSaved] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openTip, setOpenTip] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kc_color_labels");
      if (saved) setLabels({ ...DEFAULT_LABELS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const saveLabels = () => {
    localStorage.setItem("kc_color_labels", JSON.stringify(labels));
    setLabelsSaved(true);
    setTimeout(() => setLabelsSaved(false), 2000);
  };

  const card = (children: React.ReactNode, mb = 12) => (
    <div style={{ background: "#f7f5f2", borderRadius: 16, padding: 16, marginBottom: mb }}>
      {children}
    </div>
  );

  const sectionTitle = (title: string, sub?: string) => (
    <div style={{ marginBottom: sub ? 6 : 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714" }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#b8b0a6", marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );

  return (
    <div className="slide-up">
      {/* Account */}
      {card(<>
        {sectionTitle("Account")}
        <div style={{ fontSize: 12, color: "#b8b0a6", marginBottom: 14 }}>{user?.email}</div>
        <button onClick={onSignOut} style={{ width: "100%", padding: "11px 0", borderRadius: 30, background: "#fff", border: "0.5px solid #e0dbd4", fontSize: 13, color: "#666", fontWeight: 600, cursor: "pointer" }}>
          Sign out
        </button>
      </>)}

      {/* Color labels */}
      {card(<>
        {sectionTitle("Color labels", "Name each color so you remember what it means. Examples: Investor, Client, Press, Follow up, Hot lead.")}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {CONTACT_COLORS.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: c.strip, flexShrink: 0 }} />
              <input
                value={labels[c.id] || ""}
                onChange={e => setLabels(l => ({ ...l, [c.id]: e.target.value }))}
                placeholder={c.id === "grey" ? "Default (no label)" : `Label for ${c.label.toLowerCase()}`}
                style={{ flex: 1, background: "#fff", border: "1px solid #e0dbd4", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#1a1714", outline: "none", fontFamily: "inherit" }}
              />
            </div>
          ))}
        </div>
        <button onClick={saveLabels} style={{ width: "100%", padding: "10px 0", borderRadius: 30, background: "#1a1714", border: "none", fontSize: 13, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          {labelsSaved ? "Saved!" : "Save labels"}
        </button>
      </>)}

      {/* How to use */}
      {card(<>
        {sectionTitle("How to use KoiCard")}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {IN_APP_TIPS.map((tip, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenTip(openTip === i ? null : i)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "8px 0", textAlign: "left" }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1a1714" }}>{tip.title}</span>
                <span style={{ fontSize: 12, color: "#bbb" }}>{openTip === i ? "▲" : "▼"}</span>
              </button>
              {openTip === i && (
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, padding: "4px 0 10px 28px" }}>
                  {tip.body}
                </div>
              )}
              {i < IN_APP_TIPS.length - 1 && <div style={{ height: "0.5px", background: "#e8e4dc" }} />}
            </div>
          ))}
        </div>
      </>)}

      {/* FAQ */}
      {card(<>
        {sectionTitle("Frequently asked questions")}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 10, background: "none", border: "none", cursor: "pointer", padding: "8px 0", textAlign: "left" }}
              >
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#1a1714", lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{ fontSize: 12, color: "#bbb", flexShrink: 0, marginTop: 2 }}>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && (
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, padding: "4px 0 10px 0" }}>
                  {faq.a}
                </div>
              )}
              {i < FAQS.length - 1 && <div style={{ height: "0.5px", background: "#e8e4dc" }} />}
            </div>
          ))}
        </div>
      </>)}

      {/* Share */}
      {card(<>
        {sectionTitle("Share KoiCard", "Know someone who networks? Send them the app.")}
        <button onClick={onShare} style={{ width: "100%", padding: "11px 0", borderRadius: 30, background: "#1a1714", border: "none", fontSize: 13, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <i className="ti ti-share-2" aria-hidden="true" />
          {shareCopied ? "Link copied!" : "Share KoiCard"}
        </button>
      </>)}

      {/* About */}
      {card(<>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", marginBottom: 4 }}>About</div>
        <div style={{ fontSize: 12, color: "#b8b0a6", lineHeight: 1.6 }}>AI-powered business card scanner built by Yorkseed Venture Studio. Contacts sync across all your devices.</div>
      </>, 0)}
    </div>
  );
}
