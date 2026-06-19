"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { authService } from "@/lib/services";
import { onDocumentEvent, navigateTo } from "@/lib/browser";
import { ROUTES } from "@/lib/routes";
import ThemeToggle from "@/components/ThemeToggle";

const mainLinks = [
  { href: ROUTES.CASES, label: "病例库", short: "病例" },
  { href: ROUTES.QUIZ, label: "测验", short: "测验" },
  { href: ROUTES.AI_CONSULT, label: "AI 问心", short: "问心" },
];

const dropdownItems = [
  { href: ROUTES.PROFILE, label: "个人中心", icon: "👤" },
  { href: ROUTES.UPGRADE, label: "升级 Pro", icon: "💎" },
];

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authService.getUser().then(setUser);
    const sub = authService.onAuthChange(setUser);
    return () => sub.unsubscribe();
  }, []);
  useEffect(() => {
    const handler = (e: Event) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    return onDocumentEvent("mousedown", handler);
  }, []);

  const handleLogout = async () => { await authService.logout(); navigateTo(ROUTES.HOME); };
  const avatarLetter = user?.email?.[0]?.toUpperCase() || "?";

  return (
    <nav aria-label="主导航" className="border-b border-[#E8ECF0] dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50" style={{ borderBottomWidth: 0.5 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">📈</span>
            <span className="text-lg font-bold text-[#1A2332] dark:text-slate-100 font-serif hidden sm:inline">
              <span className="text-[#2D8C6A] dark:text-emerald-400">心电</span>学堂
            </span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${pathname.startsWith(link.href) ? "bg-[#E8F5F0] dark:bg-slate-700 text-[#2D8C6A] dark:text-emerald-400" : "text-[#6B7F96] dark:text-slate-400 hover:text-[#3D5166] dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"}`}><span className="hidden sm:inline">{link.label}</span><span className="sm:hidden">{link.short}</span></Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-9 h-9 rounded-full bg-[#2D8C6A] dark:bg-emerald-600 flex items-center justify-center text-white text-sm font-bold" title={user.email}>{avatarLetter}</button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-white dark:bg-slate-900 border border-[#DDE5EE] dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#E8ECF0] dark:border-slate-700"><p className="text-xs text-[#6B7F96] dark:text-slate-400 truncate">{user.email}</p></div>
                    {dropdownItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-[#3D5166] dark:text-slate-300 hover:text-[#2D8C6A] dark:hover:text-emerald-300 hover:bg-[#E8F5F0] dark:hover:bg-slate-700"><span>{item.icon}</span><span>{item.label}</span></Link>
                    ))}
                    <div className="border-t border-[#E8ECF0] dark:border-slate-700 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7F96] dark:text-slate-400 hover:text-[#9B2C2C] dark:hover:text-red-400 w-full text-left"><span>🚪</span><span>退出登录</span></button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.AUTH} className="text-xs sm:text-sm py-1.5 px-2.5 sm:px-4 border border-[#C5D3E0] dark:border-slate-600 text-[#4B6080] dark:text-slate-300 rounded-lg hover:border-[#2D8C6A] dark:hover:border-emerald-400">登录</Link>
                <Link href={ROUTES.AUTH_REGISTER} className="text-xs sm:text-sm py-1.5 px-2.5 sm:px-4 rounded-lg text-white font-medium bg-[#2D8C6A] dark:bg-emerald-600">免费注册</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
