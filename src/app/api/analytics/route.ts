import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { event_type, path, duration_ms, metadata } = await request.json();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";

    // Get user if logged in
    const cookieHeader = request.headers.get("cookie") || "";
    let userId = null;
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieHeader.split("; ").map(c => { const [n, ...r] = c.split("="); return { name: n, value: r.join("=") }; }), setAll() {} } }
      );
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id || null;
    } catch {}

    // Generate session ID from IP + date (simple, no cookies needed)
    const today = new Date().toISOString().split("T")[0];
    const sessionId = `${ip}-${today}`;

    await supabaseAdmin.from("analytics_events").insert({
      event_type,
      path: path || "/",
      ip_address: ip,
      user_agent: userAgent,
      referrer: referrer || "",
      user_id: userId,
      session_id: sessionId,
      duration_ms: duration_ms || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
