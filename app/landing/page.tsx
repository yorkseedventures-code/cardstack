"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    n: 1,
    title: "Scan or upload a card",
    body: "Point your camera at a business card, or upload a photo from your library.",
  },
  {
    n: 2,
    title: "AI reads the details",
    body: "Name, title, company, email, phone, LinkedIn, and website are extracted automatically.",
  },
  {
    n: 3,
    title: "Review and save",
    body: "Double-check the info, add notes or a follow-up date, then save it to your contact list.",
  },
  {
    n: 4,
    title: "Sync anywhere",
    body: "Export to CSV or auto-sync every new contact straight to a Google Sheet.",
  },
];

const FAQS = [
  {
    q: "Who is this for?",
    a: "Anyone who networks — conference attendees, sales teams, recruiters, freelancers, or anyone tired of losing business cards in a jacket pocket.",
  },
  {
    q: "Do I need to create an account?",
    a: "Yes, a free account lets us save your contacts securely and sync them across devices. Sign-up takes a few seconds.",
  },
  {
    q: "How accurate is the AI extraction?",
    a: "Very accurate for clearly printed cards. Every field is editable after extraction, so you can fix anything before saving.",
  },
  {
    q: "Can I use it without a camera, like on desktop?",
    a: "Yes — you can upload a photo of a card from your files on any device, no camera required.",
  },
  {
    q: "Where are my contacts stored?",
    a: "Securely in your personal, private database. Only you can see your saved contacts.",
  },
  {
    q: "Can I export my contacts?",
    a: "Yes, export your full contact list to CSV at any time, or set up auto-sync to a Google Sheet.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes — it's an installable web app that works great on iOS and Android, right from your browser.",
  },
  {
    q: "Is there a cost?",
    a: "The free plan includes 20 scans a month at no cost. The Event Pass gives you unlimited scans for 4 days for a one-time $4.99.",
  },
  {
    q: "Can I gift the Event Pass to a friend?",
    a: "Yes — from the pricing page you can send an Event Pass to a friend's email so they're covered for their next conference too.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-dvh bg-[#f8f7f5] flex flex-col font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-lg mx-auto w-full">
        <div className="text-xl font-black text-[#1a1714] tracking-tight">
          ScanBiz
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="text-sm text-[#888] font-semibold hover:text-[#1a1714] transition-colors"
        >
          Log in
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-6 pb-16 text-center max-w-lg mx-auto w-full">
        <span className="mt-2 mb-6 inline-block text-xs font-semibold text-brand bg-[#fde8e8] rounded-full px-4 py-1.5">
          Built for anyone
        </span>

        <h1 className="text-[40px] font-black text-[#1a1714] leading-[1.1] tracking-tight mb-6">
          Scan a card.<br />
          It&apos;s in your CRM<br />
          before you leave the booth.
        </h1>

        <p className="text-base text-[#888] leading-relaxed mb-8 max-w-sm">
          Point your camera at any business card. AI reads it instantly and saves the contact to your personal database.
        </p>

        <button
          onClick={() => router.push("/auth")}
          className="bg-brand text-white px-9 py-4 rounded-full text-[15px] font-bold hover:bg-brand/90 transition-all mb-3"
        >
          Get started free
        </button>
        <p className="text-xs text-[#b8b0a6] mb-12">No credit card required</p>

        {/* Feature tiles */}
        <div className="grid grid-cols-3 gap-3 w-full mb-4">
          {[
            { icon: "📷", label: "Scan with camera" },
            { icon: "🤖", label: "AI extracts info" },
            { icon: "☁️", label: "Syncs everywhere" },
          ].map((f) => (
            <div key={f.label} className="bg-white rounded-2xl px-3 py-5 text-center shadow-sm">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-[11px] text-[#888] font-semibold leading-tight">{f.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section className="px-6 pb-16 max-w-lg mx-auto w-full">
        <h2 className="text-3xl font-black text-[#1a1714] text-center mb-3">How it works</h2>
        <p className="text-[#888] text-center mb-8">From card to contact in four quick steps.</p>

        <div className="flex flex-col gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#fde8e8] text-brand font-bold flex items-center justify-center mb-4">
                {s.n}
              </div>
              <h3 className="text-lg font-bold text-[#1a1714] mb-1.5">{s.title}</h3>
              <p className="text-[#888] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 pb-16 max-w-lg mx-auto w-full">
        <div className="text-2xl mb-2 text-center">🎁</div>
        <h2 className="text-3xl font-black text-[#1a1714] text-center mb-3">Pricing</h2>
        <p className="text-[#888] text-center mb-8">Start free. Upgrade when you need more scans.</p>

        <div className="flex flex-col gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl p-7 shadow-sm">
            <div className="text-lg font-bold text-[#1a1714] mb-1">Free</div>
            <div className="text-4xl font-black text-[#1a1714] mb-1">$0</div>
            <div className="text-sm text-[#b8b0a6] mb-5">Try it out</div>
            <ul className="flex flex-col gap-2.5 mb-6">
              {["20 scans / month", "Editable AI extraction", "CSV export", "Personal contact list"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#444]">
                  <span className="text-brand">✓</span>{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/auth")}
              className="w-full py-3 rounded-xl bg-[#f7f5f2] text-[#1a1714] text-sm font-bold hover:bg-[#efece7] transition-all"
            >
              Get started free
            </button>
          </div>

          {/* Event Pass */}
          <div className="relative bg-white rounded-2xl p-7 shadow-sm border-2 border-brand">
            <span className="absolute -top-3 left-6 bg-brand text-white text-xs font-semibold rounded-full px-3 py-1">
              For conferences
            </span>
            <div className="text-lg font-bold text-[#1a1714] mb-1 mt-1">Event Pass</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-[#1a1714]">$4.99</span>
              <span className="text-sm text-[#b8b0a6]">one-time</span>
            </div>
            <div className="text-sm text-[#b8b0a6] mb-5">Unlimited scans for 4 days</div>
            <ul className="flex flex-col gap-2.5 mb-4">
              {["Unlimited scans for 4 days", "Perfect for a single conference", "Everything in Free", "No subscription"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#444]">
                  <span className="text-brand">✓</span>{f}
                </li>
              ))}
            </ul>
            <details className="mb-4 group">
              <summary className="cursor-pointer list-none flex items-center justify-between bg-[#f7f5f2] rounded-xl px-4 py-3 text-sm font-semibold text-[#1a1714]">
                🎁 Gift to a friend
                <span className="text-[#b8b0a6] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-[#888] px-1 pt-3 leading-relaxed">
                Send an Event Pass straight to a friend&apos;s inbox so they&apos;re set for their next conference too.
              </p>
            </details>
            <button
              onClick={() => router.push("/auth")}
              className="w-full py-3.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 transition-all"
            >
              Get Event Pass
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-16 max-w-lg mx-auto w-full">
        <h2 className="text-3xl font-black text-[#1a1714] text-center mb-3">FAQ</h2>
        <p className="text-[#888] text-center mb-8">Everything else you might want to know.</p>

        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={item.q} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between text-left px-6 py-5"
                >
                  <span className="font-semibold text-[#1a1714] text-[15px]">{item.q}</span>
                  <span className={"text-[#b8b0a6] text-xl leading-none transition-transform " + (open ? "rotate-45" : "")}>
                    +
                  </span>
                </button>
                {open && (
                  <p className="px-6 pb-5 -mt-1 text-sm text-[#888] leading-relaxed">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center px-6 pb-10">
        <div className="flex items-center justify-center gap-4 mb-3 text-xs text-[#b8b0a6]">
          <button onClick={() => router.push("/terms")} className="hover:text-[#1a1714] transition-colors">
            Terms
          </button>
          <span>·</span>
          <button onClick={() => router.push("/privacy")} className="hover:text-[#1a1714] transition-colors">
            Privacy
          </button>
        </div>
        <p className="text-xs text-[#c8c0b8]">Built with ❤️ by Yorkseed Venture Studio</p>
      </footer>
    </div>
  );
}
