import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { ROUTES } from "@/lib/routes";

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
          服务条款
        </h1>
        <p className="text-sm text-[#8FA0B4] dark:text-slate-500 mb-8">
          最后更新：2026 年 6 月
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-[#3D5166] dark:text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              1. 服务说明
            </h2>
            <p>
              心电学堂（以下简称"本平台"）是一个面向临床医生的 AI 心电图判读教学平台。
              本平台通过 AI 苏格拉底式对话，引导医生学习心电图判读思维，所有内容仅供医学教育参考，
              <strong>不构成临床决策建议</strong>。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              2. 账号注册
            </h2>
            <p>
              用户需提供真实邮箱完成注册。用户对账号下的所有活动负责。
              如发现未经授权使用账号的情况，请立即联系 843002655@qq.com。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              3. AI 对话服务
            </h2>
            <p>
              本平台 AI 对话由 DeepSeek 大模型驱动。AI 生成的判读分析和教学引导基于心电图病例数据，
              可能存在不准确之处。用户应结合自身医学知识独立判断，不应将 AI 输出作为诊断依据。
              免费用户每日限 3 次 AI 对话，付费用户享有更多配额。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              4. 会员与支付
            </h2>
            <p>
              基础心电图内容永久免费。Tier 2（¥129/年）解锁心律失常病例和更多 AI 配额。
              Tier 3（¥199/年）解锁全部 EP 电生理内容和无限 AI 对话。
              购买后 7 天内，AI 使用未超过 50 次可申请全额退款。退款请联系 843002655@qq.com。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              5. 知识产权
            </h2>
            <p>
              本平台的病例内容、AI 教学方法和软件代码均受知识产权保护。
              未经许可，不得复制、分发或用于商业目的。病例心电图图片的原始版权归原作者所有，
              本平台仅用于教学目的。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              6. 隐私保护
            </h2>
            <p>
              我们仅收集邮箱地址用于账号注册和登录。学习进度数据存储于 Supabase 数据库。
              我们不会与第三方分享你的个人信息。完整隐私政策详见下方。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              7. 免责声明
            </h2>
            <p>
              本平台所有内容仅供医学教育参考，不构成临床诊断或治疗建议。
              在实际临床工作中，请结合患者具体情况和最新指南做出判断。
              本平台对因使用平台内容而导致的任何直接或间接损失不承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              8. 联系方式
            </h2>
            <p>
              如有任何问题或建议，请发送邮件至：
              <a href="mailto:843002655@qq.com" className="text-[#2D8C6A] dark:text-emerald-400 hover:underline ml-1">
                843002655@qq.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8ECF0] dark:border-slate-700 text-center">
          <Link
            href={ROUTES.HOME}
            className="text-sm text-[#2D8C6A] dark:text-emerald-400 hover:text-[#1A6B4F] dark:hover:text-emerald-300"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
