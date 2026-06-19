import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { attachAdminCookie } from "@/lib/admin-session";
import { appRedirect, isAdminEmail } from "@/lib/supabase-route";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = ((form.get("email") as string) || "").trim();
  const password = (form.get("password") as string) || "";

  if (!email || !password) {
    return NextResponse.redirect(appRedirect(request, "/admin?error=wrong"), 302);
  }

  if (!isAdminEmail(email)) {
    return NextResponse.redirect(appRedirect(request, "/admin?error=not_admin"), 302);
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.redirect(appRedirect(request, "/admin?error=wrong"), 302);
  }

  const response = NextResponse.redirect(appRedirect(request, "/admin"), 302);
  attachAdminCookie(response, email);
  return response;
}
