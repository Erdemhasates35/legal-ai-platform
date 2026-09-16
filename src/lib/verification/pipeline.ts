import type { DeonticRule, VerificationResult } from "@/types/legal";

export interface VerificationInput {
  claim: string;
  sourceIds: string[];
  rules: DeonticRule[];
}

function reject(
  sourceIds: string[],
  reason: string,
  messageTr: string,
  messageEn: string
): VerificationResult {
  return {
    isValid: false,
    sourceIds,
    deonticScore: 0,
    gnnRank: 0,
    confidence: 0,
    messageTr,
    messageEn,
    rejectedReason: reason
  };
}

export function verifyClaim(input: VerificationInput): VerificationResult {
  const claim = input.claim.trim();
  const sourceIds = [...new Set(input.sourceIds.map((id) => id.trim()).filter(Boolean))];

  if (!claim) {
    return reject(sourceIds, "EMPTY_CLAIM", "İddia metni boş olamaz.", "Claim cannot be empty.");
  }

  if (sourceIds.length === 0) {
    return reject(
      [],
      "MISSING_SOURCE_ID",
      "Kaynak kimliği (source_id) bulunamadı. İddia reddedildi.",
      "No source_id provided. Claim rejected."
    );
  }

  const ruleById = new Map(input.rules.map((rule) => [rule.id, rule]));
  const unknown = sourceIds.find((id) => !ruleById.has(id));
  if (unknown) {
    return reject(
      sourceIds,
      "UNKNOWN_SOURCE_ID",
      `Kaynak kimliği kayıtlı değil: ${unknown}`,
      `Unknown source_id: ${unknown}`
    );
  }

  const inactive = sourceIds.find((id) => !ruleById.get(id)!.isActive);
  if (inactive) {
    return reject(
      sourceIds,
      "INACTIVE_SOURCE_ID",
      `Kaynak kimliği aktif değil: ${inactive}`,
      `Inactive source_id: ${inactive}`
    );
  }

  const matchedRules = sourceIds.map((id) => ruleById.get(id)!);
  const invalidExpression = matchedRules.find(
    (rule) => !rule.formalExpression.includes("→") && !rule.formalExpression.includes("->")
  );

  if (invalidExpression) {
    return reject(
      sourceIds,
      "INVALID_FORMAL_EXPRESSION",
      `Kaynağın deontik ifadesi geçersiz: ${invalidExpression.id}`,
      `Invalid deontic expression for source_id: ${invalidExpression.id}`
    );
  }

  return {
    isValid: true,
    sourceIds,
    deonticScore: 1,
    gnnRank: 0,
    confidence: 1,
    messageTr: "İddia kaynak kimliği ve deontik kurallarla doğrulandı.",
    messageEn: "Claim verified against registered source ids and deontic rules."
  };
}
