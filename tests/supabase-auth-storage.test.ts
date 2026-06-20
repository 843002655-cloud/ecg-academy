import { describe, expect, it } from "vitest";
import { getSupabaseAuthStorageKey } from "@/lib/supabase-auth-storage";

describe("supabase-auth-storage", () => {
  it("derives storage key from supabase URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://kqoigeigwucvlpzbvboy.supabase.co";
    expect(getSupabaseAuthStorageKey()).toBe("sb-kqoigeigwucvlpzbvboy-auth-token");
  });

  it("returns null when URL missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(getSupabaseAuthStorageKey()).toBeNull();
  });
});
