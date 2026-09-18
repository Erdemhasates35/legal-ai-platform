import { DashboardShell } from "@/components/layout/DashboardShell";
import { requireApprovedUser } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";
import { redirect } from "next/navigation";
import { CaseAnalyzerClient } from "@/components/modules/CaseAnalyzerClient";

export const dynamic = "force-dynamic";

export default async function AnalyzerPage() {
  const profile = await requireApprovedUser();
  if (!hasEntitlement(profile.tier, "advancedCaseAnalysis")) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      currentPath="/dashboard/analyzer"
      userTier={profile.tier}
      userRole={profile.role}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            Pro++
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Dava Analizi
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
            Yüklenen belge source_id ile bağlanır. Kaynaksız iddia doğrulanmış sayılmaz.
          </p>
        </header>
        <CaseAnalyzerClient />
      </div>
    </DashboardShell>
  );
}
