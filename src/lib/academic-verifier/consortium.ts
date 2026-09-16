/**
 * Multi-Agent Legal Consortium
 * Pro++ only – designed for academic lawyers and Bar Associations
 *
 * Ajanlar:
 * - Judge (Hakim)
 * - Prosecutor (Savcı)
 * - Defense Counsel (Savunma)
 * - Academic Verifier (Akademik Doğrulayıcı)
 *
 * Her ajan bağımsız görüş üretir, sonra konsensus skorlanır.
 * Sıfır hallüsinasyon: her iddia source_id taşımak zorundadır.
 */

import type { VerificationResult } from "@/types/legal";

export type AgentRole = "judge" | "prosecutor" | "defense" | "academic";

export interface AgentOpinion {
  role: AgentRole;
  roleTr: string;
  opinionTr: string;
  opinionEn: string;
  confidence: number;
  citedSourceIds: string[];
  flags: string[];
}

export interface ConsortiumResult {
  overallValid: boolean;
  consensusScore: number;
  opinions: AgentOpinion[];
  finalMessageTr: string;
  finalMessageEn: string;
  rejectedReasons: string[];
}

/**
 * Basit kural tabanlı konsensus (üretimde gerçek LLM ajanları + deontik motor bağlanacak)
 * Şu an iskelet – tüm ajanlar source_id zorunluluğunu kontrol eder.
 */
export function runConsortium(
  _claim: string,
  sourceIds: string[],
  deonticResult: VerificationResult
): ConsortiumResult {
  const opinions: AgentOpinion[] = [];

  // 1. Academic Verifier – en katı
  if (sourceIds.length === 0 || !deonticResult.isValid) {
    opinions.push({
      role: "academic",
      roleTr: "Akademik Doğrulayıcı",
      opinionTr: "Kaynak kimliği veya deontik geçerlilik eksik. İddia reddedilmelidir.",
      opinionEn: "Missing source_id or deontic validity. Claim must be rejected.",
      confidence: 0.95,
      citedSourceIds: sourceIds,
      flags: ["MISSING_SOURCE_OR_DEONTIC"]
    });
  } else {
    opinions.push({
      role: "academic",
      roleTr: "Akademik Doğrulayıcı",
      opinionTr: "Kaynaklar ve deontik katman tutarlı görünüyor. Daha derin GNN kontrolü önerilir.",
      opinionEn: "Sources and deontic layer appear consistent. Deeper GNN check recommended.",
      confidence: 0.82,
      citedSourceIds: sourceIds,
      flags: []
    });
  }

  // 2. Judge
  opinions.push({
    role: "judge",
    roleTr: "Hakim",
    opinionTr: deonticResult.isValid
      ? "Deontik kontrol olumlu. Emsal ağırlığına bakılmalı."
      : "Deontik tutarsızlık nedeniyle iddia zayıf.",
    opinionEn: deonticResult.isValid
      ? "Deontic check positive. Precedent weight should be examined."
      : "Claim weakened by deontic inconsistency.",
    confidence: deonticResult.confidence,
    citedSourceIds: sourceIds,
    flags: deonticResult.isValid ? [] : ["DEONTIC_FAIL"]
  });

  // 3. Prosecutor & Defense
  opinions.push({
    role: "prosecutor",
    roleTr: "Savcı",
    opinionTr: "İddianın dayanakları incelenmeli; eksik kaynak varsa şüphe doğar.",
    opinionEn: "Foundations of the claim must be examined; missing sources raise doubt.",
    confidence: 0.7,
    citedSourceIds: sourceIds,
    flags: sourceIds.length < 2 ? ["LOW_SOURCE_COUNT"] : []
  });

  opinions.push({
    role: "defense",
    roleTr: "Savunma",
    opinionTr: "Sanık lehine yorumlanabilecek emsaller de dikkate alınmalıdır.",
    opinionEn: "Precedents that may favor the defendant should also be considered.",
    confidence: 0.68,
    citedSourceIds: sourceIds,
    flags: []
  });

  const validOpinions = opinions.filter((o) => o.flags.length === 0);
  const consensusScore = validOpinions.length / opinions.length;
  const overallValid = consensusScore >= 0.6 && deonticResult.isValid;

  return {
    overallValid,
    consensusScore,
    opinions,
    finalMessageTr: overallValid
      ? "Konsorsiyum iddiayı çoğunlukla destekliyor. Pro++ GNN katmanı ile güçlendirilebilir."
      : "Konsorsiyum iddiayı yetersiz buldu. Kaynak veya deontik eksiklik var.",
    finalMessageEn: overallValid
      ? "Consortium mostly supports the claim. Can be strengthened with Pro++ GNN layer."
      : "Consortium finds the claim insufficient. Source or deontic gap exists.",
    rejectedReasons: overallValid ? [] : ["LOW_CONSENSUS_OR_DEONTIC_FAIL"]
  };
}
