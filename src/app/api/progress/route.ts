import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/api-utils";

const PRODUCT = "ecg-academy";

// GET /api/progress — user's own progress (filtered by ecg-academy product)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request.headers.get("cookie") || "");
  if (!auth) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { data } = await supabaseAdmin
    .from("user_progress")
    .select("case_id, completed_at, cases(title, category)")
    .eq("user_id", auth.userId)
    .order("completed_at", { ascending: false });

  // Count total published cases for this product
  const { count } = await supabaseAdmin
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("content_json->>product", PRODUCT);

  return NextResponse.json({ progress: data || [], totalCases: count || 0 });
}
