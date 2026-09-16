import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase public runtime configuration is missing");
  return { url, key };
}

export function getBrowserClient() {
  const { url, key } = getPublicConfig();
  return createBrowserClient(url, key);
}

/** Server-only service-role client. Never import this from a Client Component. */
export function createServiceClient() {
  const { url } = getPublicConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
