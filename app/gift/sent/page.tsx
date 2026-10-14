"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING } from "@/lib/pricing";

function GiftSent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [code, setCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) { setFailed(true); return; }
    let tries = 0;
    let stop = false;
    const poll = async () => {
      if (stop) return;
      tries++;
      try {
        const res = await fetch(`/api/gifts/session?session_id=${encodeURIComponent(sessionId)}`);
        if (res.ok) { const d = await res.json(); setCode(d.code); return; }
        if (res.status === 401) { router.push(`/auth?redirect=${encodeURIComponent(`/gift/sent?session_id=${sessionId}`)}`); return; }
      } catch {}
      if (tries >= 20) { setFailed(true); return; }
      setTimeout(poll, 1500);
    };
    poll();
    return () => { stop = true; };
  }, [sessionId, router]);

  const link = code && typeof window !== "undefined" ? `${window.location.origin}/gift/${code}` : "";
  const message = `I got you a KoiCard Event Pass (${PRICING.pass.durationDays} days, up to ${PRICING.pass.scanCap} business card scans). Claim it here: ${link}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ text: message }); return; } catch {} }
    copy();
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-[#f8f7f5] text-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#ece9e4] p-8">
        {!code && !failed && <p className="text-sm text-[#888]">Preparing your gift...</p>}

        {failed && (
          <>
            <h1 className="text-xl font-bold text-[#111] mb-2">Still working on it</h1>
            <p className="text-sm text-[#888] mb-5">Your payment went through, but the gift link isn't ready yet. Refresh this page in a minute. If it still doesn't show, email koicard@yorkseed.co and we'll send it to you.</p>
          </>
        )}

        {code && (
          <>
            <div className="text-3xl mb-3">🎁</div>
            <h1 className="text-xl font-bold text-[#111] mb-2">Your gift is ready</h1>
            <p className="text-sm text-[#888] mb-5">Send this link to anyone. They sign up or log in, open it, and the Event Pass ({PRICING.pass.durationDays} days, up to {PRICING.pass.scanCap} scans) is added to their account. It works once, so only send it to the person you're gifting.</p>
            <div className="text-xs text-[#444] bg-[#f7f5f2] rounded-xl p-3 mb-4 break-all select-all">{link}</div>
            <button onClick={share} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium mb-2">Share gift link</button>
            <button onClick={copy} className="w-full py-3 rounded-xl border border-[#e0dbd4] text-sm font-medium text-[#444] mb-2">{copied ? "Copied!" : "Copy link"}</button>
            <button onClick={() => router.push("/")} className="w-full py-2 text-xs text-[#b8b0a6]">Back to KoiCard</button>
            <p className="text-[11px] text-[#b8b0a6] mt-3">Copy the link now. If you lose it, email koicard@yorkseed.co and we'll find it for you.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function GiftSentPage() {
  return <Suspense fallback={null}><GiftSent /></Suspense>;
}
