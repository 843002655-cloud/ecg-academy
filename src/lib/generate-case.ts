import { deepseek, DEEPSEEK_MODEL } from "@/lib/deepseek";

const SYSTEM_PROMPT = `# Role
你是一位资深心内科主任医师和心电图教学编辑。你的任务是将英文心电图病例书中的每个病例转化为结构化的中文教学病例。

# Core Rule — 铁律
**所有文字内容必须严格来自原文。你可以翻译成中文，但不能编造任何患者数据、测量值、诊断结论。**
原文中的每一个数值、每一个诊断结论都必须保留。

# 难度自动判断规则
- **基础**：正常心电图、窦性心律失常、单纯早搏、简单传导阻滞
- **进阶**：心肌缺血/梗死定位、束支阻滞、房颤房扑、SVT 鉴别、电解质异常
- **高级**：宽 QRS 心动过速鉴别、复杂心梗（多壁/合并束支阻滞）、起搏器 ECG、Brugada、Wellens、de Winter

# 分类判断
根据 Clinical interpretation 判断所属分类：
- 正常心电图、心肌缺血、心律失常、ST-T改变、束支阻滞、电解质异常、起搏器、心腔肥大、急诊

# Output JSON Schema
{
  "title": "中文标题（格式：ECG N: 核心判读发现）",
  "category": "分类（中文）",
  "difficulty": "基础/进阶/高级",
  "source": "150 ECG Cases 5th Ed., John Hampton, ECG N",
  "description": "中文病例摘要（50-100字，保留原文患者信息和主诉）",
  "patient": {
    "age": 数字或null,
    "gender": "男/女/null",
    "chief_complaint": "主诉（中文翻译）",
    "history": "病史（中文翻译，如有）"
  },
  "ecg_findings": {
    "summary": "ECG 总体描述的中文翻译，含心率、节律、间期等关键数值",
    "details": ["逐个心电图发现的列表，保留原文测量值"]
  },
  "final_diagnosis": "原文 Clinical interpretation 的中文翻译",
  "management": "原文 What to do 的中文翻译",
  "learning_stages": [
    {
      "stage": 1,
      "title": "心率与节律",
      "question": "引导问题（中文，基于原文内容）",
      "key_concept": "核心概念",
      "expected_answer_points": ["原文中的答案要点"],
      "common_mistakes": ["学员常见错误（基于你的教学经验）"]
    }
  ],
  "key_points": ["原文关键知识点（3-5个）"],
  "clinical_pearls": ["原文临床经验点（如有）"],
  "tags": ["标签"]
}`;

const CATEGORY_TO_DB: Record<string, string> = {
  正常心电图: "正常心电图",
  心肌缺血: "心肌缺血",
  心律失常: "心律失常",
  "ST-T改变": "ST-T改变",
  束支阻滞: "束支阻滞",
  电解质异常: "电解质异常",
  起搏器: "起搏器",
  心腔肥大: "心腔肥大",
  急诊: "急诊",
};

export interface GeneratedCaseContent {
  title: string;
  category: string;
  difficulty: string;
  source?: string;
  description: string;
  patient?: Record<string, unknown>;
  ecg_findings?: Record<string, unknown> | string[];
  final_diagnosis?: string;
  management?: string;
  learning_stages?: Array<Record<string, unknown>>;
  key_points?: string[];
  clinical_pearls?: string[];
  tags?: string[];
}

export function flattenCaseForDb(
  caseData: GeneratedCaseContent,
  imageUrl?: string
): Record<string, unknown> {
  const patient = (caseData.patient || {}) as Record<string, unknown>;
  const ecg =
    caseData.ecg_findings && !Array.isArray(caseData.ecg_findings)
      ? (caseData.ecg_findings as Record<string, unknown>)
      : { details: caseData.ecg_findings || [] };

  const displayCategory = caseData.category || "正常心电图";
  const dbCategory = CATEGORY_TO_DB[displayCategory] || "正常心电图";
  const stages = caseData.learning_stages || [];

  return {
    title: caseData.title,
    category: dbCategory,
    difficulty: caseData.difficulty || "基础",
    description: caseData.description || "",
    ecg_findings: (ecg.details as string[]) || [],
    question: stages[0]?.question ? String(stages[0].question) : "",
    hint: "",
    key_points: caseData.key_points || [],
    is_published: false,
    tier: caseData.difficulty === "高级" ? 3 : caseData.difficulty === "进阶" ? 2 : 1,
    content_json: {
      source: caseData.source || "",
      product: "ecg-academy",
      display_category: displayCategory,
      patient,
      ecg_findings: ecg,
      final_diagnosis: caseData.final_diagnosis || "",
      management: caseData.management || "",
      learning_stages: stages,
      key_points: caseData.key_points || [],
      clinical_pearls: caseData.clinical_pearls || [],
      image_urls: imageUrl ? [imageUrl] : [],
      tags: caseData.tags || [],
    },
  };
}

export async function generateBookCaseFromText(input: {
  questionText: string;
  answerText: string;
  caseNumber?: number;
  source?: string;
}): Promise<GeneratedCaseContent> {
  const caseLabel = input.caseNumber ? `病例 #${input.caseNumber}` : "病例";
  const prompt = `【${caseLabel} — 问题页原文】
${input.questionText}

【${caseLabel} — 答案解析原文】
${input.answerText}

请严格按照原文内容，将以上心电图病例转化为结构化 JSON 教学病例。所有数据必须来自原文。`;

  const response = await deepseek.chat.completions.create({
    model: DEEPSEEK_MODEL,
    max_tokens: 4096,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt.slice(0, 30000) },
    ],
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as GeneratedCaseContent;
  if (input.source) parsed.source = input.source;
  return parsed;
}
