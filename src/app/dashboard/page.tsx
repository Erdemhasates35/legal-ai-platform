import { DashboardShell } from "@/components/layout/DashboardShell";
import Link from "next/link";

/**
 * Dashboard Genel Bakış – Phase 4
 * Kurumsal giriş noktası, net yönlendirme, akademik ton
 */

export default function DashboardPage() {
  return (
    <DashboardShell currentPath="/dashboard" userTier="free" userRole="user">
      <div className="mx-auto max-w-5xl space-y-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Çalışma Alanı
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Türk hukuku ve AİHM içtihatları üzerinde sıfır-hallüsinasyon analiz ortamı.
            Tüm çıktılar source_id ile doğrulanır.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/files"
            className="group plasma-card p-6 transition-all hover:border-[hsl(var(--accent-muted))]"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
              Free + Pro++
            </p>
            <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--accent))]">
              Dosya & UYAP
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
              PDF, DOCX, UDF yükleme. Pro++ ile yapılandırılmış UYAP okuma.
            </p>
          </Link>

          <div className="plasma-card p-6 opacity-70">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
              Pro++
            </p>
            <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))]">
              Dava Analizi
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
              Deontik + GNN + Çoklu ajan katmanlarından geçen tam analiz.
            </p>
          </div>

          <div className="plasma-card p-6 opacity-70">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
              Pro++
            </p>
            <h2 className="mt-3 text-lg font-medium text-[hsl(var(--text-primary))]">
              Emsal Grafı
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
              Yargıtay, Danıştay, AYM ve AİHM kararlarının interaktif atıf ağı.
            </p>
          </div>
        </div>

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            Platform İlkeleri
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--text-secondary))]">
            <li className="flex gap-2">
              <span className="text-[hsl(var(--accent))]">•</span>
              Her hukuki iddia zorunlu source_id taşır. Kaynaksız çıktı üretilmez.
            </li>
            <li className="flex gap-2">
              <span className="text-[hsl(var(--accent))]">•</span>
              Google giriş + Admin onayı olmadan erişim yoktur.
            </li>
            <li className="flex gap-2">
              <span className="text-[hsl(var(--accent))]">•</span>
              Free katman temel araçları, Pro++ tüm akademik ve Baro seviyesindeki modülleri açar.
            </li>
            <li className="flex gap-2">
              <span className="text-[hsl(var(--accent))]">•</span>
              Tasarım uzun süre kullanıma uygun, göz yormayan Pro-Plasma koyu temadır.
            </li>
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
