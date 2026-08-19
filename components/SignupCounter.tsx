"use client";

import { useEffect, useState } from "react";

export default function SignupCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  // Count-up animation
  useEffect(() => {
    if (count === null) return;
    const duration = 1200;
    const steps = 40;
    const increment = count / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= count) { setDisplayed(count); clearInterval(timer); }
      else setDisplayed(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [count]);

  if (!count) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "#fff4ef", border: "1px solid #ffd4bc",
      borderRadius: 30, padding: "8px 16px", marginBottom: 24,
      fontSize: 13, color: "#1a1714", fontWeight: 500
    }}>
      <span style={{ fontSize: 16, animation: "swim 2s ease-in-out infinite" }}>🐠</span>
      <span>
        <strong>{displayed.toLocaleString()}</strong> people already networking smarter
      </span>
      <style>{`
        @keyframes swim {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(3px) rotate(5deg); }
          75% { transform: translateX(-3px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
}
