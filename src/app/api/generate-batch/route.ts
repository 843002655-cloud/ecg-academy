import { NextRequest, NextResponse } from "next/server";
import { deepseek, DEEPSEEK_MODEL } from "@/lib/deepseek";
import { supabaseAdmin } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/api-utils";
import { caseSchema } from "@/lib/validators";
import { flattenCase } from "@/lib/case-utils";

const PRODUCT = "ecg-academy";

// ── Prompt templates adapted from docs/prompt-templates-basic-ecg.md ──

const TEMPLATES: Record<number, { name: string; categories: string[]; count: number; prompt: string }> = {
  1: {
    name: "正常心电图入门",
    categories: ["正常心电图"],
    count: 24,
    prompt: `你是心脏电生理教学专家。请生成 24 个基础心电图教学病例，覆盖正常心电图识别和基本测量。

要求：
1. 每个病例有标准 12 导联心电图的文字描述（模拟真实心电图所见）
2. 苏格拉底式提问：不直接给答案，通过递进问题引导判读
3. 覆盖知识点：P波形态、PR间期、QRS宽度、QTc、电轴目测、窦律确认
4. category 统一为 "正常心电图"，difficulty 为 "基础"

知识点分布（24例）：
- 窦律确认：5 例（不同心率、P波形态变异）
- PR 间期：4 例（正常范围、一度AV阻滞的边界值）
- QRS 宽度：4 例（窄 QRS、临界宽度）
- QTc 测量：5 例（正常、边界值、不同心率下的纠正）
- 电轴判断：4 例（正常电轴、电轴偏左、电轴偏右的识别）
- 综合入门：2 例（多参数综合判断）

输出 JSON 格式：
{ "cases": [
  {
    "title": "简洁的中文标题（<20字）",
    "category": "正常心电图",
    "difficulty": "基础",
    "description": "临床场景+关键ECG特征概述（50-100字）",
    "ecg_findings": ["心率: 75 bpm，窦律", "PR间期: 160ms，正常", "QRS宽度: 90ms，正常", "QTc: 420ms", "电轴: 约+45°（正常）"],
    "question": "苏格拉底式起手问题（引导用户观察心电图）",
    "hint": "提示（不直接给答案）",
    "key_points": ["知识点1", "知识点2", "知识点3", "知识点4"],
    "learning_stages": [
      {"stage": 1, "ai_prompt": "第一层提问（观察层面）", "expected_answer": "期望回答方向"},
      {"stage": 2, "ai_prompt": "第二层提问（解读层面）", "expected_answer": "期望回答方向"},
      {"stage": 3, "ai_prompt": "第三层提问（推理/鉴别层面）", "expected_answer": "期望回答方向"},
      {"stage": 4, "ai_prompt": "总结反馈", "expected_answer": "关键教学点"}
    ],
    "content_json": {"source": "心电学堂基础心电图系列 · 正常心电图入门"}
  }
]}

只输出 JSON 对象，不要 markdown 代码块。`,
  },

  2: {
    name: "心腔肥大 + 束支阻滞",
    categories: ["心腔肥大", "束支阻滞"],
    count: 24,
    prompt: `你是心脏电生理教学专家。请生成 24 个心电图教学病例，覆盖心腔肥大和束支阻滞的判读。

要求：
1. 每个病例有详细的 ECG 所见描述
2. 苏格拉底式递进提问
3. category 在该病例对应分类中选择：心腔肥大 或 束支阻滞
4. difficulty 为 "基础" 或 "进阶"

知识点分布（24例）：
- 左房异常（P mitrale）：3 例
- 右房异常（P pulmonale）：3 例
- 左室肥大（LVH）：4 例（Cornell/Sokolow-Lyon电压标准、ST-T继发改变）
- 右室肥大（RVH）：2 例
- 完全性右束支阻滞（RBBB）：4 例（V1 rsR'形态、I/aVL/V5-V6宽S波）
- 完全性左束支阻滞（LBBB）：4 例（V1 QS型、I/aVL/V5-V6宽R波伴切迹）
- 左前分支阻滞（LAFB）：2 例
- 左后分支阻滞（LPFB）：2 例

输出 JSON 格式：
{ "cases": [
  {
    "title": "简洁的中文标题（<20字）",
    "category": "心腔肥大 或 束支阻滞",
    "difficulty": "基础 或 进阶",
    "description": "临床场景+ECG特征概述（50-100字）",
    "ecg_findings": ["具体ECG发现1", "发现2", "发现3", "发现4", "发现5"],
    "question": "苏格拉底式核心提问",
    "hint": "教学提示",
    "key_points": ["知识点1", "知识点2", "知识点3", "知识点4"],
    "learning_stages": [
      {"stage": 1, "ai_prompt": "观察层面提问", "expected_answer": "期望回答"},
      {"stage": 2, "ai_prompt": "解读层面提问", "expected_answer": "期望回答"},
      {"stage": 3, "ai_prompt": "推理/鉴别层面提问", "expected_answer": "期望回答"},
      {"stage": 4, "ai_prompt": "总结", "expected_answer": "关键教学点"}
    ],
    "content_json": {"source": "心电学堂基础心电图系列 · 心腔肥大与束支阻滞"}
  }
]}

只输出 JSON 对象，不要 markdown 代码块。`,
  },

  3: {
    name: "心肌缺血与梗死",
    categories: ["心肌缺血"],
    count: 24,
    prompt: `你是心脏电生理教学专家。请生成 24 个心电图教学病例，覆盖心肌缺血和心肌梗死的心电图判读。

要求：
1. 每个病例给出临床场景（年龄、主诉）+ ECG 所见描述
2. 苏格拉底式递进提问（观察→定位→血管推理）
3. category 统一为 "心肌缺血"，difficulty 为 "进阶" 或 "高级"
4. 重要：每个病例末尾标注「仅供教学使用，不构成临床决策建议」

知识点分布（24例）：
- 前壁 STEMI：4 例（前间壁 V1-V3、前壁 V2-V4、广泛前壁 V1-V6、高侧壁 I/aVL）
- 下壁 STEMI：5 例（单纯下壁、下壁+右室、下壁+后壁、下壁+对应性改变×2）
- 侧壁/后壁 STEMI：3 例
- NSTEMI：2 例
- Wellens 综合征：2 例
- De Winter T 波：1 例
- STEMI 等位心电图（Sgarbossa 标准）：2 例
- 心梗定位推理：3 例（根据ST段抬高导联推罪犯血管）
- 心包炎 vs STEMI 鉴别：1 例
- 早期复极 vs STEMI 鉴别：1 例

输出 JSON 格式同上（category="心肌缺血"），只输出 JSON 对象。`,
  },

  4: {
    name: "ST-T 改变 + 电解质异常",
    categories: ["ST-T改变", "电解质异常"],
    count: 24,
    prompt: `你是心脏电生理教学专家。请生成 24 个心电图教学病例，覆盖 ST-T 异常和电解质/药物影响。

要求：
1. category 在该病例对应分类中选择：ST-T改变 或 电解质异常
2. difficulty 为 "基础" 或 "进阶"
3. 每个病例有详细 ECG 描述和苏格拉底式提问

知识点分布（24例）：
- 心包炎：3 例（弥漫性ST段抬高+PR段偏移，Spodick征）
- 早期复极综合征：3 例（J点抬高+ST段凹面向上+高R波）
- T 波异常：5 例（高尖T、倒置T、双相T、非特异性T波改变）
- 高钾血症：4 例（帐篷状高尖T→P波低平→QRS增宽→正弦波）
- 低钾血症：3 例（T波低平+U波明显+ST段压低）
- 高钙/低钙：2 例（QTc缩短/QTc延长）
- 地高辛效应：1 例（下斜型ST段压低）
- Wellens T 波复训：1 例
- Brugada 样心电图：2 例

输出 JSON 格式同上，只输出 JSON 对象。`,
  },

  5: {
    name: "急诊场景 + 起搏器 + 心律失常基础",
    categories: ["急诊", "起搏器", "心律失常"],
    count: 24,
    prompt: `你是心脏电生理教学专家。请生成 24 个心电图教学病例，覆盖急诊常见心电图判读、起搏器心电图基础和心律失常入门。

要求：
1. category 在该病例对应分类中选择：急诊、起搏器 或 心律失常
2. difficulty 为 "基础"、"进阶" 或 "高级"
3. 急诊病例要体现紧急性，起搏器病例要有起搏信号特征描述

知识点分布（24例）：
- 胸痛+心电图：5 例（STEMI/NSTEMI/不稳定性心绞痛/心包炎/主动脉夹层线索）
- 晕厥+心电图：3 例（长QT/Brugada样/WPW合并Af）
- 心悸+心电图：3 例（窄QRS心动过速/宽QRS心动过速/不规则心动过速的初始判读）
- 起搏器心电图基础：5 例（单腔心室起搏/双腔起搏/CRT/ICD/起搏器功能异常）
- 电解质急症：2 例（高钾/低钾的紧急识别）
- 低体温心电图：1 例（Osborn波）
- 肺栓塞心电图线索：1 例（SI QIII TIII+右室劳损）
- 窄QRS心动过速鉴别：2 例（AVNRT/AVRT/AT的ECG线索）
- 宽QRS心动过速鉴别：2 例（VT vs SVT伴差传的Brugada/Wellens算法）

输出 JSON 格式同上，只输出 JSON 对象。`,
  },
};

// GET /api/generate-batch — list available templates
export async function GET() {
  const templates = Object.entries(TEMPLATES).map(([id, t]) => ({
    id: Number(id),
    name: t.name,
    categories: t.categories,
    count: t.count,
  }));
  return NextResponse.json({ templates, total_cases: templates.reduce((s, t) => s + t.count, 0) });
}

// POST /api/generate-batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template_id, count: requestedCount, secret } = body;

    // Auth: admin cookie OR generate secret
    const cookieAuth = await isAdmin(request.headers.get("cookie") || "");
    const secretAuth =
      secret && process.env.GENERATE_SECRET && secret === process.env.GENERATE_SECRET;
    if (!cookieAuth && !secretAuth) {
      return NextResponse.json(
        { error: "需要管理员权限或有效的 GENERATE_SECRET" },
        { status: 403 }
      );
    }

    const tid = Number(template_id);

    if (!tid || tid < 1 || tid > 5) {
      return NextResponse.json(
        { error: "template_id 必须为 1-5" },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY 未配置" },
        { status: 500 }
      );
    }

    const template = TEMPLATES[tid];
    const count = Math.min(requestedCount || template.count, template.count);

    // Adjust prompt for actual count
    const prompt = template.prompt.replace(
      /请生成 \d+ 个/,
      `请生成 ${count} 个`
    );

    console.log(`[generate-batch] Template ${tid}: ${template.name}, count=${count}`);

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 16384,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你是心脏电生理与心电图领域的医学教育专家。输出必须为严格的 JSON 对象，不包含 markdown 代码块。心电图描述需具体准确，术语使用中文标准术语。",
        },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content || '{"cases":[]}';
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("[generate-batch] JSON parse failed:", cleaned.slice(0, 500));
      return NextResponse.json(
        { error: "AI 返回格式异常，请重试" },
        { status: 500 }
      );
    }

    const cases = (Array.isArray(parsed)
      ? parsed
      : (parsed.cases as Array<Record<string, unknown>>) || []) as Record<string, unknown>[];

    if (!cases.length) {
      return NextResponse.json(
        { error: "AI 未生成任何病例", raw: cleaned.slice(0, 500) },
        { status: 500 }
      );
    }

    // Save each case to DB
    const saved: Array<{ id: string; title: string; category: string }> = [];
    const errors: Array<{ title: string; error: string }> = [];

    for (const c of cases) {
      try {
        const flat = flattenCase(c, {
          source: `心电学堂基础心电图系列 · ${template.name}`,
          disclaimer: "仅供教学使用，不构成临床决策建议",
        });

        // Validate
        const parsed_data = caseSchema.safeParse(flat);
        if (!parsed_data.success) {
          errors.push({
            title: (c.title as string) || "未知",
            error: parsed_data.error.issues.map((i) => i.message).join("; "),
          });
          continue;
        }

        const { error, data } = await supabaseAdmin
          .from("cases")
          .insert(parsed_data.data)
          .select("id, title, category")
          .single();

        if (error) {
          errors.push({
            title: (c.title as string) || "未知",
            error: error.message,
          });
        } else if (data) {
          saved.push(data as { id: string; title: string; category: string });
        }
      } catch (err: unknown) {
        errors.push({
          title: (c.title as string) || "未知",
          error: (err as Error).message,
        });
      }
    }

    console.log(
      `[generate-batch] Template ${tid}: saved=${saved.length}, errors=${errors.length}`
    );

    return NextResponse.json({
      template: template.name,
      generated: cases.length,
      saved: saved.length,
      errors: errors.length > 0 ? errors : undefined,
      cases: saved,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
        total_tokens: response.usage?.total_tokens,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[generate-batch] API error:", err);
    return NextResponse.json(
      { error: err.message || "批量生成失败" },
      { status: 500 }
    );
  }
}
