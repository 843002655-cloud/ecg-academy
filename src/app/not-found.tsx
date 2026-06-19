import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-[#F5F8FC] dark:bg-slate-900">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🫀</div>
            <h1 className="text-3xl font-bold text-[#1A2332] dark:text-slate-100 mb-2 font-serif">
              页面未找到
            </h1>
            <p className="text-[#6B7F96] dark:text-slate-400 mb-8 max-w-md">
              你访问的页面不存在——可能是链接失效或地址输入错误。
            </p>
            <Link
              href={ROUTES.HOME}
              className="inline-block px-6 py-2.5 bg-[#2D8C6A] dark:bg-emerald-600 text-white font-medium rounded-lg hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
