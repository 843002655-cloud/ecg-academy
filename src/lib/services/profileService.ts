// ── Profile Service ─────────────────────────────────────────────────────
import { ROUTES } from "@/lib/routes";
import type { MembershipPlan } from "@/lib/plans";

export interface UserProfile {
  email: string | null;
  plan: MembershipPlan;
  planLabel: string;
  planExpiresAt: string | null;
  chatCount: number;
  canAccessQuiz: boolean;
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data as T;
}

export const profileService = {
  async getProfile(): Promise<UserProfile | null> {
    try {
      return await request<UserProfile>(ROUTES.API_PROFILE);
    } catch {
      return null;
    }
  },
};
