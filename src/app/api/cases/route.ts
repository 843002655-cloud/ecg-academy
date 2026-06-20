import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { caseSchema, formatZodErrors } from "@/lib/validators";
import { fetchLearnerCounts } from "@/lib/learner-stats";
import { filterHamptonBookCases, sortCasesByEcgNumber } from "@/lib/ecg-case-meta";
function getDisplayCategory(c: Record<string, unknown> | null | undefined): string {
  if (!c) return "SVT";
  const contentJson = c.content_json as Record<string, unknown> | undefined;
  return (contentJson?.display_category as string) || (c.category as string) || "SVT";
}

const PRODUCT = "ecg-academy";

// GET /api/cases — list cases (public: published only; admin: all)
// Filters by content_json->>product="ecg-academy" (Plan B shared backend)
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const tier = searchParams.get("tier");
  const admin = await isAdmin(request.headers.get("cookie") || "");

  let query = supabaseAdmin
    .from("cases")
    .select("*")
    .eq("content_json->>product", PRODUCT);

  if (!admin) query = query.eq("is_published", true);
  // 真实分类存在 content_json.display_category，DB category 列固定为 SVT
  if (category) query = query.eq("category", category);
  if (difficulty) query = query.eq("difficulty", difficulty);
  if (tier) query = query.eq("tier", parseInt(tier));

  const { data } = await query;

  // 替换 category 为真实 display_category
  const result = sortCasesByEcgNumber(filterHamptonBookCases(data || [])).map((row) => {
    (row as Record<string, unknown>).category = getDisplayCategory(row);
    return row;
  });
  const caseIds = result.map((r) => (r as Record<string, unknown>).id as string);
  const learnerCounts = await fetchLearnerCounts(supabaseAdmin, caseIds);

  return NextResponse.json({ cases: result, learnerCounts });
}

// POST /api/cases — admin create case
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request.headers.get("cookie") || ""))) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }
    const body = await request.json();
    const parsed = caseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "数据格式错误", details: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const { error, data } = await supabaseAdmin.from("cases").insert(parsed.data).select().single();
    if (error) {
      console.error("POST /api/cases DB error:", error.message);
      return NextResponse.json({ error: "创建失败，请稍后重试" }, { status: 500 });
    }
    return NextResponse.json({ case: data });
  } catch (error: unknown) {
    console.error("POST /api/cases error:", error);
    return NextResponse.json({ error: "创建失败，请稍后重试" }, { status: 500 });
  }
}
