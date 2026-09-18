"use client";

import { useState } from "react";
import { VerificationPanel } from "@/components/modules/VerificationPanel";

export function CaseAnalyzerClient() {
  const [claim, setClaim] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    confidence: number;
    sourceIds: string[];
    messageTr: string;
    messageEn: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const ids = sourceId
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, sourceIds: ids }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Analiz başarısız");
        setResult({
          isValid: false,
          confidence: 0,
          sourceIds: ids,
          messageTr:
            "Doğrulama reddedildi. source_id aktif deontik kural kümesinde olmalı veya claim boş olmamalı.",
          messageEn: "Verification rejected. Check source_id and claim.",
        });
        return;
      }
      setResult({
        isValid: Boolean(json.verified),
        confidence: json.verification?.confidence ?? (json.verified ? 1 : 0),
        sourceIds: json.sourceIds ?? ids,
        messageTr: json.verified
          ? "Kaynak bağlı doğrulama geçti."
          : "Doğrulama geçmedi.",
        messageEn: json.evidencePolicy ?? "",
      });
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
            Hukuki iddia / özet
          </label>
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] px-3 py-2 text-sm text-[hsl(var(--text-primary))]"
            placeholder="Analiz edilecek iddiayı yazın…"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
            source_id (Doğrulama Panelindeki dosya UUID)
          </label>
          <input
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] px-3 py-2 font-mono text-sm text-[hsl(var(--text-primary))]"
            placeholder="user_files.id UUID…"
          />
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading || !claim.trim()}
          className="plasma-button disabled:opacity-50"
        >
          {loading ? "Analiz ediliyor…" : "Doğrula ve analiz et"}
        </button>
        {error && <p className="text-sm text-[hsl(var(--danger))]">{error}</p>}
      </div>

      {result && (
        <VerificationPanel
          isValid={result.isValid}
          confidence={result.confidence}
          sourceIds={result.sourceIds}
          messageTr={result.messageTr}
          messageEn={result.messageEn}
        />
      )}
    </div>
  );
}
