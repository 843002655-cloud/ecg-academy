export type MembershipPlan = "free" | "pro" | "institution";

export const PLAN_LABELS: Record<MembershipPlan, string> = {
  free: "基础入门",
  pro: "临床判读",
  institution: "机构版",
};

export function isPlanActive(
  plan: MembershipPlan,
  expiresAt: string | null | undefined
): boolean {
  if (plan === "free") return true;
  if (!expiresAt) return plan === "institution" || plan === "pro";
  return new Date(expiresAt).getTime() > Date.now();
}

export function canAccessQuiz(plan: MembershipPlan, expiresAt?: string | null): boolean {
  if (!isPlanActive(plan, expiresAt)) return false;
  return plan === "pro" || plan === "institution";
}

export function getEffectivePlan(
  plan: MembershipPlan | null | undefined,
  expiresAt?: string | null
): MembershipPlan {
  const p = plan || "free";
  return isPlanActive(p, expiresAt) ? p : "free";
}
