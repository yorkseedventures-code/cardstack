"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Scan or upload a card",
    body: "Point your camera at a business card, or upload a photo from your library.",
  },
  {
    step: "2",
    title: "AI reads the details",
    body: "Name, title, company, email, phone, LinkedIn, and website are extracted automatically.",
  },
  {
    step: "3",
    title: "Review and save",
    body: "Double-check the info, add notes or a follow-up date, then save it to your contact list.",
  },
  {
    step: "4",
    title: "Sync anywhere",
    body: "Export to CSV or auto-sync every new contact straight to a Google Sheet.",
  },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    tagline: "Try it out",
    features: ["20 scans / month", "Editable AI extraction", "CSV export", "Personal contact list"],
    cta: "Get started free",
    highlight: false,
  },
  {
    id: "event",
    name: "Event Pass",
    price: "$4.99",
    period: "one-time",
    tagline: "Unlimited scans for 4 days",
    features: ["Unlimited scans for 4 days", "Perfect for a single conference", "Everything in Free", "No subscription"],
    cta: "Get Event Pass",
    highlight: true,
    badge: "For conferences",
    giftable: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6.99",
    period: "/ month",
    tagline: "For ongoing networking",
    features: ["Unlimited scans, every month", "Google Sheets auto-sync", "Priority extraction", "Cancel anytime"],
    cta: "Go Pro",
    highlight: false,
  },
];

const FAQ = [
  {
    q: "Who is this for?",
    a: "It's for anyone who collects business cards. Conference and event goers who pick up a stack of cards in a day, sales teams following up on leads, founders and investors meeting new people, freelancers, and anyone who's tired of typing contact info in by hand.",
  },
  {
    q: "Do I need to create an account?",
    a: "Yes, a quick free sign-up gets you started. No credit card required.",
  },
  {
    q: "How accurate is the AI extraction?",
    a: "It's very accurate for standard business cards, but you'll always get a chance to review and edit the details before saving, so nothing goes in wrong.",
  },
  {
    q: "Can I use it without a camera, like on desktop?",
    a: "Yes, you can upload a photo of a card instead of scanning live with your camera.",
  },
  {
    q: "Where are my contacts stored?",
    a: "Your contacts are saved to your personal database and are only visible to you.",
  },
  {
    q: "Can I export my contacts?",
    a: "Yes, you can export everything to CSV at any time, or connect Google Sheets in Settings for automatic syncing of every new contact.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes, it's a PWA, so you can add it to your home screen on iPhone or Android and it behaves like a native app with full camera access.",
  },
  {
    q: "Is there a cost?",
    a: "You can get started for free with 20 scans a month, no credit card required. Heading to a conference? The Event Pass gives you unlimited scans for 4 days for $4.99. Or go Pro for $6.99/month for unlimited scans all the time.",
  },
  {
    q: "Can I gift the Event Pass to a friend?",
    a: "Yes. On the Event Pass, choose \"Gift to a friend,\" enter their email, and they'll get unlimited scanning for 4 days on their own account.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [giftMode, setGiftMode] = useState(false);
  const [giftEmail, setGiftEmail] = useState("");

  return (
    <div className="min-h-dvh bg-[#f8f7f5] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <span className="text-lg font-bold text-[#111]">ScanBiz</span>
        <button
          onClick={() => router.push("/auth")}
          className="text-sm text-[#666] hover:text-[#111] transition-colors"
        >
          Log in
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-[#fff1f1] border border-brand/20 rounded-full px-3 py-1.5 text-xs text-brand font-medium mb-6">
          Built for anyone
        </div>

        <h1 className="text-4xl font-bold text-[#111] leading-tight mb-4">
          Scan a card.<br />It's in your CRM<br />before you leave the booth.
        </h1>

        <p className="text-[#888] text-base mb-8 max-w-sm leading-relaxed">
          Point your camera at any business card. AI reads it instantly and saves the contact to your personal database.
        </p>

        <button
          onClick={() => router.push("/auth")}
          className="bg-brand text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-brand/90 transition-all mb-3"
        >
          Get started free
        </button>
        <p className="text-xs text-[#bbb]">No credit card required</p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-14 w-full max-w-sm">
          {[
            { icon: "📷", label: "Scan with camera" },
            { icon: "🤖", label: "AI extracts info" },
            { icon: "☁️", label: "Syncs everywhere" },
          ].map((f) => (
            <div key={f.label} className="bg-white border border-[#ece9e4] rounded-xl p-3 text-center">
              <div className="text-xl mb-1.5">{f.icon}</div>
              <p className="text-[10px] text-[#888] leading-tight">{f.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section className="px-6 py-16 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#111] text-center mb-2">
          How it works
        </h2>
        <p className="text-[#888] text-sm text-center mb-10">
          From card to contact in four quick steps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map((s) => (
            <div
              key={s.step}
              className="bg-white border border-[#ece9e4] rounded-xl p-5"
            >
              <div className="w-7 h-7 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center mb-3">
                {s.step}
              </div>
              <h3 className="text-sm font-semibold text-[#111] mb-1">
                {s.title}
              </h3>
              <p className="text-xs text-[#888] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#111] text-center mb-2">
          Pricing
        </h2>
        <p className="text-[#888] text-sm text-center mb-10">
          Start free. Upgrade when you need more scans.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 flex flex-col h-full ${
                plan.highlight
                  ? "bg-white border-2 border-brand shadow-sm"
                  : "bg-white border border-[#ece9e4]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-5 bg-brand text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-sm font-semibold text-[#111] mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-[#111]">{plan.price}</span>
                {plan.period && (
                  <span className="text-xs text-[#888]">{plan.period}</span>
                )}
              </div>
              <p className="text-xs text-[#888] mb-4">{plan.tagline}</p>

              <ul className="flex flex-col gap-2 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#666]">
                    <span className="text-brand mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.giftable && (
                <div className="mb-4">
                  <button
                    onClick={() => setGiftMode((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-medium text-[#666] bg-[#f7f5f2] rounded-lg px-3 py-2 mb-2"
                  >
                    <span>🎁 Gift to a friend</span>
                    <span className="text-[#bbb]">{giftMode ? "−" : "+"}</span>
                  </button>
                  {giftMode && (
                    <input
                      type="email"
                      value={giftEmail}
                      onChange={(e) => setGiftEmail(e.target.value)}
                      placeholder="Friend's email"
                      className="w-full bg-[#f7f5f2] border-none rounded-lg px-3 py-2 text-xs text-[#111] outline-none placeholder:text-[#bbb]"
                    />
                  )}
                </div>
              )}

              <button
                onClick={() => router.push("/auth")}
                className={`w-full py-2.5 rounded-lg text-xs font-medium transition-all ${
                  plan.highlight
                    ? "bg-brand text-white hover:bg-brand/90"
                    : "bg-[#f7f5f2] text-[#111] hover:bg-[#ece9e4]"
                }`}
              >
                {plan.giftable && giftMode ? "Send gift" : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#111] text-center mb-2">
          FAQ
        </h2>
        <p className="text-[#888] text-sm text-center mb-10">
          Everything else you might want to know.
        </p>

        <div className="flex flex-col gap-2">
          {FAQ.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={item.q}
                className="bg-white border border-[#ece9e4] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[#111]">
                    {item.q}
                  </span>
                  <span
                    className={`text-[#bbb] text-lg leading-none transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-xs text-[#888] leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 text-center py-6 text-xs text-[#ccc]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/privacy")}
            className="hover:text-[#888] transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-[#ddd]">·</span>
          <button
            onClick={() => router.push("/terms")}
            className="hover:text-[#888] transition-colors"
          >
            Terms & Conditions
          </button>
        </div>
        <span>A Yorkseed product</span>
      </footer>
    </div>
  );
}
