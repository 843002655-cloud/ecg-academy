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
