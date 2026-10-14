"use client";

import { useEffect, useState } from "react";

const KEY = "kc_color_labels";
type Labels = Record<string, string>;

let cache: Labels | null = null;
let inflight: Promise<Labels> | null = null;
const listeners = new Set<(l: Labels) => void>();

function readLocal(): Labels {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

export function setCachedLabels(l: Labels) {
  cache = l;
  try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {}
  listeners.forEach(fn => fn(l));
}

// Server first (so labels follow the account across devices); local copy only if the server can't be reached.
export function loadColorLabels(force = false): Promise<Labels> {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight && !force) return inflight;
  inflight = fetch("/api/preferences")
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(d => {
      const server: Labels = d.color_labels || {};
      // If the account has none yet but this device has some, keep them and push them up once.
      if (Object.keys(server).length === 0) {
        const local = readLocal();
        if (Object.keys(local).length > 0) {
          fetch("/api/preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ color_labels: local }) }).catch(() => {});
          cache = local;
          return local;
        }
      }
      cache = server;
      try { localStorage.setItem(KEY, JSON.stringify(server)); } catch {}
      return server;
    })
    .catch(() => { cache = readLocal(); return cache; })
    .finally(() => { inflight = null; });
  return inflight;
}

export function useColorLabels(): Labels {
  const [labels, setLabels] = useState<Labels>(cache || {});
  useEffect(() => {
    let alive = true;
    loadColorLabels().then(l => { if (alive) setLabels(l); });
    listeners.add(setLabels);
    return () => { alive = false; listeners.delete(setLabels); };
  }, []);
  return labels;
}
