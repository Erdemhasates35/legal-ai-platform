"use client";

import { useCallback, useState } from "react";

/**
 * Gerçek dosya yükleme alanı – Phase 4
 * Free: temel yükleme + tür tanıma
 * Pro++: UYAP/UDF yapılandırılmış analiz hazırlığı
 *
 * Tasarım ilkesi: tek bakışta anlaşılır, minimum tıklama, kurumsal sakinlik
 */

type UploadStatus = "idle" | "dragging" | "uploading" | "success" | "error";

interface FileUploadZoneProps {
  userTier?: "free" | "private";
  onFileSelected?: (file: File) => void;
}

export function FileUploadZone({ userTier = "free", onFileSelected }: FileUploadZoneProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setStatus("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    setStatus("idle");
  }, []);

  const processFile = useCallback(
    (file: File) => {
      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
      ];

      if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith(".udf")) {
        setStatus("error");
        setErrorMessage("Desteklenen formatlar: PDF, DOCX, UDF");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setStatus("error");
        setErrorMessage("Dosya boyutu 50 MB sınırını aşıyor");
        return;
      }

      setFileName(file.name);
      setStatus("uploading");
      setErrorMessage(null);

      // Gerçek Supabase Storage yüklemesi burada bağlanacak
      // Şimdilik simülasyon + callback
      setTimeout(() => {
        setStatus("success");
        onFileSelected?.(file);
      }, 1200);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 transition-all duration-200 ${
          status === "dragging"
            ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent-muted))/30]"
            : status === "success"
              ? "border-[hsl(var(--success))] bg-[hsl(var(--success))/5]"
              : status === "error"
                ? "border-[hsl(var(--danger))] bg-[hsl(var(--danger))/5]"
                : "border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] hover:border-[hsl(var(--border-strong))]"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,.udf,application/pdf"
          onChange={handleInputChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={status === "uploading"}
        />

        {status === "idle" || status === "dragging" ? (
          <>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--bg-elevated))] text-2xl">
              📄
            </div>
            <p className="text-base font-medium text-[hsl(var(--text-primary))]">
              Dosyayı sürükleyin veya seçin
            </p>
            <p className="mt-2 text-sm text-[hsl(var(--text-muted))]">
              PDF · DOCX · UDF · Maksimum 50 MB
            </p>
          </>
        ) : null}

        {status === "uploading" && (
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent" />
            <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Yükleniyor…</p>
            <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">{fileName}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mb-4 text-3xl text-[hsl(var(--success))]">✓</div>
            <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Yükleme tamamlandı</p>
            <p className="mt-1 text-xs text-[hsl(var(--text-muted))]">{fileName}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mb-4 text-3xl text-[hsl(var(--danger))]">!</div>
            <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Yükleme başarısız</p>
            <p className="mt-1 text-xs text-[hsl(var(--danger))]">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Katman bilgilendirmesi */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">
            Free
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-[hsl(var(--text-secondary))]">
            <li>• Dosya yükleme ve tür tanıma</li>
            <li>• Temel metin çıkarma</li>
            <li>• Deontik ön kontrol</li>
          </ul>
        </div>
        <div className="rounded-xl border border-[hsl(var(--accent-muted))] bg-[hsl(var(--card))] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))]">
            Pro++
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-[hsl(var(--text-secondary))]">
            <li>• UYAP / UDF yapılandırılmış okuma</li>
            <li>• Esas · Karar · Mahkeme çıkarma</li>
            <li>• Çoklu ajan + GNN analizi</li>
          </ul>
          {userTier !== "private" && (
            <p className="mt-3 text-xs text-[hsl(var(--text-muted))]">
              Bu özellikler Pro++ katmanında aktif olur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
