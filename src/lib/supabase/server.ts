import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://tglfvmwhrpelbxfvofca.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_mnZ24RUHMq0nnVNWewQ6Bg_YHqgnCNV";

export async function createServerClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {
          // Server Components cannot mutate cookies; middleware refreshes sessions.
        }
      }
    }
  });
}
