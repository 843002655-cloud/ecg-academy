type CaseLike = {
  title?: string | null;
  content_json?: Record<string, unknown> | null;
  created_at?: string | null;
};

/** Extract ECG case number from title or content_json.source (e.g. Hampton "ECG 42"). */
export function parseEcgCaseNumber(
  title?: string | null,
  contentJson?: Record<string, unknown> | null
): number | null {
  const source = contentJson?.source;
  const haystack = [title, typeof source === "string" ? source : ""]
    .filter(Boolean)
    .join(" ");
  const match = haystack.match(/ECG\s*(\d+)/i);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return Number.isFinite(num) ? num : null;
}

/** Split "ECG N: diagnosis" into number + display subtitle. */
export function getCaseTitleParts(title: string, contentJson?: Record<string, unknown> | null) {
  const ecgNumber = parseEcgCaseNumber(title, contentJson);
  const subtitle = title.replace(/^ECG\s*\d+\s*[:：]\s*/i, "").trim() || title;
  return { ecgNumber, subtitle };
}

/** Hampton 原书病例（非 AI 批量生成草稿）。 */
export function isHamptonBookCase(
  title?: string | null,
  contentJson?: Record<string, unknown> | null
): boolean {
  const source = typeof contentJson?.source === "string" ? contentJson.source : "";
  if (/150\s*ECG\s*Cases|John\s+Hampton/i.test(source)) return true;
  return /^ECG\s*\d+/i.test(title || "");
}

/** 排除 AI 生成的「心电学堂」系列草稿，只保留原书病例。 */
export function filterHamptonBookCases<T extends CaseLike>(cases: T[]): T[] {
  return cases.filter((c) => isHamptonBookCase(c.title, c.content_json));
}

/** Sort cases by ECG number ascending; non-numbered cases fall back to created_at desc. */
export function sortCasesByEcgNumber<T extends CaseLike>(cases: T[]): T[] {
  return [...cases].sort((a, b) => {
    const na = parseEcgCaseNumber(a.title, a.content_json);
    const nb = parseEcgCaseNumber(b.title, b.content_json);
    if (na != null && nb != null) return na - nb;
    if (na != null) return -1;
    if (nb != null) return 1;
    return (b.created_at || "").localeCompare(a.created_at || "");
  });
}
