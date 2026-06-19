// ── Zod Validation Schemas for Admin API Routes ────────────────────────
import { z, ZodError } from "zod";

// ── Cases ────────────────────────────────────────────────────────────────

export const caseSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  category: z.enum(["SVT", "VT", "AF", "正常心电图", "心腔肥大", "束支阻滞", "心肌缺血", "ST-T改变", "电解质异常", "心律失常", "起搏器", "急诊"]),
  difficulty: z.enum(["基础", "进阶", "高级"]),
  description: z.string().max(500).optional(),
  ecg_findings: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
  question: z.string().max(500).optional(),
  hint: z.string().max(500).optional(),
  key_points: z.array(z.unknown()).optional(),
  is_published: z.boolean().optional(),
  content_json: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export const caseUpdateSchema = caseSchema.partial();

// ── Quiz Questions ───────────────────────────────────────────────────────

export const quizQuestionSchema = z.object({
  question: z.string().min(1, "题目不能为空").max(1000),
  options: z.array(z.string().min(1)).min(2).max(6),
  correct: z.number().int().min(0),
  explanation: z.string().max(2000).optional().default(""),
  category: z.string().min(1).max(50),
});

export const quizQuestionUpdateSchema = quizQuestionSchema.partial();

export const generateBookCaseSchema = z.object({
  questionText: z.string().min(20, "问题页原文过短"),
  answerText: z.string().min(20, "答案页原文过短"),
  caseNumber: z.number().int().positive().optional(),
  source: z.string().max(200).optional(),
  imageUrl: z.string().url().optional(),
  publish: z.boolean().optional().default(false),
});

export const wechatLoginSchema = z.object({
  code: z.string().min(1, "缺少微信授权 code"),
});

export const membershipActivateSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  plan: z.enum(["free", "pro", "institution"]).default("pro"),
  expiresAt: z.string().datetime().optional(),
});

// ── Validation helper ─────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));
}
