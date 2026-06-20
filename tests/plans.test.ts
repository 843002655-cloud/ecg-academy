import { describe, expect, it } from "vitest";
import {
  canAccessQuiz,
  getEffectivePlan,
  isPlanActive,
} from "@/lib/plans";

describe("plans", () => {
  it("free plan cannot access quiz", () => {
    expect(canAccessQuiz("free")).toBe(false);
  });

  it("pro plan can access quiz", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(canAccessQuiz("pro", future)).toBe(true);
  });

  it("expired pro falls back to free", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(getEffectivePlan("pro", past)).toBe("free");
    expect(isPlanActive("pro", past)).toBe(false);
  });

  it("institution can access quiz without expiry", () => {
    expect(canAccessQuiz("institution", null)).toBe(true);
  });
});
