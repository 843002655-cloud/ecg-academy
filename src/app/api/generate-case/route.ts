import { NextRequest, NextResponse } from "next/server";
import { deepseek, DEEPSEEK_MODEL } from "@/lib/deepseek";

const PRODUCT = "ecg-academy";

const SYSTEM_PROMPT = `# Role
你是心脏电生理与心电图领域的医学编辑，擅长生成标准化的心电图判读教学病例。

# Standards
1. 术语准确，使用中文标准术语（如"ST段抬高"而非"ST提高"）
2. 每个病例遵循结构化模板：临床场景 → ECG所见 → 判读要点 → 鉴别诊断 → 临床提示
3. 加入真实临床常见的陷阱和误区
4. 难度需匹配指定的等级
5. 心电图描述要具体、可教学——不只是"异常"而是精确描述特征`;

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, count = 1 } = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY 未配置" },
        { status: 500 }
      );
    }

    const prompt = `请生成 ${count} 个心电图判读教学案例，分类：${category}，难度：${difficulty}，产品标识：${PRODUCT}。

每个案例需包含以下结构化的临床内容：

1. **临床场景**: 年龄/性别/主诉（一句话），既往史（如相关）
2. **ECG 关键所见**: 4-6 条精确的心电图特征描述（心率、节律、PR间期、QRS宽度、QTc、电轴、ST段、T波等具体数值）
3. **判读要点**: 这个 ECG 的教学价值在哪里
4. **鉴别诊断**: 2-3 个需要考虑的诊断及排除依据
5. **陷阱提醒**: 容易漏诊或误诊的点

严格按照以下 JSON 数组输出，不要包含任何其他内容：
[
  {
    "title": "案例标题（15字以内）",
    "description": "临床场景+关键ECG特征概述（50-100字）",
    "ecg_findings": ["ECG发现1（具体数值）", "ECG发现2", "ECG发现3", "ECG发现4"],
    "question": "苏格拉底式核心提问（引导学员观察和思考）",
    "hint": "教学提示（指出思考方向，不直接给答案）",
    "key_points": ["知识点1", "知识点2", "知识点3", "知识点4"]
  }
]

只输出 JSON，不要包含 markdown 代码块标记。`;

    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 4096,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt + '\n\n输出必须是一个 JSON 对象，格式为：{ "cases": [...] }' },
      ],
    });

    const text = response.choices[0]?.message?.content || '{"cases":[]}';

    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    const cases = Array.isArray(parsed) ? parsed : (parsed.cases || []);

    return NextResponse.json({ cases });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Generate case API error:", err);
    return NextResponse.json(
      { error: err.message || "案例生成失败" },
      { status: 500 }
    );
  }
}
