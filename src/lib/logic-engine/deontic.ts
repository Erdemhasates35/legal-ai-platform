import type { DeonticRule, VerificationResult } from "@/types/legal";

/**
 * Deterministic deontic gate.
 * It verifies only explicit source binding and formal-expression structure.
 * It does not infer facts that are absent from the supplied source records.
 */
export function validateClaim(
  claimProposition: string,
  claimedSourceIds: string[],
  rules: DeonticRule[]
): VerificationResult {
  const claim = claimProposition.trim();
  const sourceIds = Array.from(new Set(claimedSourceIds.map((id) => id.trim()).filter(Boolean)));

  if (!claim) return rejected(sourceIds, "EMPTY_CLAIM", "İddia metni boş olamaz.", "Claim cannot be empty.");
  if (sourceIds.length === 0) return rejected(sourceIds, "MISSING_SOURCE_ID", "source_id zorunludur; iddia reddedildi.", "source_id is required; claim rejected.");

  const byId = new Map(rules.map((rule) => [rule.id, rule]));
  const unknown = sourceIds.find((id) => !byId.has(id));
  if (unknown) return rejected(sourceIds, "UNKNOWN_SOURCE_ID", `Kayıtlı olmayan source_id: ${unknown}`, `Unknown source_id: ${unknown}`);

  const inactive = sourceIds.find((id) => !byId.get(id)!.isActive);
  if (inactive) return rejected(sourceIds, "INACTIVE_SOURCE_ID", `Pasif source_id: ${inactive}`, `Inactive source_id: ${inactive}`);

  const invalid = sourceIds.find((id) => {
    const expression = byId.get(id)!.formalExpression;
    return !expression.includes("→") && !expression.includes("->");
  });
  if (invalid) return rejected(sourceIds, "INVALID_FORMAL_EXPRESSION", `Geçersiz deontik ifade: ${invalid}`, `Invalid deontic expression: ${invalid}`);

  return {
    isValid: true,
    sourceIds,
    deonticScore: 1,
    gnnRank: 0,
    confidence: 1,
    messageTr: "İddia açık source_id bağları ve geçerli deontik ifadelerle doğrulandı.",
    messageEn: "Claim verified with explicit source_id bindings and valid deontic expressions."
  };
}

function rejected(sourceIds: string[], reason: string, messageTr: string, messageEn: string): VerificationResult {
  return { isValid: false, sourceIds, deonticScore: 0, gnnRank: 0, confidence: 0, messageTr, messageEn, rejectedReason: reason };
}

export function formalizeStatute(statuteCode: string, naturalTr: string, naturalEn: string): DeonticRule {
  const normalized = statuteCode.replace(/\s+/g, "_");
  return {
    id: `AUTO-${statuteCode.replace(/\s+/g, "-")}`,
    statuteCode,
    formalExpression: `□ (${normalized} → zorunlu_sonuç)`,
    naturalLanguageTr: naturalTr,
    naturalLanguageEn: naturalEn,
    sourceArticle: statuteCode,
    isActive: true
  };
}
