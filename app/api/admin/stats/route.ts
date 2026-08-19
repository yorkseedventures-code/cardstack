import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const [statsRes, contactsRes, scansRes] = await Promise.all([
      supabase.rpc("get_signup_stats"),
      supabase.from("contacts").select("id", { count: "exact", head: true }),
      supabase.from("scans").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      signups: statsRes.data ?? {},
      total_contacts: contactsRes.count ?? 0,
      total_scans: scansRes.count ?? 0,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
