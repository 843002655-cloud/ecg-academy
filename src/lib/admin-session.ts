import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/supabase-route";

const COOKIE_NAME = "ecg_admin";

function signAdminEmail(email: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "ecg-admin-fallback";
  return createHmac("sha256", secret).update(email).digest("hex");
}

function makeAdminCookieValue(email: string): string {
  return `${email}|${signAdminEmail(email)}`;
}

export function verifyAdminCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const [email, sig] = value.split("|");
  if (!email || !sig || !isAdminEmail(email)) return null;
  const expected = signAdminEmail(email);
  if (sig.length !== expected.length) return null;
  try {
    if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return email;
  } catch {
    return null;
  }
  return null;
}

export async function getAdminFromCookie(): Promise<string | null> {
  const store = await cookies();
  return verifyAdminCookieValue(store.get(COOKIE_NAME)?.value);
}

export function attachAdminCookie(response: NextResponse, email: string) {
  response.cookies.set(COOKIE_NAME, makeAdminCookieValue(email), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function safeDecodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getAdminEmailFromCookieHeader(cookieHeader: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (name === COOKIE_NAME) {
      return verifyAdminCookieValue(safeDecodeCookieValue(value));
    }
  }
  return null;
}
