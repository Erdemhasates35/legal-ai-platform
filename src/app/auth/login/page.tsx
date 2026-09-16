"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

/**
 * Google Giriş Sayfası
 * Sadece Google OAuth – ekstra form yok, kullanıcıyı yormaz
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg-primary))] px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent))] text-xl font-bold text-white">L</div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))]">Legal AI Platform</h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">Türk Hukuku + AİHM · Kaynak-doğrulamalı analiz ortamı</p>
        </div>

        <div className="plasma-card p-8">
          <button onClick={handleGoogleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-medium text-gray-800 transition hover:bg-gray-100 disabled:opacity-60">
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Yönlendiriliyor…" : "Google ile Giriş Yap"}
          </button>
          {error && <p className="mt-4 text-center text-sm text-[hsl(var(--danger))]">{error}</p>}
          <p className="mt-6 text-center text-xs text-[hsl(var(--text-muted))]">Giriş sonrası yönetici onayı gerekir.<br />Onaylanmadan platforma erişim yoktur.</p>
        </div>
      </div>
    </main>
  );
}
