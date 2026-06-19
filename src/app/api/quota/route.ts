import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ANON_LIMIT = 20;

function getSupabaseAdmin(cookieHeader: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieHeader.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll() {},
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieHeader.split("; ").map((c) => {
              const [name, ...rest] = c.split("=");
              return { name, value: rest.join("=") };
            });
          },
          setAll() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    if (userId) {
      return NextResponse.json({ used: 0, remaining: 999, total: 999 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const today = new Date().toISOString().split("T")[0];
    const supabaseAdmin = getSupabaseAdmin(cookieHeader);

    const { data: existing } = await supabaseAdmin
      .from("usage_logs")
      .select("chat_count")
      .eq("ip_address", ip)
      .eq("date", today)
      .maybeSingle();

    const current = existing?.chat_count || 0;

    return NextResponse.json({
      used: current,
      remaining: Math.max(ANON_LIMIT - current, 0),
      total: ANON_LIMIT,
    });
  } catch {
    return NextResponse.json({ used: 0, remaining: 20, total: 20 });
  }
}
