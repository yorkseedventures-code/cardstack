"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function AuthPageInner() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push(redirectTo);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 bg-[#f8f7f5]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#111] mb-2">ScanBiz</h1>
          <p className="text-[#aaa] text-sm">Scan cards. Build your network.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#ece9e4] p-6">
          <div className="flex gap-0 border border-[#e0ddd8] rounded-xl overflow-hidden mb-5">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${mode === "login" ? "bg-[#111] text-white" : "text-[#888]"}`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${mode === "signup" ? "bg-[#111] text-white" : "text-[#888]"}`}
            >
              Sign up
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div>
              <label className="block text-xs text-[#aaa] mb-1.5">Email</label>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[#aaa] mb-1.5">Password</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          {message && <p className="text-green-600 text-xs mb-3">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-all disabled:opacity-40"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </div>

        <p className="text-center text-xs text-[#bbb] mt-4">
          By continuing you agree to our terms of service
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}
