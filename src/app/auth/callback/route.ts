import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Google OAuth callback
 * Session oluşturulur, ardından dashboard'a yönlendirilir
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Hata durumunda login'e geri dön
  return NextResponse.redirect(`${origin}/auth/login?error=auth`);
}
