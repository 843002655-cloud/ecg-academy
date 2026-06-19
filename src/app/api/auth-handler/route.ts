import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { createSupabaseRouteClient, appRedirect } from "@/lib/supabase-route";
import { getClientIp } from "@/lib/request-utils";

async function trackRegistration(request: NextRequest, userId: string | null) {
  const ip = getClientIp(request);
  const today = new Date().toISOString().split("T")[0];

  await supabaseAdmin.from("analytics_events").insert({
    event_type: "register",
    path: "/auth",
    ip_address: ip,
    user_agent: request.headers.get("user-agent") || "",
    referrer: request.headers.get("referer") || "",
    user_id: userId,
    session_id: `${ip}-${today}`,
    metadata: {},
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = ((form.get("email") as string) || "").trim();
  const password = (form.get("password") as string) || "";
  const redirect = (form.get("redirect") as string) || "/";

  if (!email || !password) {
    return NextResponse.redirect(appRedirect(request, "/auth?error=missing"), 302);
  }

  const safeRedirect = redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
  const response = NextResponse.redirect(appRedirect(request, safeRedirect), 302);
  const supabase = createSupabaseRouteClient(request, response);

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { registered_at: new Date().toISOString() },
    });

    if (createError && !createError.message.toLowerCase().includes("already")) {
      return NextResponse.redirect(appRedirect(request, "/auth?error=register_failed"), 302);
    }

    if (created.user && !createError) {
      await trackRegistration(request, created.user.id);
    }

    ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
  }

  if (error || !data.session) {
    return NextResponse.redirect(appRedirect(request, "/auth?error=register_failed"), 302);
  }

  return response;
}
