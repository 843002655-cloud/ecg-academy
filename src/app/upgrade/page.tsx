"use client";

import AppLayout from "@/components/AppLayout";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const tiers = [
  {
    name: "基础入门",
    price: "免费",
    period: "永久",
    icon: "📈",
    color: "border-emerald-500",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    btn: "bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300 hover:border-[#2D8C6A] dark:hover:border-emerald-400",
    btnText: "当前方案",
    features: [
      { text: "正常心电图与变异", ok: true },
      { text: "心率与节律判断", ok: true },
      { text: "间期测量与电轴基础", ok: true },
      { text: "AI 苏格拉底式教学", ok: true },
      { text: "每日 3 次 AI 对话", ok: true },
      { text: "知识测验", ok: false },
      { text: "心肌缺血与心律失常", ok: false },
      { text: "EP 电生理内容", ok: false },
    ],
  },
  {
    name: "临床判读",
    price: "¥129",
    period: "/年",
    icon: "💎",
    color: "border-amber-500",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    btn: "bg-amber-500 hover:bg-amber-600 text-white font-bold",
    btnText: "升级会员",
    highlight: true,
    features: [
      { text: "基础入门全部内容", ok: true },
      { text: "心肌缺血与梗死定位", ok: true },
      { text: "心律失常鉴别诊断", ok: true },
      { text: "束支阻滞与心腔肥大", ok: true },
      { text: "电解质异常与药物影响", ok: true },
      { text: "每月 300 次 AI 对话", ok: true },
      { text: "知识测验", ok: true },
      { text: "EP 电生理内容", ok: false },
    ],
  },
  {
    name: "精进提升",
    price: "¥199",
    period: "/年",
    icon: "⚡",
    color: "border-blue-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-emerald-950/30 dark:to-indigo-950/30",
    btn: "bg-[#2D8C6A] dark:bg-emerald-600 hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 text-white",
    btnText: "立即订阅",
    features: [
      { text: "临床判读全部内容", ok: true },
      { text: "起搏器心电图", ok: true },
      { text: "罕见 ECG 表现", ok: true },
      { text: "复杂宽 QRS 鉴别", ok: true },
      { text: "EP 电生理入门", ok: true },
      { text: "无限次 AI 对话", ok: true },
      { text: "学习报告导出", ok: true },
      { text: "👉 EP Mentor 联动", ok: true },
    ],
  },
];

const faqs = [
  {
    q: "免费版有什么限制？",
    a: "免费版可访问基础入门模块（正常 ECG、心率节律、间期电轴等），AI 对话每日限 3 次。升级后可解锁心肌缺血、心律失常等临床判读内容。",
  },
  {
    q: "¥129/年是怎么计算的？",
    a: "折合每月不到 ¥11——相当于一杯奶茶。对比传统心电图培训班 ¥500-2000 的价格，我们让优质心电图判读教学触手可及。",
  },
  {
    q: "可以退款吗？",
    a: "购买后 7 天内可申请全额退款，前提是 AI 对话次数使用未超过 50 次。联系 843002655@qq.com 处理。",
  },
  {
    q: "付费后可以在微信小程序上用吗？",
    a: "可以！心电学堂微信小程序（开发中）与 Web 端共享同一账号和会员权益，Web 端付费后小程序同步解锁。",
  },
  {
    q: "有没有机构版？",
    a: "机构版（医学院/规培基地批量采购）¥999/年，支持 20 个成员账号。请联系 843002655@qq.com 获取机构方案。",
  },
];

export default function UpgradePage() {
  usePageTitle("升级会员");

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
            升级会员
          </h1>
          <p className="text-lg text-[#6B7F96] dark:text-slate-400 max-w-xl mx-auto">
            从基础心电图到 EP 电生理，一站式心电图判读进阶之路
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border-2 ${tier.color} ${tier.bg} p-6 flex flex-col ${
                tier.highlight ? "md:-mt-4 md:mb-4 shadow-xl shadow-amber-100 dark:shadow-amber-900/20" : ""
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  🔥 最受欢迎
                </div>
              )}
              <div className="text-3xl mb-3">{tier.icon}</div>
              <h2 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 mb-1 font-serif">
                {tier.name}
              </h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-[#1A2332] dark:text-slate-100">
                  {tier.price}
                </span>
                <span className="text-sm text-[#6B7F96] dark:text-slate-400">
                  {tier.period}
                </span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className={f.ok ? "text-[#0F6E56] dark:text-emerald-400" : "text-[#C5D3E0] dark:text-slate-600"}>
                      {f.ok ? "✅" : "✕"}
                    </span>
                    <span className={f.ok ? "text-[#3D5166] dark:text-slate-300" : "text-[#C5D3E0] dark:text-slate-600 line-through"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => document.getElementById("wechat-pay")?.scrollIntoView({ behavior: "smooth" })}
                className={`w-full py-3 rounded-lg font-medium transition-colors text-center ${tier.btn}`}
              >
                {tier.btnText}
              </button>
            </div>
          ))}
        </div>

        {/* WeChat Pay */}
        <div id="wechat-pay" className="card mb-16 text-center scroll-mt-20">
          <h2 className="text-xl font-semibold text-[#1A2332] dark:text-slate-100 mb-4 font-serif">
            💳 微信支付
          </h2>
          <p className="text-sm text-[#6B7F96] dark:text-slate-400 mb-6">
            扫描下方二维码完成支付，会员权益即时生效
          </p>
          <div className="w-48 h-48 mx-auto mb-4 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 border border-[#E8ECF0] dark:border-slate-700">
            <div className="text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-xs text-[#8FA0B4] dark:text-slate-500">扫码支付</p>
              <p className="text-xs text-[#2D8C6A] dark:text-emerald-400 font-medium mt-1">
                ¥129 / 年
              </p>
            </div>
          </div>
          <div className="max-w-xs mx-auto mb-4">
            <div className="flex items-center gap-2 text-sm text-[#6B7F96] dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span>扫描二维码完成支付</span>
            </div>
            <div className="w-px h-3 bg-[#C5D3E0] dark:bg-slate-600 ml-2.5" />
            <div className="flex items-center gap-2 text-sm text-[#6B7F96] dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span>备注你的注册邮箱</span>
            </div>
            <div className="w-px h-3 bg-[#C5D3E0] dark:bg-slate-600 ml-2.5" />
            <div className="flex items-center gap-2 text-sm text-[#6B7F96] dark:text-slate-400">
              <span className="w-5 h-5 rounded-full bg-[#E8F4F0] dark:bg-emerald-900/30 text-[#0F6E56] dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span>24 小时内会员自动开通</span>
            </div>
          </div>
          <p className="text-xs text-[#8FA0B4] dark:text-slate-500">
            支付问题？联系{" "}
            <a
              href="mailto:843002655@qq.com"
              className="text-[#2D8C6A] dark:text-emerald-400 hover:underline"
            >
              843002655@qq.com
            </a>
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 mb-6 text-center font-serif">
            ❓ 常见问题
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="card group cursor-pointer"
              >
                <summary className="flex items-center justify-between text-sm font-medium text-[#1A2332] dark:text-slate-100 list-none">
                  {faq.q}
                  <span className="text-[#8FA0B4] dark:text-slate-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-2 text-sm text-[#6B7F96] dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href={ROUTES.CASES}
            className="text-[#2D8C6A] dark:text-emerald-400 hover:text-[#1A6B4F] dark:hover:text-emerald-300 text-sm font-medium"
          >
            先看看免费病例 →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
