import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";
import { createServiceClient } from "@/lib/supabase/client";
import { rankCitationGraph } from "@/lib/citation/graph";
import { verifyClaim } from "@/lib/verification/pipeline";
import type { DeonticRule, PrecedentEdge } from "@/types/legal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!profile.is_approved) return NextResponse.json({ error: "APPROVAL_REQUIRED" }, { status: 403 });
  if (!hasEntitlement(profile.tier, "advancedCaseAnalysis")) {
    return NextResponse.json({ error: "PRO_PLUS_REQUIRED" }, { status: 403 });
  }

  const body = (await request.json()) as { claim?: unknown; sourceIds?: unknown };
  const claim = typeof body.claim === "string" ? body.claim.trim() : "";
  const sourceIds = Array.isArray(body.sourceIds)
    ? body.sourceIds.filter((value): value is string => typeof value === "string")
    : [];

  const service = createServiceClient();
  const { data: ruleRows, error: ruleError } = await service
    .from("deontic_rules")
    .select("id,statute_code,formal_expression,natural_language_tr,natural_language_en,source_article,is_active")
    .in("id", sourceIds);
  if (ruleError) return NextResponse.json({ error: "SOURCE_LOOKUP_FAILED" }, { status: 503 });

  const rules: DeonticRule[] = (ruleRows ?? []).map((rule) => ({
    id: rule.id,
    statuteCode: rule.statute_code,
    formalExpression: rule.formal_expression,
    naturalLanguageTr: rule.natural_language_tr,
    naturalLanguageEn: rule.natural_language_en,
    sourceArticle: rule.source_article,
    isActive: rule.is_active
  }));

  const verification = verifyClaim({ claim, sourceIds, rules });
  if (!verification.isValid) {
    return NextResponse.json({ verification, citationRank: [], verified: false }, { status: 422 });
  }

  const { data: edgeRows, error: edgeError } = await service
    .from("precedents")
    .select("id,source_id,target_id,citation_type,weight")
    .limit(5000);
  if (edgeError) return NextResponse.json({ error: "CITATION_GRAPH_FAILED" }, { status: 503 });

  const edges: PrecedentEdge[] = (edgeRows ?? []).map((edge) => ({
    id: edge.id,
    sourceId: edge.source_id,
    targetId: edge.target_id,
    citationType: edge.citation_type,
    weight: Number(edge.weight ?? 0)
  }));

  return NextResponse.json({
    verified: true,
    sourceIds: verification.sourceIds,
    verification,
    citationRank: rankCitationGraph(edges),
    evidencePolicy: "Verified output is emitted only when every supplied source_id exists, is active, and passes the deontic gate."
  });
}
