/**
 * Multi-Agent Legal Consortium
 * Pro++ only – designed for academic lawyers and Bar Associations
 *
 * Ajanlar bağımsız hukuki değerlendirme rolleri olarak modellenir. Bu modül
 * kaynak üretmez; yalnızca daha önce doğrulanmış source_id kümesi üzerinde çalışır.
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

export function runConsortium(
  claim: string,
  sourceIds: string[],
  deonticResult: VerificationResult
): ConsortiumResult {
  const normalizedClaim = claim.trim();
  const sourceBound = sourceIds.length > 0 && sourceIds.every((id) => deonticResult.sourceIds.includes(id));
  const gateOpen = Boolean(normalizedClaim && sourceBound && deonticResult.isValid);

  if (!gateOpen) {
    const opinion: AgentOpinion = {
      role: "academic",
      roleTr: "Akademik Doğrulayıcı",
      opinionTr: "Kaynak/deontik doğrulama kapısı geçilmedi; sonuç doğrulanmış hukuki görüş olarak sunulamaz.",
      opinionEn: "The source/deontic gate did not pass; the result cannot be presented as a verified legal opinion.",
      confidence: 0,
      citedSourceIds: sourceIds,
      flags: ["VERIFICATION_GATE_CLOSED"]
    };

    return {
      overallValid: false,
      consensusScore: 0,
      opinions: [opinion],
      finalMessageTr: "Doğrulama kapısı kapalı. Kaynaksız veya doğrulanmamış sonuç reddedildi.",
      finalMessageEn: "Verification gate closed. Unverified or unbound output rejected.",
      rejectedReasons: ["VERIFICATION_GATE_CLOSED"]
    };
  }

  const roles: Array<[AgentRole, string, string, string]> = [
    ["academic", "Akademik Doğrulayıcı", "Kaynak ve deontik katman doğrulandı; bağımsız emsal incelemesi yapılmalıdır.", "Source and deontic layers verified; independent precedent review remains necessary."],
    ["judge", "Hakim", "Doğrulanmış kaynak kümesi üzerinden tarafsız değerlendirme yapılmalıdır.", "A neutral assessment should be made against the verified source set."],
    ["prosecutor", "Savcı", "İddianın dayanakları ve karşı deliller birlikte incelenmelidir.", "The claim's grounds and counter-evidence should be examined together."],
    ["defense", "Savunma", "Lehe ve aleyhe emsal ayrımı ayrıca incelenmelidir.", "Favorable and adverse precedents should be examined separately."]
  ];

  const opinions = roles.map(([role, roleTr, opinionTr, opinionEn]) => ({
    role,
    roleTr,
    opinionTr,
    opinionEn,
    confidence: deonticResult.confidence,
    citedSourceIds: [...sourceIds],
    flags: []
  }));

  return {
    overallValid: true,
    consensusScore: 1,
    opinions,
    finalMessageTr: "Konsorsiyum yalnızca doğrulanmış kaynak kümesi üzerinde çalıştı; hukuki sonuç ayrıca uzman incelemesine tabidir.",
    finalMessageEn: "The consortium operated only on the verified source set; legal conclusions remain subject to professional review.",
    rejectedReasons: []
  };
}
