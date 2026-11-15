/**
 * Production Deontic Contract
 * Legal AI Platform — zero-hallucination boundary
 *
 * This module only defines types and pure validation helpers.
 * It does not invent legal conclusions.
 */

export type DeonticStatus = "obligatory" | "permitted" | "prohibited" | "unknown";

export interface DeonticClaim {
  claimId: string;
  text: string;
  status: DeonticStatus;
  sources: string[]; // must be non-empty for verified status
  confidence: number; // 0-1, only meaningful after verification
}

export interface VerificationResult {
  claimId: string;
  deonticPassed: boolean;
  citationPassed: boolean;
  qnlpPassed: boolean;
  overall: "verified" | "rejected" | "pending";
  reasons: string[];
}

/**
 * Pure function: a claim can only be "verified" when all three gates pass
 * and at least one source is present.
 */
export function evaluateConsortiumGate(
  deonticPassed: boolean,
  citationPassed: boolean,
  qnlpPassed: boolean,
  sources: string[]
): VerificationResult["overall"] {
  if (sources.length === 0) return "rejected";
  if (deonticPassed && citationPassed && qnlpPassed) return "verified";
  return "rejected";
}

export function assertNoHallucination(result: VerificationResult): void {
  if (result.overall === "verified" && result.reasons.some(r => r.includes("inferred without source"))) {
    throw new Error("Hallucination detected: verified claim lacks source grounding");
  }
}
