import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Handles the redirect back from Google (and any other OAuth provider).
// Exchanges the ?code=... in the URL for a real session and sets the
// session cookies server-side, BEFORE the app tries to load any data.
// Without this step, the client redirects straight to "/" and the
// homepage's first fetch to /api/contacts can race the cookie being set,
// which is what was causing the brief "Unauthorized" banner.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Behind Vercel's proxy (and with a custom domain like koicard.app),
  // `origin` from the request URL can resolve to Vercel's internal
  // deployment host instead of the public-facing domain. Using
  // x-forwarded-host ensures every redirect below targets the domain
  // the browser actually thinks it's on.
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  const isLocalEnv = process.env.NODE_ENV === "development";
  const base = isLocalEnv || !forwardedHost ? origin : `${forwardedProto}://${forwardedHost}`;

  if (!code) {
    return NextResponse.redirect(`${base}/auth?error=${encodeURIComponent("No auth code was returned by Google.")}`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Surface the real reason instead of bouncing back silently.
    return NextResponse.redirect(`${base}/auth?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${base}${next}`);
}
