import { supabaseAdmin } from "@/lib/supabase-server";
import { getAdminFromCookie } from "@/lib/admin-session";
import AdminDashboard from "./AdminDashboard";

async function loadAnalytics() {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { count: pv } = await supabaseAdmin
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "page_view")
    .gte("created_at", since.toISOString());
  const { data: ips } = await supabaseAdmin
    .from("analytics_events")
    .select("ip_address")
    .eq("event_type", "page_view")
    .gte("created_at", since.toISOString());
  const uniqueIps = new Set((ips || []).map((r: { ip_address: string }) => r.ip_address));
  const { data: allPages } = await supabaseAdmin
    .from("analytics_events")
    .select("path")
    .eq("event_type", "page_view")
    .gte("created_at", since.toISOString());
  const pc: Record<string, number> = {};
  for (const p of allPages || []) pc[p.path] = (pc[p.path] || 0) + 1;
  const { data: daily } = await supabaseAdmin
    .from("analytics_events")
    .select("created_at")
    .eq("event_type", "page_view")
    .gte("created_at", since.toISOString());
  const dc: Record<string, number> = {};
  for (const d of daily || []) {
    const day = d.created_at.split("T")[0];
    dc[day] = (dc[day] || 0) + 1;
  }
  const { count: regs } = await supabaseAdmin
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "register")
    .gte("created_at", since.toISOString());
  const { data: usage } = await supabaseAdmin
    .from("usage_logs")
    .select("chat_count")
    .gte("date", since.toISOString().split("T")[0]);
  const chats = (usage || []).reduce((s: number, r: { chat_count: number }) => s + (r.chat_count || 0), 0);

  return {
    pv: pv || 0,
    uv: uniqueIps.size,
    registrations: regs || 0,
    totalChats: chats,
    pages: Object.entries(pc).sort((a, b) => b[1] - a[1]).slice(0, 10) as [string, number][],
    dailyTrend: Object.entries(dc).sort() as [string, number][],
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  let analytics = null;
  try {
    const adminEmail = await getAdminFromCookie();
    if (adminEmail) analytics = await loadAnalytics();
  } catch {
    /* ignore */
  }

  if (analytics) {
    return <AdminDashboard analytics={analytics} />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24">
      <div className="card">
        <h1 className="text-xl font-bold text-[#1A2332] dark:text-slate-100 text-center mb-1 font-serif">🔐 管理员登录</h1>
        <p className="text-sm text-[#6B7F96] dark:text-slate-400 text-center mb-6">登录后管理病例、题库与会员</p>
        {searchParams.error && (
          <div className="text-sm p-3 rounded-lg mb-4 bg-[#FDE8E8] dark:bg-red-900/30 text-[#9B2C2C] dark:text-red-300">
            {searchParams.error === "wrong" ? "账号或密码错误" : searchParams.error === "not_admin" ? "非管理员账号" : "登录失败"}
          </div>
        )}
        <form action="/api/admin-login" method="POST" className="space-y-4">
          <input type="email" name="email" placeholder="管理员邮箱" required className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm" />
          <input type="password" name="password" placeholder="密码" required className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#C5D3E0] dark:border-slate-600 rounded-lg text-sm" />
          <button type="submit" className="w-full bg-[#2D8C6A] text-white font-medium py-2.5 rounded-lg">登录</button>
        </form>
      </div>
    </div>
  );
}
