import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireApprovedUser } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PrecedentsPage() {
  const profile = await requireApprovedUser();
  if (!hasEntitlement(profile.tier, "advancedCaseAnalysis")) {
    redirect("/dashboard");
  }

  const supabase = await createServerClient();
  const { data: edges } = await supabase
    .from("precedents")
    .select("id,source_id,target_id,citation_type,weight")
    .limit(100);

  const { data: cases } = await supabase
    .from("cases")
    .select("id,court_type,decision_number,decision_date")
    .limit(50);

  return (
    <DashboardShell
      currentPath="/dashboard/precedents"
      userTier={profile.tier}
      userRole={profile.role}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            Pro++
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Emsal Grafı
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Yargıtay, Danıştay, AYM ve AİHM atıf ilişkileri. Veri yoksa grafik boş kalır;
            sahte emsal üretilmez.
          </p>
        </header>

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            Atıf kenarları ({edges?.length ?? 0})
          </h2>
          {(edges?.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-[hsl(var(--text-muted))]">
              Henüz kayıtlı emsal atıfı yok. Önce dava / emsal kayıtları eklenmelidir.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              {(edges ?? []).slice(0, 30).map((e) => (
                <li key={e.id} className="font-mono text-xs">
                  {e.source_id?.slice(0, 8)}… → {e.target_id?.slice(0, 8)}… · {e.citation_type} · w=
                  {e.weight}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
            Kayıtlı kararlar ({cases?.length ?? 0})
          </h2>
          {(cases?.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-[hsl(var(--text-muted))]">
              cases tablosunda kayıt yok. UDF/PDF analizi sonrası kararlar buraya işlenebilir.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--text-secondary))]">
              {(cases ?? []).map((c) => (
                <li key={c.id}>
                  {c.court_type} · {c.decision_number} · {c.decision_date}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
