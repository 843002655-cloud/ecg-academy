import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.xindianxuetang.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "心电学堂 — AI心电图判读教学平台",
    template: "%s | 心电学堂",
  },
  description:
    "面向全体临床医生的AI心电图判读教学平台。AI导师像高年资医生一样，一句一句追问，带你学会读每一份心电图。覆盖基础心电图、心律失常、EP电生理三级内容体系。",
  keywords: ["心电图", "心电图教学", "AI教学", "心电判读", "心律失常", "心梗", "ST段", "房颤", "室速", "电生理", "规培"],
  openGraph: {
    type: "website",
    siteName: "心电学堂",
    title: "心电学堂 — AI心电图判读教学平台",
    description: "AI导师像高年资医生一样，一句一句追问，带你学会读每一份心电图",
    images: [{ url: `${siteUrl}/icon.png`, width: 1200, height: 630 }],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#1B4F8A] focus:text-white focus:rounded-lg">
          跳到主要内容
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
