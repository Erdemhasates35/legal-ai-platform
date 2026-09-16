/**
 * UYAP / UDF / e-Devlet PDF & UDF Parser Module
 * Pro++ only – Academic & Bar Association grade
 *
 * Bu modül mevcut pdf skill’i ile birlikte çalışacak şekilde tasarlanmıştır.
 * Gerçek OCR / metin çıkarma runtime’da pdf skill veya Supabase Edge Function ile yapılır.
 * Burada sadece yapılandırılmış çıktı tipi ve tanıma mantığı yer alır.
 */

export interface UyapParsedDocument {
  sourceType: "uyap" | "udf" | "e-devlet" | "generic-pdf" | "unknown";
  courtName: string | null;
  courtType: "Yargitay" | "Danistay" | "AYM" | "Asliye" | "Idare" | "other" | null;
  esasNo: string | null;
  kararNo: string | null;
  decisionDate: string | null;
  parties: {
    plaintiff?: string;
    defendant?: string;
    other?: string[];
  };
  rawTextPreview: string;
  confidence: number; // 0-1
  warnings: string[];
}

/**
 * Basit kural tabanlı tanıma (üretimde LLM + regex hibrit kullanılacak)
 * Sıfır hallüsinasyon: sadece metinde açıkça geçen alanlar doldurulur.
 */
export function detectUyapStructure(rawText: string): UyapParsedDocument {
  const warnings: string[] = [];
  let sourceType: UyapParsedDocument["sourceType"] = "unknown";
  let confidence = 0.3;

  const lower = rawText.toLowerCase();

  if (lower.includes("uyap") || lower.includes("ulusal yargı ağı")) {
    sourceType = "uyap";
    confidence = 0.75;
  } else if (lower.includes("udf") || lower.includes("e-devlet")) {
    sourceType = "udf";
    confidence = 0.7;
  } else if (rawText.length > 500) {
    sourceType = "generic-pdf";
    confidence = 0.4;
  }

  // Esas / Karar numarası basit yakalama (örnek pattern)
  const esasMatch = rawText.match(/(?:Esas|E\.)\s*[Nn]o\s*[:.]?\s*([0-9]{4}\/[0-9]+)/i);
  const kararMatch = rawText.match(/(?:Karar|K\.)\s*[Nn]o\s*[:.]?\s*([0-9]{4}\/[0-9]+)/i);

  if (!esasMatch) warnings.push("Esas numarası metinde net bulunamadı.");
  if (!kararMatch) warnings.push("Karar numarası metinde net bulunamadı.");

  return {
    sourceType,
    courtName: null,
    courtType: null,
    esasNo: esasMatch ? esasMatch[1] : null,
    kararNo: kararMatch ? kararMatch[1] : null,
    decisionDate: null,
    parties: {},
    rawTextPreview: rawText.slice(0, 800),
    confidence,
    warnings
  };
}

export function isProPlusOnlyModule(): boolean {
  return true; // UYAP derin parser sadece Pro++
}
