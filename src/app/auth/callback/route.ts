import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const oauthError = requestUrl.searchParams.get("error");
  const oauthDescription = requestUrl.searchParams.get("error_description");

  if (oauthError) {
    const url = new URL("/auth/login", requestUrl.origin);
    url.searchParams.set("error", oauthError);
    if (oauthDescription) url.searchParams.set("error_description", oauthDescription);
    return NextResponse.redirect(url);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=missing_code", requestUrl.origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL("/auth/login", requestUrl.origin);
    url.searchParams.set("error", "code_exchange_failed");
    url.searchParams.set("error_description", error.message);
    return NextResponse.redirect(url);
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const origin = forwardedHost ? `https://${forwardedHost}` : requestUrl.origin;
  return NextResponse.redirect(new URL(next, origin));
}
