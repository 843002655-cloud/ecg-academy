/** 将 AI 生成的 case 对象映射为数据库插入所需的字段
 *  因为 DB CHECK 约束只允许旧分类(SVT/VT/AF)，真实分类存入 content_json.display_category */
export function flattenCase(
  c: Record<string, unknown>,
  extra?: Record<string, unknown>
) {
  const realCategory = (c.category as string) || "SVT";
  return {
    title: (c.title as string) || "未命名",
    // DB category 固定为 SVT 绕过 CHECK 约束；真实分类存在 content_json.display_category
    category: "SVT",
    difficulty: (c.difficulty as string) || "基础",
    description: (c.description as string) || "",
    ecg_findings:
      ((c.ecg_findings as Record<string, unknown>)?.details as string[]) ||
      (c.ecg_findings as string[]) ||
      [],
    question: (c.question as string) || "",
    hint: (c.hint as string) || "",
    key_points: (c.key_points as string[]) || [],
    is_published: false,
    mapping_system: (c.mapping_system as string) || "",
    content_json: { ...c, ...extra, product: "ecg-academy", display_category: realCategory } as Record<string, unknown>,
  };
}

/** 从 case 数据中获取展示用分类（优先 content_json.display_category，回退 category） */
export function getDisplayCategory(c: Record<string, unknown> | null | undefined): string {
  if (!c) return "SVT";
  const contentJson = c.content_json as Record<string, unknown> | undefined;
  return (contentJson?.display_category as string) || (c.category as string) || "SVT";
}
