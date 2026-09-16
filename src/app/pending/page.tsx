import Link from "next/link";

export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--bg-primary))] px-6">
      <section className="plasma-card w-full max-w-xl p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
          Erişim Onayı
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-[hsl(var(--text-primary))]">
          Yönetici onayı bekleniyor
        </h1>
        <p className="mt-4 text-sm leading-6 text-[hsl(var(--text-secondary))]">
          Google hesabınız doğrulandı. Hukuki çalışma alanına erişim, yönetici tarafından
          açıkça onaylandıktan sonra etkinleşir.
        </p>
        <Link href="/" className="plasma-button mt-7 inline-flex">
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  );
}
