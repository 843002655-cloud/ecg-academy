import { NextRequest, NextResponse } from "next/server";
import { getUserId, getServerSupabase } from "@/lib/api-utils";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getEffectivePlan, PLAN_LABELS, type MembershipPlan } from "@/lib/plans";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";
  const userId = await getUserId(cookieHeader);
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const supabase = getServerSupabase(cookieHeader);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", userId)
    .maybeSingle();

  const rawPlan = (profile?.plan as MembershipPlan) || "free";
  const planExpiresAt = (profile?.plan_expires_at as string) || null;
  const plan = getEffectivePlan(rawPlan, planExpiresAt);

  const { count: chatCount } = await supabaseAdmin
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", "ai_chat");

  return NextResponse.json({
    email: user?.email || null,
    plan,
    planLabel: PLAN_LABELS[plan],
    planExpiresAt: plan !== "free" ? planExpiresAt : null,
    chatCount: chatCount || 0,
    canAccessQuiz: plan === "pro" || plan === "institution",
  });
}
