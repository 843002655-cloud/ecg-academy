"use client";

import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { caseService, quizService } from "@/lib/services";
import type { QuizQuestion } from "@/lib/quiz-data";

type Tab = "stats" | "cases" | "quiz" | "members";

interface AnalyticsData {
  pv: number;
  uv: number;
  registrations: number;
  totalChats: number;
  pages: [string, number][];
  dailyTrend: [string, number][];
}

interface CaseRow {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  is_published: boolean;
  tier?: number;
}

export default function AdminDashboard({ analytics }: { analytics: AnalyticsData }) {
  const [tab, setTab] = useState<Tab>("stats");
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPlan, setMemberPlan] = useState<"pro" | "institution" | "free">("pro");

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const { cases: list } = await caseService.getCases({ product: "ecg-academy" });
      setCases(list as CaseRow[]);
    } catch {
      setMsg("加载病例失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const qs = await quizService.getQuestions();
      setQuestions(qs || []);
    } catch {
      setMsg("加载题库失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "cases") loadCases();
    if (tab === "quiz") loadQuestions();
  }, [tab, loadCases, loadQuestions]);

  const trend = analytics.dailyTrend || [];
  const pages = analytics.pages || [];
  const maxT = Math.max(...trend.map((d) => d[1]), 1);

  const togglePublish = async (c: CaseRow) => {
    const res = await fetch(ROUTES.API_CASE(c.id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !c.is_published }),
    });
    if (res.ok) {
      setMsg(c.is_published ? "已下架" : "已发布");
      loadCases();
    } else setMsg("操作失败");
  };

  const deleteCase = async (id: string) => {
    if (!confirm("确定删除此病例？")) return;
    const res = await fetch(ROUTES.API_CASE(id), { method: "DELETE" });
    if (res.ok) {
      setMsg("已删除");
      loadCases();
    } else setMsg("删除失败");
  };

  const activateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(ROUTES.API_MEMBERSHIP_ACTIVATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail, plan: memberPlan }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`已为 ${memberEmail} 开通 ${memberPlan}`);
      setMemberEmail("");
    } else setMsg(data.error || "开通失败");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "📊 数据统计" },
    { id: "cases", label: "📋 病例管理" },
    { id: "quiz", label: "📝 题库管理" },
    { id: "members", label: "💎 会员开通" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 font-serif">管理后台</h1>
        <form action="/api/admin-logout" method="POST">
          <button type="submit" className="text-sm text-[#6B7F96] dark:text-slate-400 hover:text-[#9B2C2C]">退出</button>
        </form>
      </div>

      {msg && (
        <div className="text-sm p-3 rounded-lg mb-4 bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-300">
          {msg}
          <button onClick={() => setMsg("")} className="ml-2 opacity-60">×</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-[#2D8C6A] dark:bg-emerald-600 text-white"
                : "bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: "👁️", label: "页面浏览 (PV)", value: String(analytics.pv) },
              { icon: "👤", label: "独立访客 (UV)", value: String(analytics.uv) },
              { icon: "🤖", label: "AI 对话次数", value: String(analytics.totalChats) },
              { icon: "📝", label: "注册数", value: String(analytics.registrations) },
            ].map((kpi) => (
              <div key={kpi.label} className="card text-center">
                <div className="text-2xl mb-1">{kpi.icon}</div>
                <div className="text-2xl font-bold text-[#2D8C6A] dark:text-emerald-400">{kpi.value}</div>
                <div className="text-xs text-[#6B7F96] dark:text-slate-400 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>
          <div className="card mb-6">
            <h3 className="text-sm font-semibold mb-4">📈 每日访问趋势</h3>
            <div className="flex items-end gap-1 h-32">
              {trend.length === 0 && <p className="text-sm text-[#6B7F96] w-full text-center self-center">暂无数据</p>}
              {trend.map(([day, count]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1 min-w-[28px]">
                  <span className="text-[10px] text-[#6B7F96]">{count}</span>
                  <div className="w-full bg-[#2D8C6A] rounded-t" style={{ height: `${Math.max((count / maxT) * 100, 4)}%`, minHeight: "4px" }} />
                  <span className="text-[10px] text-[#8FA0B4]">{day.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold mb-4">🔗 热门页面</h3>
            {pages.map(([p, c]) => (
              <div key={p} className="flex justify-between text-sm py-1.5">{p || "/"}<span className="text-[#2D8C6A] font-medium">{c}</span></div>
            ))}
          </div>
        </>
      )}

      {tab === "cases" && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-4">病例列表 ({cases.length})</h3>
          {loading ? <p className="text-sm text-[#6B7F96]">加载中...</p> : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {cases.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[#E8ECF0] dark:border-slate-700 text-sm">
                  <div className="min-w-0 flex-1">
                    <span className={`text-xs mr-2 ${c.is_published ? "text-emerald-600" : "text-[#8FA0B4]"}`}>
                      {c.is_published ? "已发布" : "草稿"}
                    </span>
                    <span className="font-medium">{c.title}</span>
                    <span className="text-[#8FA0B4] ml-2">{c.category} · {c.difficulty}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => togglePublish(c)} className="text-xs px-2 py-1 rounded border border-[#C5D3E0] dark:border-slate-600">
                      {c.is_published ? "下架" : "发布"}
                    </button>
                    <button onClick={() => deleteCase(c.id)} className="text-xs px-2 py-1 rounded text-red-600 border border-red-200 dark:border-red-800">
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "quiz" && (
        <div className="card">
          <h3 className="text-sm font-semibold mb-4">题库 ({questions.length} 题)</h3>
          {loading ? <p className="text-sm text-[#6B7F96]">加载中...</p> : questions.length === 0 ? (
            <p className="text-sm text-[#6B7F96]">暂无数据库题目，前端使用本地 fallback 题库。请在 Supabase 执行 scripts/supabase-api-tables.sql 后通过 API 添加。</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {questions.map((q) => (
                <div key={q.id} className="py-2 border-b border-[#E8ECF0] dark:border-slate-700 text-sm">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F8FC] dark:bg-slate-800 mr-2">{q.category}</span>
                  {q.question}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "members" && (
        <div className="card max-w-md">
          <h3 className="text-sm font-semibold mb-4">手动开通会员</h3>
          <p className="text-xs text-[#6B7F96] dark:text-slate-400 mb-4">用户扫码支付后，输入注册邮箱开通会员权益。</p>
          <form onSubmit={activateMember} className="space-y-4">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="用户注册邮箱"
              required
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm"
            />
            <select
              value={memberPlan}
              onChange={(e) => setMemberPlan(e.target.value as typeof memberPlan)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm"
            >
              <option value="pro">临床判读 (pro)</option>
              <option value="institution">机构版 (institution)</option>
              <option value="free">恢复免费 (free)</option>
            </select>
            <button type="submit" className="w-full bg-[#2D8C6A] text-white font-medium py-2.5 rounded-lg">开通</button>
          </form>
        </div>
      )}
    </div>
  );
}
