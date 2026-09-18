/**
 * Deterministic text extraction from legal PDF / UDF buffers.
 * Zero-hallucination: only bytes present in the file are returned.
 * No OCR model claims — scanned images yield empty/low text (explicit warning).
 */

export interface ExtractResult {
  text: string;
  method: "pdf-stream" | "udf-xml" | "utf8-fallback" | "empty";
  charCount: number;
  warnings: string[];
}

function decodePdfLiteral(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/** Extract printable strings from PDF content streams (no external OCR). */
export function extractFromPdfBuffer(buffer: Buffer): ExtractResult {
  const warnings: string[] = [];
  const raw = buffer.toString("latin1");
  if (!raw.includes("%PDF")) {
    return { text: "", method: "empty", charCount: 0, warnings: ["PDF başlığı bulunamadı."] };
  }

  const chunks: string[] = [];

  // (literal) Tj / TJ
  const literalRe = /\((?:\\.|[^\\)])*\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = literalRe.exec(raw)) !== null) {
    const inner = m[0].replace(/\)\s*Tj$/, "").slice(1);
    const decoded = decodePdfLiteral(inner);
    if (decoded.trim().length > 0) chunks.push(decoded);
  }

  // TJ arrays: [(parts) ...] TJ
  const tjArrayRe = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ/g;
  while ((m = tjArrayRe.exec(raw)) !== null) {
    const partRe = /\((?:\\.|[^\\)])*\)/g;
    let p: RegExpExecArray | null;
    while ((p = partRe.exec(m[1])) !== null) {
      const decoded = decodePdfLiteral(p[0].slice(1, -1));
      if (decoded.trim().length > 0) chunks.push(decoded);
    }
  }

  // UTF-16BE hex strings <FEFF...>
  const hexRe = /<([0-9A-Fa-f]{4,})>/g;
  while ((m = hexRe.exec(raw)) !== null) {
    const hex = m[1];
    if (hex.length % 4 !== 0) continue;
    let out = "";
    for (let i = 0; i < hex.length; i += 4) {
      const code = parseInt(hex.slice(i, i + 4), 16);
      if (code === 0xfeff) continue;
      if (code >= 32 && code < 0xfffe) out += String.fromCharCode(code);
    }
    if (out.trim().length > 1) chunks.push(out);
  }

  let text = chunks.join(" ").replace(/\s+/g, " ").trim();
  if (text.length < 40) {
    warnings.push(
      "Metin çıkarma zayıf: tarama (scan) PDF veya gömülü font olabilir. OCR katmanı ayrıca gerekir."
    );
  }

  return {
    text: text.slice(0, 120000),
    method: text.length > 0 ? "pdf-stream" : "empty",
    charCount: text.length,
    warnings,
  };
}

export function extractFromUdfBuffer(buffer: Buffer): ExtractResult {
  const warnings: string[] = [];
  let text = "";
  try {
    text = buffer.toString("utf8");
  } catch {
    text = buffer.toString("latin1");
  }
  // Strip XML/HTML-ish tags for preview
  const stripped = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length < 20) {
    warnings.push("UDF içeriği çok kısa veya ikili format.");
  }

  return {
    text: stripped.slice(0, 120000),
    method: stripped.length > 0 ? "udf-xml" : "empty",
    charCount: stripped.length,
    warnings,
  };
}

export function extractDocumentText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string | null
): ExtractResult {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".udf") || (mimeType && mimeType.includes("udf"))) {
    return extractFromUdfBuffer(buffer);
  }
  if (lower.endsWith(".pdf") || mimeType === "application/pdf" || buffer.slice(0, 5).toString() === "%PDF-") {
    return extractFromPdfBuffer(buffer);
  }
  const utf = buffer.toString("utf8").replace(/\s+/g, " ").trim();
  return {
    text: utf.slice(0, 120000),
    method: utf.length > 0 ? "utf8-fallback" : "empty",
    charCount: utf.length,
    warnings: utf.length < 20 ? ["Desteklenmeyen veya boş içerik."] : [],
  };
}

/** Claim tokens that appear in document text (deterministic overlap, no LLM). */
export function claimDocumentOverlap(claim: string, docText: string): {
  overlapRatio: number;
  matchedTokens: string[];
} {
  const tokens = claim
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return { overlapRatio: 0, matchedTokens: [] };
  const doc = docText.toLowerCase();
  const matched = tokens.filter((t) => doc.includes(t));
  return {
    overlapRatio: matched.length / tokens.length,
    matchedTokens: matched.slice(0, 40),
  };
}
