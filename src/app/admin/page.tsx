import { supabaseAdmin } from "@/lib/supabase-server";
import { getAdminFromCookie } from "@/lib/admin-session";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  // Check if logged in as admin
  let analytics: Record<string, unknown> | null = null;
  try {
    const adminEmail = await getAdminFromCookie();

    if (adminEmail) {
      // Load analytics directly
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const { count: pv } = await supabaseAdmin.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "page_view").gte("created_at", since.toISOString());
      const { data: ips } = await supabaseAdmin.from("analytics_events").select("ip_address").eq("event_type", "page_view").gte("created_at", since.toISOString());
      const uniqueIps = new Set((ips || []).map((r: { ip_address: string }) => r.ip_address));
      const { data: allPages } = await supabaseAdmin.from("analytics_events").select("path").eq("event_type", "page_view").gte("created_at", since.toISOString());
      const pc: Record<string, number> = {};
      for (const p of allPages || []) pc[p.path] = (pc[p.path] || 0) + 1;
      const { data: daily } = await supabaseAdmin.from("analytics_events").select("created_at").eq("event_type", "page_view").gte("created_at", since.toISOString());
      const dc: Record<string, number> = {};
      for (const d of daily || []) { const day = d.created_at.split("T")[0]; dc[day] = (dc[day] || 0) + 1; }
      const { count: regs } = await supabaseAdmin.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_type", "register").gte("created_at", since.toISOString());
      const { data: usage } = await supabaseAdmin.from("usage_logs").select("chat_count").gte("date", since.toISOString().split("T")[0]);
      const chats = (usage || []).reduce((s: number, r: { chat_count: number }) => s + (r.chat_count || 0), 0);

      analytics = {
        pv: pv || 0, uv: uniqueIps.size, registrations: regs || 0, totalChats: chats,
        pages: Object.entries(pc).sort((a, b) => b[1] - a[1]).slice(0, 10),
        dailyTrend: Object.entries(dc).sort(),
      };
    }
  } catch {}

  // Dashboard
  if (analytics) {
    const trend = (analytics.dailyTrend || []) as [string, number][];
    const pages = (analytics.pages || []) as [string, number][];
    const maxT = Math.max(...trend.map((d: [string, number]) => d[1]), 1);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-[#1A2332] dark:text-slate-100 font-serif mb-8">📊 数据统计</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "👁️", label: "页面浏览 (PV)", value: String(analytics.pv || 0) },
            { icon: "👤", label: "独立访客 (UV)", value: String(analytics.uv || 0) },
            { icon: "🤖", label: "AI 对话次数", value: String(analytics.totalChats || 0) },
            { icon: "📝", label: "注册数", value: String(analytics.registrations || 0) },
          ].map((kpi) => (
            <div key={kpi.label} className="card text-center">
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-2xl font-bold text-[#2D8C6A] dark:text-emerald-400">{kpi.value}</div>
              <div className="text-xs text-[#6B7F96] dark:text-slate-400 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-[#1A2332] dark:text-slate-100 mb-4">📈 每日访问趋势</h3>
          <div className="flex items-end gap-1 h-32">
            {trend.length === 0 && <p className="text-sm text-[#6B7F96] dark:text-slate-400 w-full text-center self-center">暂无数据</p>}
            {trend.map(([day, count]: [string, number]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 min-w-[28px]">
                <span className="text-[10px] text-[#6B7F96] dark:text-slate-400">{count}</span>
                <div className="w-full bg-[#2D8C6A] dark:bg-emerald-600 rounded-t" style={{ height: `${Math.max((count / maxT) * 100, 4)}%`, minHeight: "4px" }} />
                <span className="text-[10px] text-[#8FA0B4] dark:text-slate-500">{day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-[#1A2332] dark:text-slate-100 mb-4">🔗 热门页面</h3>
          {pages.length === 0 ? <p className="text-sm text-[#6B7F96] dark:text-slate-400">暂无数据</p> : pages.map(([p, c]) => (
            <div key={p} className="flex justify-between text-sm py-1.5 px-2">{p || "/"}<span className="text-[#2D8C6A] dark:text-emerald-400 font-medium">{c}</span></div>
          ))}
        </div>
      </div>
    );
  }

  // Login form
  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="card">
        <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 text-center mb-1 font-serif">🔐 管理员登录</h1>
        <p className="text-sm text-[#6B7F96] dark:text-slate-400 text-center mb-6">登录后查看网站数据统计</p>
        {params.error && <div className="text-sm p-3 rounded-lg mb-4 bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300">{params.error === "wrong" ? "账号或密码错误" : params.error === "not_admin" ? "非管理员账号" : "登录失败"}</div>}
        <form action="/api/admin-login" method="POST" className="space-y-4">
          <input type="email" name="email" placeholder="管理员邮箱" required className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100" />
          <input type="password" name="password" placeholder="密码" required className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm text-[#1A2332] dark:text-slate-100" />
          <button type="submit" className="w-full bg-[#2D8C6A] dark:bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-[#1A6B4F] dark:hover:bg-emerald-500 transition-colors">登录</button>
        </form>
      </div>
    </div>
  );
}
