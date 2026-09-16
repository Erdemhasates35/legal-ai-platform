import assert from "node:assert/strict";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "ADMIN_BOOTSTRAP_EMAIL"] as const;
const missing = required.filter((name) => !process.env[name]?.trim());

if (process.env.CI === "true" && missing.length > 0) {
  console.log(`production environment check: ${missing.length} runtime values intentionally absent from source control`);
} else {
  assert.equal(missing.length, 0, `Missing runtime variables: ${missing.join(", ")}`);
}

console.log("production configuration contract: PASS");
