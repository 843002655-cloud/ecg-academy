import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/api-utils";
import { mapQuizRow, QUIZ_PRODUCT, quizTableUnavailableError } from "@/lib/quiz-questions";
import { formatZodErrors, quizQuestionUpdateSchema } from "@/lib/validators";

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("could not find the table") ||
    lower.includes("schema cache")
  );
}

// PUT /api/quiz-questions/[id] — 管理员更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin(request.headers.get("cookie") || ""))) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = quizQuestionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "数据格式错误", details: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    if (
      parsed.data.options &&
      parsed.data.correct !== undefined &&
      parsed.data.correct >= parsed.data.options.length
    ) {
      return NextResponse.json({ error: "correct 索引超出选项范围" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .update(parsed.data)
      .eq("id", params.id)
      .eq("product", QUIZ_PRODUCT)
      .select("*")
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({ error: quizTableUnavailableError() }, { status: 503 });
      }
      console.error("PUT /api/quiz-questions/[id]:", error.message);
      return NextResponse.json({ error: "更新失败，请稍后重试" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "题目不存在" }, { status: 404 });
    }

    return NextResponse.json({ question: mapQuizRow(data as Record<string, unknown>) });
  } catch (error: unknown) {
    console.error("PUT /api/quiz-questions/[id] error:", error);
    return NextResponse.json({ error: "更新失败，请稍后重试" }, { status: 500 });
  }
}

// DELETE /api/quiz-questions/[id] — 管理员删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin(request.headers.get("cookie") || ""))) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    const { error, count } = await supabaseAdmin
      .from("quiz_questions")
      .delete({ count: "exact" })
      .eq("id", params.id)
      .eq("product", QUIZ_PRODUCT);

    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({ error: quizTableUnavailableError() }, { status: 503 });
      }
      console.error("DELETE /api/quiz-questions/[id]:", error.message);
      return NextResponse.json({ error: "删除失败，请稍后重试" }, { status: 500 });
    }

    if (!count) {
      return NextResponse.json({ error: "题目不存在" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("DELETE /api/quiz-questions/[id] error:", error);
    return NextResponse.json({ error: "删除失败，请稍后重试" }, { status: 500 });
  }
}
