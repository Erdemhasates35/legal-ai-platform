import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://tglfvmwhrpelbxfvofca.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_mnZ24RUHMq0nnVNWewQ6Bg_YHqgnCNV";

export function getBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
