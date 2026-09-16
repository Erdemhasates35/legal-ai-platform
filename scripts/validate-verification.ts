import assert from "node:assert/strict";
import { verifyClaim } from "../src/lib/verification/pipeline";

const rules = [
  {
    id: "rule-1",
    statuteCode: "CMK-100",
    formalExpression: "A → B",
    naturalLanguageTr: "Örnek kural",
    naturalLanguageEn: "Example rule",
    sourceArticle: "CMK 100",
    isActive: true
  }
];

const valid = verifyClaim({
  claim: "Örnek hukuki iddia",
  sourceIds: ["rule-1"],
  rules
});
assert.equal(valid.isValid, true);
assert.deepEqual(valid.sourceIds, ["rule-1"]);

const missing = verifyClaim({ claim: "Kaynaksız iddia", sourceIds: [], rules });
assert.equal(missing.isValid, false);
assert.equal(missing.rejectedReason, "MISSING_SOURCE_ID");

const unknown = verifyClaim({ claim: "Bilinmeyen kaynak", sourceIds: ["does-not-exist"], rules });
assert.equal(unknown.isValid, false);
assert.equal(unknown.rejectedReason, "UNKNOWN_SOURCE_ID");

const inactive = verifyClaim({
  claim: "Pasif kaynak",
  sourceIds: ["rule-1"],
  rules: [{ ...rules[0], isActive: false }]
});
assert.equal(inactive.isValid, false);
assert.equal(inactive.rejectedReason, "INACTIVE_SOURCE_ID");

console.log("verification checks: PASS");
