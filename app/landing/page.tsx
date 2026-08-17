"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

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
          Built for founders and investors
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

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-[#ccc]">
        A Yorkseed product
      </footer>
    </div>
  );
}
