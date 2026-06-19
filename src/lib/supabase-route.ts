import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

/** Route Handler 用 Supabase 客户端，登录时通过 setAll 写入 session cookie */
export function createSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

/** Server Component 用 Supabase 客户端 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component 中无法写 cookie，忽略
          }
        },
      },
    }
  );
}

export function getAdminEmails(): string[] {
  const emails = ["843002655@qq.com"];
  if (process.env.NEXT_PUBLIC_ADMIN_EMAIL) emails.push(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
  if (process.env.ADMIN_EMAIL) emails.push(process.env.ADMIN_EMAIL);
  return Array.from(new Set(emails));
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email);
}

/** Nginx 反代后 request.url / Host 可能是 localhost:3001，始终优先用 SITE_URL */
export function getRequestOrigin(_request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv;
  return "https://www.xindianxuetang.com";
}

export function appRedirect(request: NextRequest, path: string): URL {
  return new URL(path, getRequestOrigin(request));
}
