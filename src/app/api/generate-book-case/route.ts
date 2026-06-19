import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/api-utils";
import { supabaseAdmin } from "@/lib/supabase-server";
import { flattenCaseForDb, generateBookCaseFromText } from "@/lib/generate-case";
import { formatZodErrors, generateBookCaseSchema } from "@/lib/validators";

// POST /api/generate-book-case — 管理员：从书籍原文 AI 生成病例并入库
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request.headers.get("cookie") || ""))) {
      return NextResponse.json({ error: "需要管理员权限" }, { status: 403 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY 未配置" }, { status: 500 });
    }

    const body = await request.json();
    const parsed = generateBookCaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "数据格式错误", details: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { questionText, answerText, caseNumber, source, imageUrl, publish } = parsed.data;

    const generated = await generateBookCaseFromText({
      questionText,
      answerText,
      caseNumber,
      source,
    });

    const row = flattenCaseForDb(generated, imageUrl);
    if (publish) row.is_published = true;

    const { data, error } = await supabaseAdmin
      .from("cases")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/generate-book-case DB error:", error.message);
      return NextResponse.json({ error: "入库失败，请稍后重试" }, { status: 500 });
    }

    return NextResponse.json({
      case: data,
      generated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "生成失败";
    console.error("POST /api/generate-book-case:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
