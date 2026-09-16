import { DashboardShell } from "@/components/layout/DashboardShell";
import { FileUploadZone } from "@/components/modules/FileUploadZone";
import { VerificationPanel } from "@/components/modules/VerificationPanel";
import { requireApprovedUser } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const profile = await requireApprovedUser();
  const pro = hasEntitlement(profile.tier, "uyapUdf");

  return (
    <DashboardShell currentPath="/dashboard/files" userTier={profile.tier} userRole={profile.role}>
      <div className="mx-auto max-w-4xl space-y-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">Dosya Yükleme & UYAP / UDF Analizi</h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">PDF, DOCX ve UDF belgeleri güvenli kullanıcı alanına yüklenir.</p>
        </header>

        <FileUploadZone userTier={profile.tier} />

        <VerificationPanel
          isValid={false}
          confidence={0}
          sourceIds={[]}
          messageTr="Doğrulama yalnızca kayıtlı ve aktif source_id kümesi üzerinden yapılır."
          messageEn="Verification is performed only against registered and active source_id records."
        />

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">Erişim kapsamı</h2>
          <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
            {pro
              ? "Pro++: UYAP/UDF yapılandırılmış okuma, emsal grafı ve ileri analiz modülleri yetkiniz dahilindedir."
              : "Free: güvenli dosya yükleme, temel tarama ve source_id/deontik doğrulama aktiftir. UYAP/UDF derin analiz Pro++ katmanındadır."}
          </p>
        </section>
      </div>
    </DashboardShell>
  );
}
