"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "koicard_a2hs_dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function getPlatform(): "ios" | "android" | "other" {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export default function AddToHomeScreen() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const plat = getPlatform();
    setPlatform(plat);

    if (plat === "ios") {
      setVisible(true);
    } else if (plat === "android") {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setVisible(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    dismiss();
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 84,
        maxWidth: 456,
        margin: "0 auto",
        background: "#1a1714",
        color: "#fff",
        borderRadius: 16,
        padding: "14px 14px 14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        zIndex: 1000,
      }}
    >
      <img
        src="/icon-192.png"
        alt="KoiCard"
        style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
          Add KoiCard to your Home Screen
        </div>
        {platform === "ios" ? (
          <div style={{ fontSize: 11.5, color: "#c9c2b9", lineHeight: 1.4 }}>
            Tap <strong>Share</strong> <span aria-hidden>⬆️</span> then{" "}
            <strong>Add to Home Screen</strong>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: "#c9c2b9", lineHeight: 1.4 }}>
            Get one-tap access, right from your phone
          </div>
        )}
      </div>
      {platform === "android" && deferredPrompt ? (
        <button
          onClick={handleInstall}
          style={{
            background: "#DC2626",
            color: "#fff",
            border: "none",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Install
        </button>
      ) : null}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          color: "#c9c2b9",
          fontSize: 18,
          lineHeight: 1,
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
