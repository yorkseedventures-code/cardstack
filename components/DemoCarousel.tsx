"use client";

import { useEffect, useRef, useState } from "react";

// One swipeable showcase: the demo video first, then screenshots. Auto-advances until the visitor touches it.
const SLIDES = [
  { type: "video" as const, src: "/screens/demo.mp4", poster: "/screens/demo-poster.jpg", title: "Scan to saved in 10 seconds", ms: 9000 },
  { type: "img" as const, src: "/screens/scan.jpg", title: "1. Scan", caption: "Take a photo or upload a card", ms: 4000 },
  { type: "img" as const, src: "/screens/review.jpg", title: "2. Review", caption: "AI fills in the details", ms: 4000 },
  { type: "img" as const, src: "/screens/contacts.jpg", title: "3. Organize", caption: "Search, color-code, set follow-ups", ms: 4000 },
  { type: "img" as const, src: "/screens/labels.jpg", title: "4. Label", caption: "Name your colors", ms: 4000 },
];

export default function DemoCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const touched = useRef(false);

  const slideEl = (i: number) => ref.current?.children[i] as HTMLElement | undefined;
  const goTo = (i: number, smooth = true) => {
    const el = ref.current; const s = slideEl(i);
    if (!el || !s) return;
    el.scrollTo({ left: s.offsetLeft - (el.clientWidth - s.clientWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  };

  // Track which slide is centered.
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0, bestD = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const h = c as HTMLElement; const d = Math.abs(h.offsetLeft + h.clientWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-advance (stops after any touch/click/wheel, and for reduced-motion users).
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current; if (!el) return;
    const stop = () => { touched.current = true; };
    el.addEventListener("pointerdown", stop, { once: true });
    el.addEventListener("wheel", stop, { once: true, passive: true });
    const t = setTimeout(() => {
      if (touched.current || document.hidden) return;
      goTo((index + 1) % SLIDES.length);
    }, SLIDES[index].ms);
    return () => { clearTimeout(t); el.removeEventListener("pointerdown", stop); el.removeEventListener("wheel", stop); };
  }, [index]);

  const nudge = (d: number) => { touched.current = true; goTo(Math.min(SLIDES.length - 1, Math.max(0, index + d))); };

  return (
    <div className="demo-carousel" role="region" aria-label="KoiCard demo and screenshots">
      <div className="demo-track" ref={ref}>
        {SLIDES.map((s, i) => (
          <figure key={s.src} className="demo-slide">
            <div className="demo-frame">
              {s.type === "video" ? (
                <video src={s.src} poster={s.poster} autoPlay muted loop playsInline preload="metadata" aria-label={s.title} />
              ) : (
                <img src={s.src} alt={`${s.title}: ${s.caption}`} loading={i < 2 ? "eager" : "lazy"} />
              )}
            </div>
            <figcaption>
              <strong>{s.title}</strong>
              {s.type === "img" && <span>{s.caption}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      <button className="demo-arrow demo-prev" onClick={() => nudge(-1)} aria-label="Previous" disabled={index === 0}>‹</button>
      <button className="demo-arrow demo-next" onClick={() => nudge(1)} aria-label="Next" disabled={index === SLIDES.length - 1}>›</button>
      <div className="demo-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={i === index ? "on" : ""} onClick={() => { touched.current = true; goTo(i); }} aria-label={`Show slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
