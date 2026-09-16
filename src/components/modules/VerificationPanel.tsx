/**
 * Formal Verification Panel – Phase 4
 * Deontik + kaynak + konsensus sonuçlarını kurumsal netlikte gösterir
 * Akademik ve Baro kullanımına uygun, sakin, okunabilir tasarım
 */

interface VerificationPanelProps {
  isValid?: boolean;
  confidence?: number;
  sourceIds?: string[];
  messageTr?: string;
  messageEn?: string;
  rejectedReason?: string;
  consensusScore?: number;
}

export function VerificationPanel({
  isValid = false,
  confidence = 0,
  sourceIds = [],
  messageTr = "Henüz doğrulama yapılmadı.",
  messageEn = "No verification performed yet.",
  rejectedReason,
  consensusScore
}: VerificationPanelProps) {
  return (
    <section className="plasma-card overflow-hidden">
      <div className="border-b border-[hsl(var(--border))] px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
          Formal Doğrulama Paneli
        </h2>
      </div>

      <div className="grid gap-0 sm:grid-cols-3">
        {/* Durum */}
        <div className="border-b border-[hsl(var(--border))] p-6 sm:border-b-0 sm:border-r">
          <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-muted))]">
            Sonuç
          </p>
          <p
            className={`mt-2 text-2xl font-semibold ${
              isValid ? "text-[hsl(var(--success))]" : "text-[hsl(var(--danger))]"
            }`}
          >
            {isValid ? "Geçerli" : "Reddedildi"}
          </p>
          {rejectedReason && (
            <p className="mt-2 text-xs text-[hsl(var(--text-muted))]">{rejectedReason}</p>
          )}
        </div>

        {/* Güven */}
        <div className="border-b border-[hsl(var(--border))] p-6 sm:border-b-0 sm:border-r">
          <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-muted))]">
            Güven Skoru
          </p>
          <p className="mt-2 text-2xl font-semibold text-[hsl(var(--text-primary))]">
            {(confidence * 100).toFixed(0)}%
          </p>
          {typeof consensusScore === "number" && (
            <p className="mt-2 text-xs text-[hsl(var(--text-muted))]">
              Konsensus: {(consensusScore * 100).toFixed(0)}%
            </p>
          )}
        </div>

        {/* Kaynaklar */}
        <div className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--text-muted))]">
            Kaynak Kimlikleri
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sourceIds.length > 0 ? (
              sourceIds.map((id) => (
                <span
                  key={id}
                  className="rounded-md bg-[hsl(var(--bg-tertiary))] px-2.5 py-1 text-xs font-mono text-[hsl(var(--text-secondary))]"
                >
                  {id}
                </span>
              ))
            ) : (
              <span className="text-sm text-[hsl(var(--text-muted))]">source_id yok</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] px-6 py-4">
        <p className="text-sm text-[hsl(var(--text-secondary))]">{messageTr}</p>
        <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">{messageEn}</p>
      </div>
    </section>
  );
}
