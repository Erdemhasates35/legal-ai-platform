export type Tier = "free" | "private";

export const ENTITLEMENTS = {
  free: {
    deonticVerification: true,
    basicFileScan: true,
    sourceIdEnforcement: true,
    uyapUdf: false,
    citationGraph: false,
    consortium: false,
    advancedCaseAnalysis: false
  },
  private: {
    deonticVerification: true,
    basicFileScan: true,
    sourceIdEnforcement: true,
    uyapUdf: true,
    citationGraph: true,
    consortium: true,
    advancedCaseAnalysis: true
  }
} as const;

export function hasEntitlement(tier: Tier, feature: keyof typeof ENTITLEMENTS.free) {
  return ENTITLEMENTS[tier][feature];
}
