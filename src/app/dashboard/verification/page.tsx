import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireApprovedUser } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/supabase/server";
import { VerificationPanel } from "@/components/modules/VerificationPanel";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const profile = await requireApprovedUser();
  const supabase = await createServerClient();

  const { data: files } = await supabase
    .from("user_files")
    .select("id,original_name,created_at,mime_type,size_bytes")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const sourceIds = (files ?? []).map((f) => f.id);
  const hasSources = sourceIds.length > 0;

  return (
    <DashboardShell
      currentPath="/dashboard/verification"
      userTier={profile.tier}
      userRole={profile.role}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Doğrulama Paneli
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Yüklenen her dosya bir source_id (kayıt kimliği) alır. Analiz yalnızca bu
            kimliklere bağlanır.
          </p>
        </header>

        <VerificationPanel
          isValid={hasSources}
          confidence={hasSources ? 1 : 0}
          sourceIds={sourceIds}
          messageTr={{
            hasSources
              ? `${sourceIds.length} kayıtlı kaynak (dosya) bulundu. İddia doğrulaması için Dava Analizi modülünde source_id kullanın.`
              : "Henüz yüklenmiş dosya yok. Önce Dosya & UYAP üzerinden belge yükleyin."
          }}
          messageEn={{
            hasSources
              ? `${sourceIds.length} registered source file(s). Use source_id in Case Analysis.`
              : "No uploaded files yet. Upload via Files & UYAP first."
          }}
        />

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            Kayıtlı dosyalarınız
          </h2>
          {(files?.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-[hsl(var(--text-muted))]">Liste boş.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {(files ?? []).map((f) => (
                <li
                  key={f.id}
                  className="flex flex-col gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                      {f.original_name}
                    </p>
                    <p className="font-mono text-xs text-[hsl(var(--text-muted))]">
                      source_id: {f.id}
                    </p>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-muted))]">
                    {f.mime_type ?? "—"} · {f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
