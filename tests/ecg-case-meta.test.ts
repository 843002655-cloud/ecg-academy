import { describe, expect, it } from "vitest";
import { filterHamptonBookCases, getCaseTitleParts, isHamptonBookCase, parseEcgCaseNumber, sortCasesByEcgNumber } from "@/lib/ecg-case-meta";

describe("parseEcgCaseNumber", () => {
  it("parses from title", () => {
    expect(parseEcgCaseNumber("ECG 42: 宽QRS心动过速")).toBe(42);
  });

  it("parses from source when title has no number", () => {
    expect(parseEcgCaseNumber("正常窦性心律", { source: "150 ECG Cases, ECG 7" })).toBe(7);
  });

  it("returns null when no number", () => {
    expect(parseEcgCaseNumber("正常窦性心律识别")).toBeNull();
  });
});

describe("getCaseTitleParts", () => {
  it("strips ECG prefix for subtitle", () => {
    expect(getCaseTitleParts("ECG 103: 宽QRS心动过速，考虑室性心动过速")).toEqual({
      ecgNumber: 103,
      subtitle: "宽QRS心动过速，考虑室性心动过速",
    });
  });
});

describe("isHamptonBookCase", () => {
  it("recognizes Hampton book cases", () => {
    expect(isHamptonBookCase("ECG 42: test", { source: "150 ECG Cases 5th Ed., John Hampton, ECG 42" })).toBe(true);
  });

  it("rejects AI generated drafts", () => {
    expect(isHamptonBookCase("正常窦性心律识别", { source: "心电学堂基础心电图系列 · 正常心电图入门" })).toBe(false);
  });
});

describe("filterHamptonBookCases", () => {
  it("keeps only book cases", () => {
    const filtered = filterHamptonBookCases([
      { title: "ECG 1: a" },
      { title: "正常窦性心律识别", content_json: { source: "心电学堂基础心电图系列" } },
    ]);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("ECG 1: a");
  });
});

describe("sortCasesByEcgNumber", () => {
  it("sorts numerically not lexicographically", () => {
    const sorted = sortCasesByEcgNumber([
      { title: "ECG 100: a", created_at: "2026-01-03" },
      { title: "ECG 2: b", created_at: "2026-01-02" },
      { title: "ECG 10: c", created_at: "2026-01-01" },
    ]);
    expect(sorted.map((c) => c.title)).toEqual(["ECG 2: b", "ECG 10: c", "ECG 100: a"]);
  });
});
