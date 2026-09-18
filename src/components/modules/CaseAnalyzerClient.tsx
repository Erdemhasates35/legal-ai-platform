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
      const v = json.verification;

      if (!res.ok) {
        setError(
          typeof json.error === "string"
            ? json.error
            : v?.messageTr ?? "Analiz başarısız"
        );
        setResult({
          isValid: false,
          confidence: Number(v?.confidence ?? 0),
          sourceIds: v?.sourceIds ?? ids,
          messageTr:
            v?.messageTr ??
            "Doğrulama reddedildi. source_id Doğrulama Panelindeki dosya UUID olmalı.",
          messageEn: v?.messageEn ?? "Verification rejected.",
        });
        return;
      }

      setResult({
        isValid: Boolean(json.verified ?? v?.isValid),
        confidence: Number(v?.confidence ?? (json.verified ? 1 : 0)),
        sourceIds: json.sourceIds ?? v?.sourceIds ?? ids,
        messageTr:
          v?.messageTr ??
          (json.verified ? "Kaynak bağlı doğrulama geçti." : "Doğrulama geçmedi."),
        messageEn: v?.messageEn ?? json.evidencePolicy ?? "",
      });
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
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
