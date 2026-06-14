// ── Auth Service ────────────────────────────────────────────────────────
import { getSupabase } from "@/lib/supabase";
import storage from "@/lib/storage";
import { isBrowser } from "@/lib/browser";

export type LoginMethod = "email" | "wechat" | "phone";

export interface LoginCredentials {
  email?: string;
  password?: string;
  code?: string;
  phone?: string;
  verifyCode?: string;
}

async function emailLogin(email: string, password: string) {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function wechatLogin(code: string) {
  const res = await fetch("/api/wechat/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "微信登录失败");
  const { data: session } = await getSupabase().auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  return session;
}

export const authService = {
  async login(method: LoginMethod, credentials: LoginCredentials) {
    switch (method) {
      case "email":
        if (!credentials.email || !credentials.password) throw new Error("邮箱和密码不能为空");
        return emailLogin(credentials.email, credentials.password);
      case "wechat":
        if (!credentials.code) throw new Error("微信登录需要授权 code");
        return wechatLogin(credentials.code);
      case "phone":
        throw new Error("手机号登录暂未开放");
      default:
        throw new Error(`不支持的登录方式: ${method}`);
    }
  },

  async register(email: string, password: string, metadata?: Record<string, string>) {
    const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: metadata } });
    if (error) throw error;
    return data;
  },

  async logout() { await getSupabase().auth.signOut(); },
  async getUser() {
    const { data } = await getSupabase().auth.getUser();
    return data.user ?? null;
  },

  _getToken(): Record<string, unknown> | null {
    if (!isBrowser()) return null;
    return storage.getJSON<Record<string, unknown>>("sb-kqoigeigwucvlpzbvboy-auth-token");
  },

  isLoggedIn(): boolean {
    const parsed = this._getToken();
    if (!parsed) return false;
    return !!(parsed as Record<string, unknown>)?.access_token;
  },

  isAdmin(): boolean {
    const parsed = this._getToken();
    if (!parsed) return false;
    const email = ((parsed as Record<string, Record<string, string>>)?.user?.email) || "";
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "843002655@qq.com";
    return email === adminEmail;
  },

  onAuthChange(callback: (user: { email?: string } | null) => void) {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return data.subscription;
  },
};
