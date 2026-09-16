import Link from "next/link";

/**
 * Kurumsal Dashboard Kabuğu
 * Baro / Hakim / Akademik hukukçu kullanımına uygun
 * Pro-Plasma koyu tema, net hiyerarşi, minimum bilişsel yük
 */

const NAV_ITEMS = [
  { href: "/dashboard", label: "Genel Bakış", tier: "free" },
  { href: "/dashboard/files", label: "Dosya & UYAP", tier: "free" },
  { href: "/dashboard/analyzer", label: "Dava Analizi", tier: "pro" },
  { href: "/dashboard/precedents", label: "Emsal Grafı", tier: "pro" },
  { href: "/dashboard/verification", label: "Doğrulama Paneli", tier: "free" },
  { href: "/admin", label: "Yönetici", tier: "admin" }
] as const;

interface DashboardShellProps {
  children: React.ReactNode;
  currentPath?: string;
  userTier?: "free" | "private";
  userRole?: "pending" | "user" | "admin";
}

export function DashboardShell({
  children,
  currentPath = "/dashboard",
  userTier = "free",
  userRole = "user"
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Sol Navigasyon */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))]">
        <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent))] text-sm font-bold text-white">
            L
          </div>
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Legal AI</p>
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--text-muted))]">
              {userTier === "private" ? "Pro++" : "Free"}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.href;
            const isLocked =
              (item.tier === "pro" && userTier !== "private") ||
              (item.tier === "admin" && userRole !== "admin");

            return (
              <Link
                key={item.href}
                href={isLocked ? "#" : item.href}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-[hsl(var(--accent-muted))] text-[hsl(var(--accent))]")
                    : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))]"
                } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <span>{item.label}</span>
                {isLocked && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--text-muted))]">
                    Pro++
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[hsl(var(--border))] p-4">
          <p className="text-[11px] leading-relaxed text-[hsl(var(--text-muted))]">
            Sıfır-hallüsinasyon · source_id zorunlu
            <br />
            Akademik & Baro standartı
          </p>
        </div>
      </aside>

      {/* Ana İçerik */}
      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--bg-primary))/95] px-8 backdrop-blur">
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Türk Hukuku + AİHM · Kurumsal Analiz Ortamı
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[hsl(var(--bg-tertiary))] px-3 py-1 text-xs font-medium text-[hsl(var(--text-secondary))]">
              {userTier === "private" ? "Pro++ Aktif" : "Free Katman"}
            </span>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
