import { DashboardShell } from "@/components/layout/DashboardShell";
import { FileUploadZone } from "@/components/modules/FileUploadZone";
import { VerificationPanel } from "@/components/modules/VerificationPanel";

/**
 * Dosya & UYAP Çalışma Alanı – Phase 4
 * Kurumsal, akademik, Baro seviyesinde arayüz
 */

export default function FilesPage() {
  return (
    <DashboardShell currentPath="/dashboard/files" userTier="free" userRole="user">
      <div className="mx-auto max-w-4xl space-y-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Dosya Yükleme & UYAP / UDF Analizi
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            PDF, DOCX ve UDF dosyalarını yükleyin. Free katmanda temel tarama,
            Pro++ katmanda yapılandırılmış UYAP okuma ve çoklu ajan analizi aktif olur.
          </p>
        </header>

        <FileUploadZone userTier="free" />

        <VerificationPanel
          isValid={false}
          confidence={0}
          sourceIds={[]}
          messageTr="Dosya yüklendikten sonra deontik ve kaynak doğrulaması burada görünecek."
          messageEn="After file upload, deontic and source verification will appear here."
        />

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            Akademik Not
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
            Her yüklenen belge sistemde bir <code className="rounded bg-[hsl(var(--bg-tertiary))] px-1.5 py-0.5 text-xs">source_id</code> ile
            kayıt altına alınır. Doğrulanmayan hiçbir hukuki iddia üretilmez.
            UYAP ve e-Devlet UDF dosyalarının yapılandırılmış ayrıştırılması yalnızca
            Pro++ katmanında ve admin onayı almış kullanıcılara açıktır.
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
