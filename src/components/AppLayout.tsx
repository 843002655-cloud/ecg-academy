import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import FadeIn from "@/components/FadeIn";
import { ROUTES } from "@/lib/routes";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 md:pb-0">
        <FadeIn>{children}</FadeIn>
      </main>
      <BottomNav />
      <footer className="border-t border-[#E8ECF0] dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <Link href={ROUTES.HOME} className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">📈</span>
            <span className="text-lg font-bold text-[#1A2332] dark:text-slate-100 font-serif">
              <span className="text-[#1B4F8A] dark:text-blue-400">心电</span>学堂
            </span>
          </Link>
          <p className="text-sm text-[#8FA0B4] dark:text-slate-500">
            AI 心电图判读教学平台 · 不是背题库，而是学会思考
          </p>
          <p className="text-xs text-[#8FA0B4] dark:text-slate-500 mt-3">
            © {new Date().getFullYear()} 心电学堂 · 仅供医学教育使用，不构成临床决策建议
          </p>
        </div>
      </footer>
    </>
  );
}
