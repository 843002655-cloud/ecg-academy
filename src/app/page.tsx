"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import Typewriter from "@/components/Typewriter";
import CaseCardThumb from "@/components/CaseCardThumb";
import EcgCaseBadge from "@/components/EcgCaseBadge";
import EcgBackground from "@/components/EcgBackground";
import { getCaseTitleParts } from "@/lib/ecg-case-meta";
import { ROUTES } from "@/lib/routes";
import { caseService } from "@/lib/services";
import { usePageTitle } from "@/lib/hooks/usePageTitle";

const aiDemoLines = [
  "AI：这是一份 58 岁男性胸痛 2 小时的心电图，你先注意到了什么？",
  "医生：V1-V4 导联 ST 段抬高",
  "AI：对。再看 II、III、aVF 导联呢？",
  "医生：III 导联也有抬高，II 和 aVF 不明显",
  "AI：很好。V1-V4 + III 抬高，提示什么血管？再想想。",
];

const features = [
  { icon: "🧠", title: "AI 苏格拉底式教学", desc: "不会直接给答案，而是通过层层追问引导你推导诊断结论——就像高年资医生带教查房。" },
  { icon: "📈", title: "真实心电图判读", desc: "覆盖正常心电图、心梗、心律失常、电解质异常等全部判读场景，AI 逐图讲解。" },
  { icon: "🏆", title: "模块化进阶体系", desc: "基础免费学 → 临床判读进阶 → EP 电生理精进，按你的水平精准匹配。" },
  { icon: "📱", title: "Web + 小程序", desc: "电脑端深度学习、手机端碎片刷题，AI 导师随时在线陪练。" },
];

const tiers = [
  {
    level: "Tier 1", title: "基础入门", tag: "完全免费",
    tagBg: "bg-[#E8F4F0] dark:bg-emerald-900/30", tagText: "text-[#0F6E56] dark:text-emerald-400",
    icon: "📈", color: "border-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
    modules: ["正常心电图与变异", "心率与节律判断", "间期测量与电轴", "P-QRS-T 波形基础"],
    audience: "面向：医学生 · 规培生 · 全科医生 · 护士", price: "¥0",
  },
  {
    level: "Tier 2", title: "临床判读", tag: "付费进阶",
    tagBg: "bg-[#FEF3E2] dark:bg-amber-900/30", tagText: "text-[#854F0B] dark:text-amber-400",
    icon: "💎", color: "border-amber-500",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40",
    modules: ["心肌缺血与梗死定位", "心律失常鉴别诊断", "电解质与药物影响", "束支阻滞与心腔肥大", "急诊心电图陷阱"],
    audience: "面向：心内科医生 · 急诊科医生 · ICU 医生", price: "¥129/年", highlight: true,
  },
  {
    level: "Tier 3", title: "精进提升", tag: "专家内容",
    tagBg: "bg-[#E8F5F0] dark:bg-emerald-900/30", tagText: "text-[#2D8C6A] dark:text-emerald-400",
    icon: "⚡", color: "border-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/40",
    modules: ["起搏器心电图", "罕见 ECG 表现", "复杂宽 QRS 鉴别", "EP 电生理入门"],
    audience: "面向：EP 专科医生 · 电生理进修生 · 资深心内科医生", price: "¥199/年",
  },
];

const diffBadge: Record<string, string> = {
  "基础": "bg-[#E8F4F0] text-[#0F6E56]",
  "进阶": "bg-[#FEF3E2] text-[#854F0B]",
  "高级": "bg-[#FDE8E8] text-[#9B2C2C]",
};

export default function Home() {
  usePageTitle("首页");
  const [featuredCases, setFeaturedCases] = useState<{ id: string; title: string; category: string; difficulty: string; description: string; tier?: number }[]>([]);
  const [tierCounts, setTierCounts] = useState<Record<number, number>>({});
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    caseService.getCases({ product: "ecg-academy" }).then(({ cases }) => {
      setFeaturedCases(cases.slice(0, 3) as typeof featuredCases);
      setTotalCount(cases.length);
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      for (const c of cases) {
        const tier = (c as { tier?: number }).tier || 2;
        counts[tier] = (counts[tier] || 0) + 1;
      }
      setTierCounts(counts);
    }).catch(() => {});
  }, []);

  return (
    <AppLayout>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-[#E8ECF0] dark:border-slate-700">
        <EcgBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F5F0] dark:bg-emerald-900/30 text-[#2D8C6A] dark:text-emerald-400 tracking-wide">
                  AI + 心电图教学
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A2332] dark:text-slate-100 mb-3 leading-tight font-serif">
                <span className="text-[#2D8C6A] dark:text-emerald-400">心电</span>学堂
              </h1>
              <p className="text-xl sm:text-2xl text-[#6B7F96] dark:text-slate-400 mb-2 font-serif">
                AI 心电图判读教学平台
              </p>
              <p className="text-lg text-[#6B7F96] dark:text-slate-400 mb-8 leading-relaxed">
                不是题库，不是背书——AI 导师像高年资医生一样，一句一句追问，带你学会读每一份心电图
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link href={ROUTES.AUTH_REGISTER} className="bg-[#2D8C6A] dark:bg-emerald-600 hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 text-white font-medium py-3 px-8 rounded-lg transition-colors text-center">
                  免费开始学习
                </Link>
                <Link href={ROUTES.CASES} className="border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300 hover:border-[#2D8C6A] dark:hover:border-emerald-400 font-medium py-3 px-8 rounded-lg transition-colors text-center">
                  浏览病例库
                </Link>
              </div>
              <p className="text-sm text-[#8FA0B4] dark:text-slate-500 flex items-center gap-2 flex-wrap">
                <span>🏥 面向全体临床医生</span>
                <span className="text-[#C5D3E0] dark:text-slate-600 hidden sm:inline">·</span>
                <span className="hidden sm:inline">📋 {totalCount || ""} 教学病例</span>
                <span className="text-[#C5D3E0] dark:text-slate-600 hidden sm:inline">·</span>
                <span className="hidden sm:inline">🆓 基础心电图永久免费</span>
              </p>
            </div>
            <div className="bg-[#F5F8FC] dark:bg-slate-800 border border-[#DDE5EE] dark:border-slate-700 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8ECF0] dark:border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-[#8FA0B4] dark:text-slate-500 ml-3">心电学堂 AI · 心电图判读模式</span>
              </div>
              <Typewriter texts={aiDemoLines} speed={35} pause={1800} className="text-sm leading-relaxed text-[#3D5166] dark:text-slate-300 font-mono min-h-[180px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Three-Tier Learning System ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-[#1A2332] dark:text-slate-100 mb-4 font-serif">模块化学习体系</h2>
        <p className="text-center text-[#6B7F96] dark:text-slate-400 mb-12 max-w-xl mx-auto">
          从 ECG 入门到电生理专家，病例数持续更新
        </p>
        <div className="grid lg:grid-cols-3 gap-6">
          {tiers.map((tier, idx) => {
            const tierNum = idx + 1;
            const count = tierCounts[tierNum] || 0;
            return (
            <Link
              key={tier.title}
              href={`${ROUTES.CASES}?tier=${tierNum}`}
              className={`relative rounded-2xl border-2 ${tier.color} ${tier.bg} p-6 flex flex-col cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-xl ${tier.highlight ? "shadow-lg shadow-amber-100 dark:shadow-amber-900/20 hover:shadow-2xl hover:shadow-amber-200 dark:hover:shadow-amber-900/40" : ""}`}
            >
              {tier.highlight && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">🔥 最受欢迎</div>}
              <div className="text-3xl mb-3">{tier.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 font-serif">{tier.title}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.tagBg} ${tier.tagText}`}>{tier.tag}</span>
              </div>
              <ul className="text-sm text-[#3D5166] dark:text-slate-300 mb-3 space-y-1.5">
                {tier.modules.map((m, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-[#0F6E56] dark:text-emerald-400 text-xs">✓</span>
                    {m}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#8FA0B4] dark:text-slate-500 mb-4">{tier.audience}</p>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-bold text-[#1A2332] dark:text-slate-100">{count} 例 · 持续更新</span>
                <span className="text-lg font-extrabold text-[#2D8C6A] dark:text-emerald-400">{tier.price}</span>
              </div>
            </Link>
          )})}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="bg-white dark:bg-slate-900 border-y border-[#E8ECF0] dark:border-slate-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#1A2332] dark:text-slate-100 mb-4 font-serif">为什么选择心电学堂</h2>
          <p className="text-center text-[#6B7F96] dark:text-slate-400 mb-12 max-w-xl mx-auto">
            不是又一个题库 App——而是一个会提问、会引导的 AI 心电图老师
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card group text-center sm:text-left">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 group-hover:text-[#2D8C6A] dark:group-hover:text-emerald-400 transition-colors font-serif">{f.title}</h3>
                <p className="text-sm text-[#6B7F96] dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Quiz CTA ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#E8F5F0] to-[#EDE9FE] dark:from-emerald-950/30 dark:to-purple-950/30 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 border border-[#C5D3E0] dark:border-slate-700">
          <div className="text-5xl shrink-0">📝</div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">测测你的心电图判读水平</h3>
            <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-4">5 分钟快速测验 · 覆盖正常 ECG、心梗、心律失常、电解质异常、起搏器 · 即时评分解析</p>
          </div>
          <Link href={ROUTES.QUIZ} className="shrink-0 px-6 py-3 bg-[#2D8C6A] dark:bg-emerald-600 text-white font-medium rounded-lg hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 transition-colors text-center whitespace-nowrap">
            开始测验 →
          </Link>
        </div>
      </section>

      {/* ═══ Featured Cases ═══ */}
      {featuredCases.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">精选病例预览</h2>
                <p className="text-[#6B7F96] dark:text-slate-400">AI 导师带你逐帧解析经典心电图</p>
              </div>
              <Link href={ROUTES.CASES} className="text-[#2D8C6A] dark:text-emerald-400 hover:text-[#1A6B4F] dark:hover:text-emerald-300 text-sm font-medium hidden sm:block">查看全部 →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCases.map((c) => {
                const { ecgNumber, subtitle } = getCaseTitleParts(c.title, (c as { content_json?: Record<string, unknown> }).content_json);
                return (
                <Link key={c.id || c.title} href={ROUTES.CASE_DETAIL(c.id || "")} className="card group flex flex-col">
                  <CaseCardThumb category={c.category || "SVT"} ecgNumber={ecgNumber} />
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <EcgCaseBadge number={ecgNumber} />
                    <span className={`badge-category ${diffBadge[c.difficulty] || diffBadge["基础"]}`}>{c.difficulty}</span>
                  </div>
                  <h3 className="font-semibold text-[#1A2332] dark:text-slate-100 mb-2 group-hover:text-[#2D8C6A] dark:group-hover:text-emerald-400 font-serif line-clamp-2">{subtitle}</h3>
                  <p className="text-sm text-[#6B7F96] dark:text-slate-400 line-clamp-2 mb-4 flex-1">{c.description}</p>
                  <span className="text-sm text-[#2D8C6A] dark:text-emerald-400 font-medium group-hover:underline">AI 导师带你分析 →</span>
                </Link>
              );})}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href={ROUTES.CASES} className="text-[#2D8C6A] dark:text-emerald-400 text-sm">查看全部病例 →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ Stats ═══ */}
      <section className="bg-white dark:bg-slate-900 border-y border-[#E8ECF0] dark:border-slate-700 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ num: totalCount || "", label: "教学病例" }, { num: "免费", label: "基础入门" }, { num: "AI 驱动", label: "教学引擎" }, { num: "Web 端", label: "随时学习" }].map((s) => (
              <div key={s.label}><div className="text-3xl font-extrabold text-[#2D8C6A] dark:text-emerald-400 mb-1 font-serif">{s.num}</div><div className="text-sm text-[#6B7F96] dark:text-slate-400">{s.label}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="bg-[#2D8C6A] dark:bg-emerald-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 font-serif">每天 10 分钟，学会判读心电图</h2>
          <p className="text-white/80 mb-8 text-lg">基础内容永久免费。随时随地打开，AI 老师陪练。</p>
          <Link href={ROUTES.AUTH_REGISTER} className="inline-block bg-white dark:bg-slate-100 text-[#2D8C6A] dark:text-emerald-700 hover:bg-gray-100 dark:hover:bg-slate-200 font-bold py-3 px-10 rounded-lg transition-colors text-lg">
            免费开始 →
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
