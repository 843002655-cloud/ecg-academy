import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-session";
import { appRedirect } from "@/lib/supabase-route";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(appRedirect(request, "/admin"), 302);
  clearAdminCookie(response);
  return response;
}
