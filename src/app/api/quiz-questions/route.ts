import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fetchQuizQuestions,
  mapQuizRow,
  QUIZ_PRODUCT,
  quizTableUnavailableError,
} from "@/lib/quiz-questions";
import { formatZodErrors, quizQuestionSchema } from "@/lib/validators";

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("could not find the table") ||
    lower.includes("schema cache")
  );
}

// GET /api/quiz-questions — 公开读取，DB 优先，空表回退本地题库
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  const { questions, source } = await fetchQuizQuestions();
  return NextResponse.json({ questions, source });
}

// POST /api/quiz-questions — 管理员新增题目
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request.headers.get("cookie") || ""))) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = quizQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "数据格式错误", details: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    if (parsed.data.correct >= parsed.data.options.length) {
      return NextResponse.json({ error: "correct 索引超出选项范围" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .insert({
        ...parsed.data,
        product: QUIZ_PRODUCT,
      })
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({ error: quizTableUnavailableError() }, { status: 503 });
      }
      console.error("POST /api/quiz-questions:", error.message);
      return NextResponse.json({ error: "创建失败，请稍后重试" }, { status: 500 });
    }

    return NextResponse.json({ question: mapQuizRow(data as Record<string, unknown>) });
  } catch (error: unknown) {
    console.error("POST /api/quiz-questions error:", error);
    return NextResponse.json({ error: "创建失败，请稍后重试" }, { status: 500 });
  }
}
