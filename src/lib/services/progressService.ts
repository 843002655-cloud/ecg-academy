// ── Progress Service ────────────────────────────────────────────────────
import { ROUTES } from "@/lib/routes";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data as T;
}

export interface ProgressItem {
  case_id: string;
  completed_at: string;
  cases: { title: string; category: string } | null;
}

export const progressService = {
  async getQuota() {
    const data = await request<{ used: number; remaining: number; total: number }>("/api/quota");
    return data;
  },
  async getUserProgress() {
    const data = await request<{ progress: ProgressItem[]; totalCases: number }>(ROUTES.API_PROGRESS);
    return data;
  },
  isCompleted(progress: ProgressItem[], caseId: string): boolean {
    return progress.some((p) => p.case_id === caseId);
  },
  getTodayUsage(progress: ProgressItem[]): number {
    const today = new Date().toISOString().split("T")[0];
    return progress.filter((p) => p.completed_at?.startsWith(today)).length;
  },
  getStats(progress: ProgressItem[], totalCases: number) {
    const uniqueCases = new Set(progress.map((p) => p.case_id));
    return {
      completedCount: uniqueCases.size,
      totalCases,
      todayCount: this.getTodayUsage(progress),
      completionRate: totalCases > 0 ? Math.round((uniqueCases.size / totalCases) * 100) : 0,
    };
  },
};
