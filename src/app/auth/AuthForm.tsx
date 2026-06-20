"use client";

import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { ROUTES } from "@/lib/routes";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "请填写邮箱和密码",
  register_failed: "登录或注册失败，请检查密码（至少 6 位）后重试",
};

interface AuthFormProps {
  error?: string;
  redirect?: string;
  isRegister?: boolean;
}

export default function AuthForm({ error, redirect = "/", isRegister }: AuthFormProps) {
  const safeRedirect =
    redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="card">
          <div className="text-center mb-6">
            <span className="text-3xl">📈</span>
            <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 mt-2 font-serif">
              {isRegister ? "免费注册" : "登录 / 注册"}
            </h1>
            <p className="text-sm text-[#6B7F96] dark:text-slate-400 mt-2">
              {isRegister
                ? "创建账号，开始 AI 心电图判读学习"
                : "使用邮箱和密码，新用户将自动注册"}
            </p>
          </div>

          {error && (
            <div className="text-sm p-3 rounded-lg mb-4 bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300">
              {ERROR_MESSAGES[error] || "登录失败，请重试"}
            </div>
          )}

          <form action="/api/auth-handler" method="POST" className="space-y-4">
            <input type="hidden" name="redirect" value={safeRedirect} />
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#6B7F96] dark:text-slate-400 mb-1">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#6B7F96] dark:text-slate-400 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="至少 6 位"
                required
                minLength={6}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#2D8C6A] dark:bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 transition-colors"
            >
              {isRegister ? "创建账号" : "登录 / 注册"}
            </button>
          </form>

          <p className="text-xs text-[#8FA0B4] dark:text-slate-500 text-center mt-4 leading-relaxed">
            注册即表示同意{" "}
            <Link href={ROUTES.TERMS} className="text-[#2D8C6A] dark:text-emerald-400 hover:underline">
              服务条款
            </Link>
          </p>

          <div className="text-center mt-4 pt-4 border-t border-[#E8ECF0] dark:border-slate-700">
            {isRegister ? (
              <Link href={ROUTES.AUTH} className="text-sm text-[#2D8C6A] dark:text-emerald-400 hover:underline">
                已有账号？去登录
              </Link>
            ) : (
              <Link href={ROUTES.AUTH_REGISTER} className="text-sm text-[#2D8C6A] dark:text-emerald-400 hover:underline">
                还没有账号？免费注册
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
