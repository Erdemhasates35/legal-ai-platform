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
    return NextResponse.redirect(url);
  }

  // İlk yönetici hesabı: yalnızca ADMIN_BOOTSTRAP_EMAIL ile eşleşen
  // Google hesabı ve henüz hiç admin yoksa otomatik olarak onaylanır.
  const { data: { user } } = await supabase.auth.getUser();
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (user?.email && bootstrapEmail && user.email.toLowerCase() === bootstrapEmail) {
    await supabase.rpc("bootstrap_admin", { bootstrap_email: bootstrapEmail });
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
