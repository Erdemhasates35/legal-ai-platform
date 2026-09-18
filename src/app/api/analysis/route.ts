import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";
import { createServerClient } from "@/lib/supabase/server";
import { rankCitationGraph } from "@/lib/citation/graph";
import { verifyClaim } from "@/lib/verification/pipeline";
import type { DeonticRule, PrecedentEdge } from "@/types/legal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }
  if (!profile.is_approved) {
    return NextResponse.json({ error: "APPROVAL_REQUIRED" }, { status: 403 });
  }
  if (!hasEntitlement(profile.tier, "advancedCaseAnalysis")) {
    return NextResponse.json({ error: "PRO_PLUS_REQUIRED" }, { status: 403 });
  }

  const body = (await request.json()) as { claim?: unknown; sourceIds?: unknown };
  const claim = typeof body.claim === "string" ? body.claim.trim() : "";
  const sourceIds = Array.isArray(body.sourceIds)
    ? body.sourceIds.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];

  if (!claim) {
    return NextResponse.json(
      {
        error: "EMPTY_CLAIM",
        verification: {
          isValid: false,
          confidence: 0,
          sourceIds: [],
          messageTr: "İddia metni boş olamaz.",
          messageEn: "Claim cannot be empty.",
        },
        verified: false,
      },
      { status: 422 }
    );
  }

  if (sourceIds.length === 0) {
    return NextResponse.json(
      {
        error: "MISSING_SOURCE_ID",
        verification: {
          isValid: false,
          confidence: 0,
          sourceIds: [],
          messageTr: "source_id gerekli. Doğrulama Panelinden dosya UUID kopyalayın.",
          messageEn: "source_id required.",
        },
        verified: false,
      },
      { status: 422 }
    );
  }

  const supabase = await createServerClient();

  // 1) Yüklenen belgeler (user_files) — asıl source_id kaynağı
  const { data: fileRows, error: fileError } = await supabase
    .from("user_files")
    .select("id,original_name,user_id")
    .in("id", sourceIds)
    .eq("user_id", profile.id);

  if (fileError) {
    return NextResponse.json(
      { error: "KAYNAK_ARAMA_BASARISIZ", detail: fileError.message },
      { status: 503 }
    );
  }

  const foundFileIds = new Set((fileRows ?? []).map((f) => f.id));
  const missingFiles = sourceIds.filter((id) => !foundFileIds.has(id));

  // 2) Opsiyonel deontik kurallar (tablo yoksa veya boşsa sorun değil)
  let rules: DeonticRule[] = [];
  const { data: ruleRows, error: ruleError } = await supabase
    .from("deontic_rules")
    .select(
      "id,statute_code,formal_expression,natural_language_tr,natural_language_en,source_article,is_active"
    )
    .in("id", sourceIds);

  if (!ruleError && ruleRows) {
    rules = ruleRows.map((rule) => ({
      id: rule.id,
      statuteCode: rule.statute_code,
      formalExpression: rule.formal_expression,
      naturalLanguageTr: rule.natural_language_tr,
      naturalLanguageEn: rule.natural_language_en,
      sourceArticle: rule.source_article,
      isActive: rule.is_active,
    }));
  }

  const ruleIds = new Set(rules.map((r) => r.id));

  // Her source_id ya user_files ya da deontic_rules içinde olmalı
  const unknown = sourceIds.filter((id) => !foundFileIds.has(id) && !ruleIds.has(id));
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        error: "UNKNOWN_SOURCE_ID",
        verification: {
          isValid: false,
          confidence: 0,
          sourceIds,
          messageTr: `Kayıtlı olmayan source_id: ${unknown.join(", ")}. Doğrulama Panelindeki UUID kullanın.`,
          messageEn: `Unknown source_id: ${unknown.join(", ")}`,
        },
        verified: false,
      },
      { status: 422 }
    );
  }

  // Belge kaynaklı doğrulama: kullanıcıya ait dosyalar yeterli
  if (foundFileIds.size > 0 && missingFiles.length === 0 && rules.length === 0) {
    const fileNames = (fileRows ?? []).map((f) => f.original_name).join(", ");
    let citationRank: ReturnType<typeof rankCitationGraph> = [];
    const { data: edgeRows } = await supabase
      .from("precedents")
      .select("id,source_id,target_id,citation_type,weight")
      .limit(5000);
    if (edgeRows) {
      const edges: PrecedentEdge[] = edgeRows.map((edge) => ({
        id: edge.id,
        sourceId: edge.source_id,
        targetId: edge.target_id,
        citationType: edge.citation_type,
        weight: Number(edge.weight ?? 0),
      }));
      citationRank = rankCitationGraph(edges);
    }

    return NextResponse.json({
      verified: true,
      sourceIds,
      verification: {
        isValid: true,
        confidence: 1,
        sourceIds,
        deonticScore: 0,
        gnnRank: citationRank.length,
        messageTr: `İddia, kayıtlı belge kaynaklarına bağlandı (${fileNames}). Deontik kural seti henüz eklenmemiş; belge kanıtı geçerli.`,
        messageEn: `Claim linked to registered file sources (${fileNames}).`,
      },
      citationRank,
      evidencePolicy:
        "Document source_id from user_files is accepted. Deontic rules optional when files are present.",
    });
  }

  // Deontik kurallar varsa klasik pipeline
  const verification = verifyClaim({ claim, sourceIds, rules });
  if (!verification.isValid) {
    return NextResponse.json(
      { verification, citationRank: [], verified: false, error: verification.rejectedReason },
      { status: 422 }
    );
  }

  let citationRank: ReturnType<typeof rankCitationGraph> = [];
  const { data: edgeRows } = await supabase
    .from("precedents")
    .select("id,source_id,target_id,citation_type,weight")
    .limit(5000);
  if (edgeRows) {
    const edges: PrecedentEdge[] = edgeRows.map((edge) => ({
      id: edge.id,
      sourceId: edge.source_id,
      targetId: edge.target_id,
      citationType: edge.citation_type,
      weight: Number(edge.weight ?? 0),
    }));
    citationRank = rankCitationGraph(edges);
  }

  return NextResponse.json({
    verified: true,
    sourceIds: verification.sourceIds,
    verification,
    citationRank,
    evidencePolicy:
      "Verified when every source_id exists in user_files or active deontic_rules.",
  });
}
