import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { deepseek, DEEPSEEK_MODEL } from "@/lib/deepseek";

const ANON_LIMIT = 20;  // 未注册用户，每天 20 次

function buildCaseContext(caseContext: Record<string, unknown>): string {
  const c = caseContext;
  const patient = (c.patient || {}) as Record<string, unknown>;
  const ecgFindings = (c.ecg_findings || c.ecg_findings_data || {}) as Record<string, unknown>;
  const learningStages = (c.learning_stages || []) as Array<Record<string, unknown>>;
  const figures = (ecgFindings.figures || []) as Array<Record<string, unknown>>;
  const keyPoints = (c.key_points || []) as string[];
  const pearls = (c.clinical_pearls || []) as string[];

  let ctx = `当前教学病例：
- 标题：${c.title || "未知"}
- 分类：${c.category || "未知"}
- 难度：${c.difficulty || "未知"}`;

  if (patient.age) {
    ctx += `
- 患者：${patient.gender || ""}，${patient.age}岁
- 主诉：${patient.chief_complaint || ""}
- 病史：${patient.history || ""}`;
    if (patient.comorbidities) {
      const com = patient.comorbidities as string[];
      if (com.length > 0) ctx += `
- 合并症：${com.join("、")}`;
    }
  }

  if (c.description) {
    ctx += `
- 病例摘要：${c.description}`;
  }

  if (ecgFindings.summary) {
    ctx += `
- ECG总结：${ecgFindings.summary}`;
  }
  const details = (ecgFindings.details || []) as string[];
  if (details.length > 0) {
    ctx += `
- ECG发现：${details.join("；")}`;
  }

  if (learningStages.length > 0) {
    ctx += `
- 教学阶段（共 ${learningStages.length} 个）：`;
    for (const stage of learningStages) {
      ctx += `
  · 阶段${stage.stage}「${stage.title}」：${stage.description || ""}
    引导问题：${stage.question || ""}
    核心概念：${stage.key_concept || ""}`;
      const expected = (stage.expected_answer_points || []) as string[];
      if (expected.length > 0) {
        ctx += `
    学员应回答的要点：${expected.join(" / ")}`;
      }
      const mistakes = (stage.common_mistakes || []) as string[];
      if (mistakes.length > 0) {
        ctx += `
    学员常见错误：${mistakes.join(" / ")}`;
      }
    }
  }

  if (figures.length > 0) {
    ctx += `
- 心电图资料（共 ${figures.length} 张）：`;
    for (const fig of figures) {
      ctx += `
  · ${fig.figure_number || ""}「${fig.title || ""}」${fig.teaching_points ? "— 教学要点：" + fig.teaching_points : ""}`;
    }
  }

  if (c.final_diagnosis) {
    ctx += `
- 最终诊断：${c.final_diagnosis}`;
  }

  if (keyPoints.length > 0) {
    ctx += `
- 关键知识点：${keyPoints.join("、")}`;
  }

  if (pearls.length > 0) {
    ctx += `
- 临床经验点：${pearls.join("；")}`;
  }

  return ctx;
}

function buildSystemPrompt(
  caseContext: Record<string, unknown>,
  currentFigure: Record<string, unknown> | undefined
): string {
  let prompt = `# Role
你是一位资深心内科主任医师，在心电图判读和临床教学方面拥有 30 年经验，
曾在阜外医院和 Mayo Clinic 接受培训，主编《临床心电图判读》教材。

你正在用苏格拉底式教学法辅导一位医生学习心电图判读。
你的风格：像一名严格但亲切的带教老师——不是搜索引擎，不是答题机器。
你的目标：训练医生的判读思维，让他们学会"看"心电图，而不是"背"心电图。

# 当前病例信息
${buildCaseContext(caseContext)}
`;

  if (currentFigure) {
    prompt += `
# 学员当前正在查看的心电图
- 编号：${currentFigure.figure_number || ""}
- 标题：${currentFigure.title || ""}
- 描述：${currentFigure.description || ""}
- 教学要点：${currentFigure.teaching_points || ""}
- 需回答的问题：${currentFigure.key_question || ""}

请围绕当前这张心电图进行教学引导。`;
  }

  prompt += `
# 苏格拉底式教学规则 —— 必须严格遵守

## 1. 心电图判读思维框架（核心）
引导学员按以下步骤系统性判读每份心电图。每次聚焦 1-2 步，循序渐进：
1. **心率与节律**：心率多少？是窦性心律吗？P 波存在吗？P 与 QRS 的关系？
2. **间期测量**：PR 间期？（正常 120-200ms）QRS 宽度？（正常 <120ms）QTc 多少？
3. **电轴**：电轴是正常的吗？偏高还是偏低？目测方法：看 I 和 aVF 导联 QRS 主波方向。
4. **P 波与 QRS 形态**：P 波形态有无异常？（左房/右房异常）QRS 有无异常？有无病理性 Q 波？
5. **ST 段与 T 波**：ST 段有无抬高/压低？T 波形态？有无对称改变？有无 U 波？
6. **综合判读**：把这些发现综合起来，列出可能的诊断和鉴别诊断。

"先别急着一眼看穿诊断。按照判读步骤——第一步，你看基础节律是什么？"

## 2. 难度适配
根据病例难度调整教学深度：
- **基础**：多解释基础概念（P 波代表什么、PR 间期正常值、导联体系等），给思考框架，容忍不完整回答
- **进阶**：假设学员有基础，聚焦鉴别诊断和临床决策，追问更深层机制
- **高级**：挑战罕见 ECG 表现、复杂心律失常机制、起搏器 ECG 解读

## 3. 永远不要直接给出诊断
❌ 错误做法："这是急性前壁心梗，因为 V1-V4 ST 段抬高..."
✅ 正确做法："你注意到 V1-V4 导联 ST 段有什么变化吗？抬高的形态是怎样的？这提示什么？"

## 4. 回复结尾规则
- 以开放式问题结尾，引导学员继续思考
- 学员明显卡住时：先给简短概念解释（200-300 字），再提一个检查理解的问题
- 概念混淆时：停下来纠错，确认学员理解后再继续

## 5. 鉴别诊断训练
- 每个关键步骤引导学员列出至少 2 个可能诊断
- "ST 段抬高除了急性心梗，还有哪些可能？这些可能性在这个病例中能被排除吗？"
- 最终让学员给出最可能的诊断及排除依据

## 6. 心电图陷阱提醒
常见易错点要特别提示：
- 早期复极 vs 心包炎 vs STEMI 的 ST 段抬高形态区别
- 2:1 房室阻滞时隐藏的 P 波
- 高钾血症 T 波 vs 超急性期 T 波的鉴别
- LBBB 时如何用 Sgarbossa 标准判断合并心梗
- 右位心 vs 左右手导联接反

## 7. 回复长度控制
- 普通引导：100-200 字
- 概念解释或复杂讨论：300-500 字
- 绝对不超过 1000 字

## 8. 适时引用指南
"2024 年 ESC STEMI 指南对这种情况的推荐是..."

## 9. 分享临床经验（每 3-4 轮穿插一次）
"在我急诊科轮转时遇到过一例类似的心电图，当时差点漏诊..."

## 10. 鼓励与确认
- 回答好时及时肯定："很好的观察！继续往下想——这个发现对鉴别诊断意味着什么？"
- 确认后再深入："完全正确。那么，如果这个患者同时还合并...情况，你的判读会改变吗？"

## 11. 语言风格
- 用中文回答，保留英文缩写（STEMI, NSTEMI, LBBB, RBBB, LAFB, LVH, QTc, Brugada, WPW）
- 语气像带教老师：专业、直接、偶尔幽默
- 可以分享真实临床经历增加可信度

# 特殊情况处理

**学员提出与当前问题不相关的话题：**
→ 先简短回答（2-4句话），再自然过渡回当前教学步骤

**学员请求提示：**
→ 给方向性提示，以问题形式："注意看 V5-V6 导联的 T 波，和 V1-V3 比较有什么不同？"

**学员说"不知道"超过 2 次：**
→ 降低难度，给更具体的引导："好，我们换个角度。先不管诊断，你告诉我这份心电图哪个导联最不正常？"

**学员请求评估：**
→ 给出结构化评估：判读系统性 / 知识掌握 / 鉴别诊断能力 / 改进建议`;
  return prompt;
}

function buildFigureIntroPrompt(
  caseContext: Record<string, unknown>,
  currentFigure: Record<string, unknown>,
  figureIndex: number,
  figureTotal: number
): string {
  return `# Role
你是一位资深心内科主任医师，正在带学员逐步判读心电图病例。

# 任务
学员刚刚切换到本病例的第 ${figureIndex + 1}/${figureTotal} 步。
请给出针对**当前这一步**的苏格拉底式教学开场（120-200 字）。

# 要求
1. 结合病例整体信息和当前步骤，引导学员按 ECG 判读框架观察（节律/间期/电轴/ST-T 等）
2. 不要重复之前已经讨论过的内容（参考对话历史）
3. 不要直接给出诊断或答案
4. 必须以开放式问题结尾（不能只用是/否回答）
5. 保留关键英文术语（STEMI, LBBB, QTc, AV block 等）
6. 语气像带教老师：专业、简洁

# 病例信息
${buildCaseContext(caseContext)}

# 当前步骤
- 编号/步骤：${currentFigure.figure_number || ""}
- 标题：${currentFigure.title || ""}
- 描述：${currentFigure.description || "（暂无文字描述，请结合病例上下文推断本步可能展示的内容）"}
- 教学要点：${currentFigure.teaching_points || ""}
${currentFigure.key_question && !String(currentFigure.key_question).includes("你在这")
  ? `- 参考引导问题：${currentFigure.key_question}`
  : ""}

直接输出开场白文本，不要 JSON，不要 markdown 标题。`;
}

// ── Helper: get Supabase client ────────────────────────────────────────

function getSupabase(cookieHeader: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieHeader.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll() {},
      },
    }
  );
}

function getSupabaseAdmin(cookieHeader: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieHeader.split("; ").map((c) => {
            const [name, ...rest] = c.split("=");
            return { name, value: rest.join("=") };
          });
        },
        setAll() {},
      },
    }
  );
}

// ── Quota ──────────────────────────────────────────────────────────────

async function checkAndIncrementQuota(
  userId: string | null,
  ip: string,
  cookieHeader: string
): Promise<{ allowed: boolean; remaining: number; total: number }> {
  if (userId) return { allowed: true, remaining: 999, total: 999 };

  const supabase = getSupabaseAdmin(cookieHeader);
  const today = new Date().toISOString().split("T")[0];
  const limit = ANON_LIMIT;

  const { data: existing } = await supabase
    .from("usage_logs")
    .select("chat_count")
    .eq("ip_address", ip)
    .eq("date", today)
    .maybeSingle();

  const current = existing?.chat_count || 0;

  if (current >= limit) {
    return { allowed: false, remaining: 0, total: limit };
  }

  const newCount = current + 1;
  const { error } = await supabase.from("usage_logs").upsert(
    { date: today, chat_count: newCount, ip_address: ip },
    { onConflict: "ip_address,date" }
  );
  if (error) console.error("Quota upsert error:", error);

  return { allowed: true, remaining: limit - newCount, total: limit };
}

// ── API ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const {
      caseContext,
      messages,
      caseId,
      stream = false,
      currentFigure,
      figureIntro = false,
      figureIndex = 0,
      figureTotal = 1,
    } = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY 未配置" },
        { status: 500 }
      );
    }

    const cookieHeader = request.headers.get("cookie") || "";
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const supabase = getSupabase(cookieHeader);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id || null;

    const quota = figureIntro
      ? { allowed: true, remaining: 999, total: 999 }
      : await checkAndIncrementQuota(userId, ip, cookieHeader);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: `今日对话次数已达上限（${quota.total}次），请明天再来`, quota },
        { status: 429 }
      );
    }

    const conversationMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })
    );

    // ── Figure intro: streaming plain text, no quota ─────────────────
    if (figureIntro && stream && currentFigure) {
      const streamResponse = await deepseek.chat.completions.create({
        model: DEEPSEEK_MODEL,
        max_tokens: 600,
        temperature: 0.7,
        stream: true,
        messages: [
          {
            role: "system",
            content: buildFigureIntroPrompt(
              caseContext,
              currentFigure,
              figureIndex,
              figureTotal
            ),
          },
          ...conversationMessages.slice(-6),
          {
            role: "user",
            content: "请给出这一步的苏格拉底式教学开场。",
          },
        ],
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const delta = chunk.choices[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(readable, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // ── Streaming mode ─────────────────────────────────────────────────
    if (stream) {
      const streamResponse = await deepseek.chat.completions.create({
        model: DEEPSEEK_MODEL,
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
        messages: [
          { role: "system", content: buildSystemPrompt(caseContext, currentFigure) },
          ...conversationMessages,
        ],
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const delta = chunk.choices[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            }
            if (userId) {
              const supabaseAdmin = getSupabaseAdmin(cookieHeader);
              await supabaseAdmin
                .from("user_progress")
                .upsert(
                  { user_id: userId, case_id: caseId, completed_at: new Date().toISOString(), score: 0 },
                  { onConflict: "user_id,case_id" }
                );
            }
          } catch (e) {
            console.error("Stream error:", e);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // ── Non-streaming mode ─────────────────────────────────────────────
    const response = await deepseek.chat.completions.create({
      model: DEEPSEEK_MODEL,
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            buildSystemPrompt(caseContext, currentFigure) +
            `\n\n# Output Format
严格按照以下 JSON 格式输出，不要包含任何其他内容：
{
  "status": "questioning",
  "content": "你的提问或评价文本",
  "hint": "仅在 status 为 hinting 时填写提示内容，否则留空字符串"
}

status 取值说明：
- questioning: 向学生提出下一个引导性问题（最常用）
- hinting: 学生回答有误或请求提示，给予方向性提示但不直接给答案
- confirming: 学生答对核心知识点时使用。给予肯定 + 过渡到下一个知识点的问题`,
        },
        ...conversationMessages,
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    let reply: string;
    let status = "questioning";
    let hint = "";
    try {
      const parsed = JSON.parse(raw);
      reply = parsed.content || raw;
      status = parsed.status || "questioning";
      hint = parsed.hint || "";
    } catch {
      reply = raw;
    }

    if (userId) {
      const supabaseAdmin = getSupabaseAdmin(cookieHeader);
      await supabaseAdmin
        .from("user_progress")
        .upsert(
          { user_id: userId, case_id: caseId, completed_at: new Date().toISOString(), score: 0 },
          { onConflict: "user_id,case_id" }
        );
    }

    return NextResponse.json({ reply, status, hint, quota });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err.message || "AI 服务暂时不可用" },
      { status: 500 }
    );
  }
}
