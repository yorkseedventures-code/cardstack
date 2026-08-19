import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only, privileged operations (bypasses RLS).
// NEVER import this into any client component or expose it to the browser.
// Requires SUPABASE_SERVICE_ROLE_KEY to be set (no NEXT_PUBLIC_ prefix).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
