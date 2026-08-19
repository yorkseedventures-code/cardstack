"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Status = "checking" | "invalid" | "already_claimed" | "needs_login" | "redeeming" | "claimed" | "error";

export default function GiftClaimPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      const infoRes = await fetch(`/api/gifts/${params.code}`);
      if (!infoRes.ok) { setStatus("invalid"); return; }
      const info = await infoRes.json();
      if (info.redeemed) { setStatus("already_claimed"); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus("needs_login"); return; }

      setStatus("redeeming");
      const redeemRes = await fetch(`/api/gifts/${params.code}`, { method: "POST" });
      const redeemBody = await redeemRes.json().catch(() => ({}));
      if (redeemRes.ok) {
        setExpiresAt(redeemBody.event_pass_expires_at);
        setStatus("claimed");
      } else if (redeemRes.status === 410) {
        setStatus("already_claimed");
      } else {
        setErrorMsg(redeemBody.error || "Something went wrong claiming this gift.");
        setStatus("error");
      }
    };
    run();
  }, [params.code]);

  const goToLogin = () => router.push(`/auth?redirect=${encodeURIComponent(`/gift/${params.code}`)}`);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-[#f8f7f5] text-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#ece9e4] p-8">
        {status === "checking" && <p className="text-sm text-[#888]">Checking your gift...</p>}

        {status === "invalid" && (
          <>
            <h1 className="text-xl font-bold text-[#111] mb-2">Gift not found</h1>
            <p className="text-sm text-[#888]">This link doesn't match a valid gift. Double-check the link, or ask your friend to resend it.</p>
          </>
        )}

        {status === "already_claimed" && (
          <>
            <h1 className="text-xl font-bold text-[#111] mb-2">Already claimed</h1>
            <p className="text-sm text-[#888] mb-5">This gift has already been redeemed.</p>
            <button onClick={() => router.push("/")} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all">
              Go to KoiCard
            </button>
          </>
        )}

        {status === "needs_login" && (
          <>
            <div className="text-3xl mb-3">🎁</div>
            <h1 className="text-xl font-bold text-[#111] mb-2">You've got an Event Pass!</h1>
            <p className="text-sm text-[#888] mb-5">Sign up or log in to claim your 4 days of unlimited scanning.</p>
            <button onClick={goToLogin} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all">
              Claim your pass
            </button>
          </>
        )}

        {status === "redeeming" && <p className="text-sm text-[#888]">Claiming your pass...</p>}

        {status === "claimed" && (
          <>
            <div className="text-3xl mb-3">🎉</div>
            <h1 className="text-xl font-bold text-[#111] mb-2">Pass activated!</h1>
            <p className="text-sm text-[#888] mb-5">
              Unlimited scans until{" "}
              {expiresAt ? new Date(expiresAt).toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "in 4 days"}.
            </p>
            <button onClick={() => router.push("/")} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all">
              Start scanning
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-[#111] mb-2">Something went wrong</h1>
            <p className="text-sm text-[#888]">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
