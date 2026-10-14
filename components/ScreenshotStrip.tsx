// A swipeable row of app screenshots with captions. Images live in /public/screens (fake demo data only).
const SHOTS = [
  { src: "/screens/scan.jpg", title: "1. Scan", caption: "Take a photo or upload a card" },
  { src: "/screens/review.jpg", title: "2. Review", caption: "AI fills in the details, edit anything" },
  { src: "/screens/contacts.jpg", title: "3. Organize", caption: "Search, color-code and set follow-ups" },
  { src: "/screens/labels.jpg", title: "4. Label", caption: "Name your colors in Settings" },
];

export default function ScreenshotStrip({ width = 150 }: { width?: number }) {
  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "4px 2px 12px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
      {SHOTS.map(s => (
        <figure key={s.src} style={{ margin: 0, flex: "0 0 auto", width, scrollSnapAlign: "start" }}>
          <img src={s.src} alt={`${s.title}: ${s.caption}`} loading="lazy" style={{ width: "100%", height: "auto", borderRadius: 14, border: "1px solid #e8e4dc", display: "block" }} />
          <figcaption style={{ fontSize: 11, color: "#1a1714", fontWeight: 700, marginTop: 6 }}>{s.title}</figcaption>
          <div style={{ fontSize: 10, color: "#b8b0a6", lineHeight: 1.4 }}>{s.caption}</div>
        </figure>
      ))}
    </div>
  );
}
