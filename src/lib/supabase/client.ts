import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase browser environment configuration");
}

export function getBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}

/** Geriye uyumluluk */
export const supabase = getBrowserClient();
