import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--text-primary))] sm:text-5xl">Legal AI Platform</h1>
        <p className="mt-4 text-lg text-[hsl(var(--text-secondary))]">Kaynak-Doğrulamalı · Akademik Çalışma · Baro & Avukat Odaklı</p>
        <p className="mt-2 text-sm text-[hsl(var(--text-muted))]">Türk Hukuku + AİHM · Google Giriş · Admin Onayı · Free / Pro++</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/auth/login" className="plasma-button px-8 py-3 text-base">Google ile Giriş Yap</Link>
        <Link href="/dashboard" className="rounded-lg border border-[hsl(var(--border))] px-8 py-3 text-base text-[hsl(var(--text-secondary))] transition hover:border-[hsl(var(--border-strong))] hover:text-[hsl(var(--text-primary))]">Dashboard’a Git</Link>
      </div>

      <div className="grid w-full gap-5 sm:grid-cols-3">
        <div className="plasma-card p-6"><h2 className="font-semibold text-[hsl(var(--text-primary))]">Free Katman</h2><p className="mt-3 text-sm text-[hsl(var(--text-secondary))]">Deontik doğrulama · source_id zorunluluğu · Temel dosya yükleme</p></div>
        <div className="plasma-card p-6"><h2 className="font-semibold text-[hsl(var(--accent))]">Pro++ Katman</h2><p className="mt-3 text-sm text-[hsl(var(--text-secondary))]">UYAP/UDF · citation graph · çoklu ajan doğrulama · ileri analiz</p></div>
        <div className="plasma-card p-6"><h2 className="font-semibold text-[hsl(var(--text-primary))]">Yönetici</h2><p className="mt-3 text-sm text-[hsl(var(--text-secondary))]">Onay · Katman atama · Denetim kaydı · RLS tabanlı yönetim</p></div>
      </div>

      <p className="max-w-3xl text-center text-xs leading-5 text-[hsl(var(--text-muted))]">Her doğrulanmış iddia source_id ile bağlanır. Kayıtlı, aktif ve deontik doğrulamadan geçmeyen kaynaklar doğrulanmış hukuki sonuç olarak sunulmaz.</p>
    </main>
  );
}
