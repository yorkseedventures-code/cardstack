"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Status = "checking" | "needs_login" | "redeeming" | "done" | "error";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

// Landing page for a shared access-code link, e.g. koicard.app/access/YS-LISBON-NOV26
export default function AccessCodePage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [info, setInfo] = useState<{ starts_at: string; expires_at: string; scans: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus("needs_login"); return; }
      setStatus("redeeming");
      const res = await fetch("/api/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: params.code }) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) { setInfo(body); setStatus("done"); }
      else { setErrorMsg(body.error || "Something went wrong."); setStatus("error"); }
    };
    run();
  }, [params.code]);

  const goToLogin = () => router.push(`/auth?redirect=${encodeURIComponent(`/access/${params.code}`)}`);
  const started = info ? new Date(info.starts_at).getTime() <= Date.now() : true;

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-[#f8f7f5] text-center">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#ece9e4] p-8">
        {status === "checking" && <p className="text-sm text-[#888]">One moment...</p>}

        {status === "needs_login" && (
          <>
            <div className="text-3xl mb-3">🎟️</div>
            <h1 className="text-xl font-bold text-[#111] mb-2">You have KoiCard access</h1>
            <p className="text-sm text-[#888] mb-5">Sign up or log in to activate it. It only takes a minute.</p>
            <button onClick={goToLogin} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all">Activate my access</button>
          </>
        )}

        {status === "redeeming" && <p className="text-sm text-[#888]">Activating your access...</p>}

        {status === "done" && info && (
          <>
            <div className="text-3xl mb-3">🎉</div>
            <h1 className="text-xl font-bold text-[#111] mb-2">Access activated</h1>
            <p className="text-sm text-[#888] mb-5">
              {started
                ? <>Up to {info.scans} scans until {fmt(new Date(new Date(info.expires_at).getTime() - 1).toISOString())}.</>
                : <>Your {info.scans} scans start on {fmt(info.starts_at)} and run until {fmt(new Date(new Date(info.expires_at).getTime() - 1).toISOString())}. Until then you have the free plan.</>}
            </p>
            <button onClick={() => router.push("/")} className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all">Open KoiCard</button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-[#111] mb-2">Couldn't activate</h1>
            <p className="text-sm text-[#888]">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
