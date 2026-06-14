import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.xindianxuetang.com";

  const staticRoutes = [
    { path: "", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/cases", priority: 0.9, changeFreq: "daily" as const },
    { path: "/quiz", priority: 0.8, changeFreq: "weekly" as const },
    { path: "/ai-consult", priority: 0.7, changeFreq: "monthly" as const },
    { path: "/profile", priority: 0.5, changeFreq: "monthly" as const },
    { path: "/upgrade", priority: 0.6, changeFreq: "monthly" as const },
  ];

  return staticRoutes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));
}
