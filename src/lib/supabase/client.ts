import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://qxfvpcjvoiantjrkorsa.supabase.co";

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_XIl3JwkBJmBc1Fl2GIHqew_zHggmAjr";

export function getBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

/** Geriye uyumluluk */
export const supabase = getBrowserClient();
