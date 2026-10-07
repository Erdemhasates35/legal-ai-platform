import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { extractDocumentText, type ExtractResult } from "./extract-text";

export async function extractDocumentTextEnhanced(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null
): Promise<ExtractResult> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".docx") || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value.replace(/\s+/g, " ").trim().slice(0, 120000);
      const warnings = result.messages.map((message) => message.message);
      if (text.length < 20) {
        warnings.push("DOCX metin içeriği boş veya çok kısa.");
      }
      return {
        text,
        method: text.length > 0 ? "utf8-fallback" : "empty",
        charCount: text.length,
        warnings,
      };
    } catch (error) {
      const fallback = extractDocumentText(buffer, fileName, mimeType);
      return {
        ...fallback,
        warnings: [
          ...fallback.warnings,
          `DOCX gelişmiş çıkarma başarısız: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
        ],
      };
    }
  }

  if (lower.endsWith(".pdf") || mimeType === "application/pdf" || buffer.slice(0, 5).toString() === "%PDF-") {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      const text = result.text.replace(/\s+/g, " ").trim().slice(0, 120000);
      const warnings = text.length < 40
        ? ["PDF metni zayıf veya taranmış olabilir; OCR katmanı ayrıca gerekir."]
        : [];
      return {
        text,
        method: text.length > 0 ? "pdf-stream" : "empty",
        charCount: text.length,
        warnings,
      };
    } catch (error) {
      const fallback = extractDocumentText(buffer, fileName, mimeType);
      return {
        ...fallback,
        warnings: [
          ...fallback.warnings,
          `PDF gelişmiş çıkarma başarısız; deterministik geri dönüş kullanıldı: ${error instanceof Error ? error.message : "bilinmeyen hata"}`,
        ],
      };
    }
  }

  return extractDocumentText(buffer, fileName, mimeType);
}
