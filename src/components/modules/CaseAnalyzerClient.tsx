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
  const [docInsight, setDocInsight] = useState<{
    fileName: string;
    preview: string;
    charCount: number;
    method: string;
    warnings: string[];
    structure: {
      sourceType: string;
      esasNo: string | null;
      kararNo: string | null;
      confidence: number;
      warnings: string[];
    };
    overlapRatio: number;
    matchedTokens: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setResult(null);
    setDocInsight(null);
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
        setError(typeof json.error === "string" ? json.error : v?.messageTr ?? "Analiz başarısız");
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

      // Belge metni + yapı (dosyayla konuşma katmanı)
      if (ids[0]) {
        const dr = await fetch("/api/document/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceId: ids[0], claim }),
        });
        const dj = await dr.json();
        if (dr.ok) {
          setDocInsight({
            fileName: dj.fileName,
            preview: dj.extraction?.preview ?? "",
            charCount: dj.extraction?.charCount ?? 0,
            method: dj.extraction?.method ?? "",
            warnings: dj.extraction?.warnings ?? [],
            structure: {
              sourceType: dj.structure?.sourceType ?? "unknown",
              esasNo: dj.structure?.esasNo ?? null,
              kararNo: dj.structure?.kararNo ?? null,
              confidence: dj.structure?.confidence ?? 0,
              warnings: dj.structure?.warnings ?? [],
            },
            overlapRatio: dj.claimOverlap?.ratio ?? 0,
            matchedTokens: dj.claimOverlap?.matchedTokens ?? [],
          });
        }
      }
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
          {loading ? "Belge okunuyor ve doğrulanıyor…" : "Doğrula ve belgeyi oku"}
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

      {docInsight && (
        <section className="space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
            Belge okuma (kaynak bağlı)
          </h2>
          <p className="text-sm text-[hsl(var(--text-primary))]">
            <span className="font-medium">{docInsight.fileName}</span>
            <span className="text-[hsl(var(--text-muted))]">
              {" "}
              · {docInsight.charCount} karakter · yöntem: {docInsight.method}
            </span>
          </p>
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-[hsl(var(--text-muted))]">Tür</p>
              <p className="text-[hsl(var(--text-primary))]">{docInsight.structure.sourceType}</p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--text-muted))]">Esas No</p>
              <p className="text-[hsl(var(--text-primary))]">
                {docInsight.structure.esasNo ?? "Metinde net yok"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--text-muted))]">Karar No</p>
              <p className="text-[hsl(var(--text-primary))]">
                {docInsight.structure.kararNo ?? "Metinde net yok"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--text-muted))]">
              İddia–belge örtüşme: {(docInsight.overlapRatio * 100).toFixed(0)}%
            </p>
            {docInsight.matchedTokens.length > 0 && (
              <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">
                Eşleşen: {docInsight.matchedTokens.slice(0, 12).join(", ")}
              </p>
            )}
          </div>
          {docInsight.preview ? (
            <pre className="max-h-64 overflow-auto rounded-lg bg-[hsl(var(--bg-tertiary))] p-4 text-xs leading-relaxed text-[hsl(var(--text-secondary))] whitespace-pre-wrap">
              {docInsight.preview}
            </pre>
          ) : (
            <p className="text-sm text-[hsl(var(--text-muted))]">
              Metin çıkarılamadı (tarama PDF olabilir).
            </p>
          )}
          {[...docInsight.warnings, ...docInsight.structure.warnings].length > 0 && (
            <ul className="text-xs text-[hsl(var(--text-muted))] space-y-1">
              {[...docInsight.warnings, ...docInsight.structure.warnings].map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
