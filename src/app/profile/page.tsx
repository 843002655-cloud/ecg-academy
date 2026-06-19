"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { progressService, authService } from "@/lib/services";
import { SkeletonBox } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import type { ProgressItem } from "@/lib/services";
import { ROUTES } from "@/lib/routes";
import { usePageTitle } from "@/lib/hooks/usePageTitle";

const badges = [
  { name: "初识心电图", icon: "🫀", desc: "完成首个病例", unlocked: false },
  { name: "ST 段猎人", icon: "📈", desc: "完成 5 个心肌缺血病例", unlocked: false },
  { name: "心律失常侦探", icon: "⚡", desc: "完成 5 个心律失常病例", unlocked: false },
  { name: "AI 学伴", icon: "🧠", desc: "累计 50 次 AI 对话", unlocked: false },
  { name: "勤奋学习者", icon: "📚", desc: "完成 20 个病例", unlocked: false },
  { name: "判读达人", icon: "🏆", desc: "完成率 80%+", unlocked: false },
];

export default function ProfilePage() {
  usePageTitle("个人中心");
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [quota, setQuota] = useState<{ used: number; remaining: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getUser().then((u) => {
      setUser(u as { email?: string; user_metadata?: Record<string, string> } | null);
    });
    Promise.all([
      progressService.getUserProgress(),
      progressService.getQuota().catch(() => null),
    ]).then(([d, q]) => {
      if (d) {
        setProgress(d.progress);
        setTotalCases(d.totalCases);
      }
      if (q) setQuota(q);
    }).finally(() => setLoading(false));
  }, []);

  const stats = progressService.getStats(progress, totalCases);

  // Compute badge unlocks
  const uniqueCompleted = new Set(progress.map((p) => p.case_id));
  badges[0].unlocked = uniqueCompleted.size >= 1;
  badges[1].unlocked = progress.filter((p) => p.cases?.category === "心肌缺血").length >= 5;
  badges[2].unlocked = progress.filter((p) => p.cases?.category === "心律失常").length >= 5;
  badges[3].unlocked = progress.length >= 50;
  badges[4].unlocked = uniqueCompleted.size >= 20;
  badges[5].unlocked = stats.completionRate >= 80;

  if (loading)
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="card mb-6 flex items-center gap-4">
            <SkeletonBox className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <SkeletonBox className="h-6 w-40 mb-2" />
              <SkeletonBox className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card text-center">
                <SkeletonBox className="h-8 w-8 mx-auto mb-2 rounded" />
                <SkeletonBox className="h-7 w-12 mx-auto mb-1" />
                <SkeletonBox className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
          <SkeletonBox className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card text-center p-4">
                <SkeletonBox className="h-6 w-6 mx-auto mb-1 rounded" />
                <SkeletonBox className="h-4 w-16 mx-auto mb-1" />
                <SkeletonBox className="h-3 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* User header */}
        <div className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2D8C6A] to-[#0F6E56] flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 font-serif">
              {user?.email || "医生用户"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5F0] dark:bg-slate-700 text-[#2D8C6A] dark:text-emerald-400">
                🩺 心电图学习者
              </span>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F8FC] dark:bg-slate-800 text-[#6B7F96] dark:text-slate-400">
            🩺 心电学堂
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { v: stats.completedCount, l: "已完成病例", c: "text-[#2D8C6A] dark:text-emerald-400", icon: "📚" },
            { v: stats.totalCases, l: "总病例数", c: "text-[#4C3D9E] dark:text-purple-400", icon: "📋" },
            { v: stats.todayCount, l: "今日学习", c: "text-[#0F6E56] dark:text-emerald-400", icon: "💬" },
            { v: `${stats.completionRate}%`, l: "完成率", c: "text-[#854F0B] dark:text-amber-400", icon: "📊" },
          ].map((s, i) => (
            <div key={i} className="card text-center">
              <span className="text-2xl">{s.icon}</span>
              <div className={`text-2xl font-bold mt-1 ${s.c}`}>{s.v}</div>
              <div className="text-xs text-[#6B7F96] dark:text-slate-400 mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Quota */}
        {quota && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#1A2332] dark:text-slate-100">
                🤖 AI 对话配额
              </span>
              <span className="text-xs text-[#8FA0B4] dark:text-slate-500">
                每日 {quota.total} 次
              </span>
            </div>
            <div className="h-2.5 bg-[#E8ECF0] dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2D8C6A] to-[#0F6E56] rounded-full transition-all"
                style={{ width: `${Math.min((quota.used / quota.total) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-[#8FA0B4] dark:text-slate-500">
              <span>已用 {quota.used} 次</span>
              <span>
                剩余{" "}
                <span className="text-[#0F6E56] dark:text-emerald-400 font-medium">
                  {quota.remaining}
                </span>{" "}
                次
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
          🏅 学习徽章
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`card text-center p-4 ${!b.unlocked && "opacity-40"}`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-xs font-medium text-[#1A2332] dark:text-slate-100">
                {b.name}
              </div>
              <div className="text-xs text-[#8FA0B4] dark:text-slate-500 mt-0.5">
                {b.unlocked ? "已解锁" : b.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
          📖 最近学习
        </h2>
        {progress.length === 0 ? (
          <EmptyState
            icon="🫀"
            title="还没有学习记录"
            description="开始你的心电图判读学习之旅吧"
            actionHref={ROUTES.CASES}
            actionLabel="去病例库学习"
          />
        ) : (
          <div className="space-y-3">
            {progress.slice(0, 10).map((p, i) => (
              <div
                key={i}
                className="card flex items-center justify-between py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#8FA0B4] dark:text-slate-500 min-w-[80px]">
                    {p.cases?.category || "—"}
                  </span>
                  <Link
                    href={ROUTES.CASE_DETAIL(p.case_id)}
                    className="text-[#1A2332] dark:text-slate-100 hover:text-[#2D8C6A] dark:hover:text-emerald-300 transition-colors"
                  >
                    {p.cases?.title || "未知病例"}
                  </Link>
                </div>
                <span className="text-xs text-[#8FA0B4] dark:text-slate-500 shrink-0 ml-4">
                  {new Date(p.completed_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
