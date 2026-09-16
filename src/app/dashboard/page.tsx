import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireApprovedUser } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireApprovedUser();
  const pro = hasEntitlement(profile.tier, "advancedCaseAnalysis");

  return (
    <DashboardShell currentPath="/dashboard" userTier={profile.tier} userRole={profile.role}>
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            {profile.role === "admin" ? "Kurumsal Yönetici" : "Hukuk Çalışma Alanı"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Çalışma Alanı
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            {profile.email} · {profile.tier === "private" ? "Pro++" : "Free"}
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/files" className="group plasma-card p-6 transition-all hover:border-[hsl(var(--accent-muted))]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">Free + Pro++</p>
            <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))]">Dosya & UYAP</h2>
            <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">PDF, DOCX, UDF yükleme ve yetkili belge yönetimi.</p>
          </Link>

          {pro ? (
            <Link href="/dashboard/analyzer" className="group plasma-card p-6 transition-all hover:border-[hsl(var(--accent-muted))]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))]">Pro++</p>
              <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))]">Dava Analizi</h2>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">Kaynak doğrulama, deontik kontrol ve ileri analiz katmanları.</p>
            </Link>
          ) : (
            <div className="plasma-card p-6 opacity-70">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">Pro++</p>
              <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))]">Dava Analizi</h2>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">İleri analiz modülleri Pro++ katmanında açılır.</p>
            </div>
          )}

          {pro ? (
            <Link href="/dashboard/precedents" className="group plasma-card p-6 transition-all hover:border-[hsl(var(--accent-muted))]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))]">Pro++</p>
              <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))]">Emsal Grafı</h2>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">Yargıtay, Danıştay, AYM ve AİHM kaynakları arasındaki atıflar.</p>
            </Link>
          ) : (
            <div className="plasma-card p-6 opacity-70">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">Pro++</p>
              <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))]">Emsal Grafı</h2>
              <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">Atıf grafı Pro++ katmanında açılır.</p>
            </div>
          )}
        </div>

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Doğrulama ilkesi</h2>
          <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--text-secondary))]">
            <li>• Her doğrulanmış hukuki iddia source_id taşır.</li>
            <li>• Kayıtlı olmayan veya pasif kaynaklar doğrulanmış sonuç üretemez.</li>
            <li>• Google kimliği ve yönetici onayı olmadan çalışma alanına erişim yoktur.</li>
            <li>• Pro-Plasma koyu tema kurumsal ve uzun süreli kullanım için korunmuştur.</li>
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
