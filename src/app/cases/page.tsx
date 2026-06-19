"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { caseService } from "@/lib/services";
import { SkeletonPage } from "@/components/Skeleton";
import CaseCardThumb from "@/components/CaseCardThumb";
import EmptyState from "@/components/EmptyState";
import { ROUTES } from "@/lib/routes";
import { catColors, diffColors, CATEGORIES, DIFFICULTIES } from "@/lib/constants";
import { usePageTitle } from "@/lib/hooks/usePageTitle";

interface Case {
  id: string; title: string; category: string; difficulty: string;
  description: string; ecg_findings: string[]; question: string;
  hint: string; key_points: string[]; is_published: boolean;
  content_json?: Record<string, unknown>;
}


function keywordMatch(c: Case, kw: string): boolean {
  if (!kw) return true;
  const lower = kw.toLowerCase();
  const haystack = [
    c.title, c.description, c.question, c.hint,
    ...(c.ecg_findings || []), ...(c.key_points || []),
  ].join(" ").toLowerCase();
  return haystack.includes(lower);
}

const FilterBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors border whitespace-nowrap shrink-0 ${active ? "bg-[#2D8C6A] dark:bg-emerald-600 text-white border-[#2D8C6A] dark:border-emerald-600" : "bg-white dark:bg-slate-800 text-[#4B6080] dark:text-slate-300 border-[#C5D3E0] dark:border-slate-600 hover:border-[#2D8C6A] dark:hover:border-emerald-400 hover:text-[#2D8C6A] dark:hover:text-emerald-300"}`}>{active && "✓ "}{children}</button>
);

function CaseList() {
  const searchParams = useSearchParams(); const router = useRouter();
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [learnerCounts, setLearnerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(searchParams?.get("category") ?? "");
  const [difficulty, setDifficulty] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tier, setTier] = useState(searchParams?.get("tier") ?? "");

  useEffect(() => {
    caseService.getCases({ product: "ecg-academy", tier: tier ? parseInt(tier) : undefined }).then(({ cases, learnerCounts: lc }) => {
      setAllCases(cases);
      setLearnerCounts(lc);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tier]);

  const totalCount = allCases.length;
  const catCounts: Record<string, number> = {};
  for (const c of allCases) {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  }
  const getCatCount = (catValue: string) => {
    if (!catValue) return totalCount;
    return catCounts[catValue] || 0;
  };

  const filtered = allCases.filter((c) => {
    if (category && c.category !== category) return false;
    if (difficulty && c.difficulty !== difficulty) return false;
    if (!keywordMatch(c, keyword)) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">病例库</h1>
        <p className="text-[#6B7F96] dark:text-slate-400 mb-3">从正常心电图到复杂心律失常，AI 导师逐导联带你判读</p>
        <p className="text-xs text-[#8FA0B4] dark:text-slate-500 mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>📈 {totalCount} 精选病例</span><span className="text-[#C5D3E0] dark:text-slate-600">|</span>
          <span>🎯 覆盖 9 大分类</span><span className="text-[#C5D3E0] dark:text-slate-600">|</span>
          <span>🤖 AI 苏格拉底式教学</span>
        </p>

        {/* Filters */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="relative max-w-sm">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索病例标题、关键词..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100 placeholder-[#8FA0B4] dark:placeholder-slate-500 focus:outline-none focus:border-[#2D8C6A] dark:focus:border-emerald-400 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8FA0B4]">🔍</span>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
            {CATEGORIES.map((c) => (
              <FilterBtn key={c.value} active={category === c.value} onClick={() => setCategory(c.value)}>
                {c.label} ({getCatCount(c.value)})
              </FilterBtn>
            ))}
            <div className="w-px bg-[#E8ECF0] dark:bg-slate-700 mx-1 h-6 shrink-0 self-center hidden sm:block" />
            {DIFFICULTIES.map((d) => (
              <FilterBtn key={d.value} active={difficulty === d.value} onClick={() => setDifficulty(d.value)}>
                {d.label}
              </FilterBtn>
            ))}
            <div className="w-px bg-[#E8ECF0] dark:bg-slate-700 mx-1 h-6 shrink-0 self-center hidden sm:block" />
            {[{ value: "", label: "全部阶段" }, { value: "1", label: "基础入门" }, { value: "2", label: "临床判读" }, { value: "3", label: "精进提升" }].map((t) => (
              <FilterBtn key={t.value} active={tier === t.value} onClick={() => setTier(t.value)}>
                {t.label}
              </FilterBtn>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonPage variant="case" count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title={keyword ? "未找到匹配的病例" : "暂无病例"} description={keyword ? "换个关键词试试？" : "病例库还没有内容，请稍后再来"} actionHref={keyword ? "" : ROUTES.CASES} actionLabel={keyword ? "" : "刷新页面"} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id} role="link" tabIndex={0}
                onClick={() => router.push(ROUTES.CASE_DETAIL(c.id))}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.click(); }}
                className="card group flex flex-col cursor-pointer"
              >
                <CaseCardThumb category={c.category} />

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColors[c.category] || catColors.SVT}`}>{c.category}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColors[c.difficulty] || ""}`}>{c.difficulty}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif group-hover:text-[#2D8C6A] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-2" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {c.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {c.key_points?.slice(0, 2).map((kp, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-[#F5F8FC] dark:bg-slate-800 text-[#6B7F96] dark:text-slate-400">{kp}</span>
                    ))}
                  </div>

                  <div className="flex items-center text-xs text-[#8FA0B4] dark:text-slate-500 mb-4">
                    <span>👥 {learnerCounts[c.id] || 0} 人已学习</span>
                  </div>
                </div>

                <span className="block w-full text-center py-2.5 rounded-[10px] text-white text-sm font-medium bg-[#2D8C6A] dark:bg-emerald-600 group-hover:bg-[#1A6B4F] dark:group-hover:bg-emerald-500 transition-all duration-200">
                  AI 导师带你分析 →
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function CasesPage() {
  usePageTitle("病例库");
  return <Suspense fallback={<SkeletonPage variant="case" count={6} />}><CaseList /></Suspense>;
}
