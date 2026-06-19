"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[#F5F8FC] dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              出了点问题
            </h1>
            <p className="text-[#6B7F96] dark:text-slate-400 mb-2 max-w-md">
              页面加载时发生了错误。请稍后重试。
            </p>
            {error.digest && (
              <p className="text-xs text-[#8FA0B4] dark:text-slate-500 mb-6 font-mono">
                ID: {error.digest}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-[#2D8C6A] dark:bg-emerald-600 text-white font-medium rounded-lg hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 transition-colors text-sm"
              >
                重试
              </button>
              <Link
                href={ROUTES.HOME}
                className="px-5 py-2.5 border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300 rounded-lg hover:border-[#2D8C6A] dark:hover:border-emerald-400 transition-colors text-sm"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
