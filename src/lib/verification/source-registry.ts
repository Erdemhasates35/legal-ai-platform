import type { DeonticRule } from "@/types/legal";

export type LegalSourceKind = "deontic_rule";

export interface LegalSourceRef {
  sourceId: string;
  kind: LegalSourceKind;
  active: boolean;
}

export function buildSourceRegistry(rules: DeonticRule[]): Map<string, LegalSourceRef> {
  return new Map(
    rules.map((rule) => [
      rule.id,
      {
        sourceId: rule.id,
        kind: "deontic_rule",
        active: rule.isActive
      }
    ])
  );
}
