import assert from "node:assert/strict";

interface DeonticRule {
  id: string;
  statuteCode: string;
  formalExpression: string;
  naturalLanguageTr: string;
  naturalLanguageEn: string;
}

interface Claim {
  id: string;
  proposition: string;
  claimedSourceIds: string[];
}

function isSatisfiable(rule: DeonticRule, claim: Claim): boolean {
  return (
    claim.proposition.trim().length > 0 &&
    claim.claimedSourceIds.includes(rule.id) &&
    (rule.formalExpression.includes("→") || rule.formalExpression.includes("->"))
  );
}

const sampleRules: DeonticRule[] = [
  {
    id: "TR-CMK-102",
    statuteCode: "CMK 102",
    formalExpression: "□ (tutukluluk_süresi > makul_süre → tahliye_zorunlu)",
    naturalLanguageTr: "Örnek deontik kural.",
    naturalLanguageEn: "Example deontic rule."
  },
  {
    id: "ECHR-ART5",
    statuteCode: "AİHS m. 5",
    formalExpression: "□ (detention_exceeds_reasonable_time → violation_Art5)",
    naturalLanguageTr: "Örnek ECHR kuralı.",
    naturalLanguageEn: "Example ECHR rule."
  }
];

const sampleClaim: Claim = {
  id: "claim-001",
  proposition: "Örnek iddia",
  claimedSourceIds: ["TR-CMK-102", "ECHR-ART5"]
};

for (const rule of sampleRules) {
  assert.equal(isSatisfiable(rule, sampleClaim), true);
}

assert.equal(
  isSatisfiable(sampleRules[0], { ...sampleClaim, claimedSourceIds: [] }),
  false
);
assert.equal(
  isSatisfiable(sampleRules[0], { ...sampleClaim, claimedSourceIds: ["UNKNOWN"] }),
  false
);

console.log("deontic checks: PASS");
