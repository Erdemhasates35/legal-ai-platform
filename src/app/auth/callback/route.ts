import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function loginError(requestUrl: URL, code: string, description?: string | null) {
  const url = new URL("/auth/login", requestUrl.origin);
  url.searchParams.set("error", code);
  if (description) url.searchParams.set("error_description", description.slice(0, 300));
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const oauthError = requestUrl.searchParams.get("error");
  const oauthDescription = requestUrl.searchParams.get("error_description");

  if (oauthError) return loginError(requestUrl, oauthError, oauthDescription);
  if (!code) return loginError(requestUrl, "missing_code");

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) return loginError(requestUrl, "code_exchange_failed", error.message);

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch {
    return loginError(requestUrl, "code_exchange_failed");
  }
}
