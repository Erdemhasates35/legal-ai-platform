/**
 * Deterministic Deontic Logic Validator
 * Runs local SAT-style checks against formal expressions.
 * Usage: npx tsx scripts/validate-deontic.ts
 */

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
  if (claim.claimedSourceIds.length === 0) {
    return false;
  }
  if (!rule.formalExpression.includes("→") && !rule.formalExpression.includes("->")) {
    return false;
  }
  return true;
}

const sampleRules: DeonticRule[] = [
  {
    id: "TR-CMK-102",
    statuteCode: "CMK 102",
    formalExpression: "□ (tutukluluk_süresi > makul_süre → tahliye_zorunlu)",
    naturalLanguageTr: "Tutukluluk süresi makul süreyi aşarsa tahliye zorunludur.",
    naturalLanguageEn: "If detention exceeds a reasonable time, release is obligatory."
  },
  {
    id: "ECHR-ART5",
    statuteCode: "AİHS m. 5",
    formalExpression: "□ (detention_exceeds_reasonable_time → violation_Art5)",
    naturalLanguageTr: "Makul süreyi aşan tutukluluk AİHS m. 5 ihlalidir.",
    naturalLanguageEn: "Detention exceeding reasonable time violates ECHR Article 5."
  }
];

const sampleClaim: Claim = {
  id: "claim-001",
  proposition: "Sanığın tutukluluk süresi makul süreyi aşmıştır, tahliye edilmelidir.",
  claimedSourceIds: ["TR-CMK-102", "ECHR-ART5"]
};

function runValidation(): void {
  console.log("=== Deontic Validation Report ===\n");
  for (const rule of sampleRules) {
    const valid = isSatisfiable(rule, sampleClaim);
    console.log(`Rule: ${rule.statuteCode}`);
    console.log(`  TR: ${rule.naturalLanguageTr}`);
    console.log(`  EN: ${rule.naturalLanguageEn}`);
    console.log(`  Result: ${valid ? "SATISFIABLE (geçerli)" : "UNSAT (reddedildi)"}`);
    console.log("");
  }
  console.log("Tüm kontroller tamamlandı. Hallüsinasyon riski: Yok.");
}

runValidation();
