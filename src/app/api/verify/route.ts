import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { verifyClaim } from "@/lib/verification/pipeline";
import type { DeonticRule } from "@/types/legal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_approved")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.is_approved) {
    return NextResponse.json({ error: "APPROVAL_REQUIRED" }, { status: 403 });
  }

  const body = (await request.json()) as { claim?: unknown; sourceIds?: unknown };
  const claim = typeof body.claim === "string" ? body.claim : "";
  const sourceIds = Array.isArray(body.sourceIds)
    ? body.sourceIds.filter((value): value is string => typeof value === "string")
    : [];

  if (!claim || sourceIds.length === 0) {
    return NextResponse.json(
      verifyClaim({ claim, sourceIds, rules: [] }),
      { status: 422 }
    );
  }

  const { data: rules, error: rulesError } = await supabase
    .from("deontic_rules")
    .select("id, statute_code, formal_expression, natural_language_tr, natural_language_en, source_article, is_active")
    .in("id", sourceIds);

  if (rulesError) {
    return NextResponse.json({ error: "SOURCE_LOOKUP_FAILED" }, { status: 503 });
  }

  const normalizedRules: DeonticRule[] = (rules ?? []).map((rule) => ({
    id: rule.id,
    statuteCode: rule.statute_code,
    formalExpression: rule.formal_expression,
    naturalLanguageTr: rule.natural_language_tr,
    naturalLanguageEn: rule.natural_language_en,
    sourceArticle: rule.source_article,
    isActive: rule.is_active
  }));

  const result = verifyClaim({ claim, sourceIds, rules: normalizedRules });
  return NextResponse.json(result, { status: result.isValid ? 200 : 422 });
}
