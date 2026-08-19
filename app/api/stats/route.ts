import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("get_signup_count");
    if (error) throw error;
    return NextResponse.json({ count: data ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
