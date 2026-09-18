import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { hasEntitlement } from "@/lib/auth/entitlements";
import { createServerClient } from "@/lib/supabase/server";
import { extractDocumentText, claimDocumentOverlap } from "@/lib/file-processor/extract-text";
import { detectUyapStructure } from "@/lib/file-processor/uyap-udf";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST { sourceId, claim? }
 * Downloads the user's file from Storage, extracts text, runs UYAP structure detect,
 * optional claim overlap. Every field is grounded in file bytes — no invented facts.
 */
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  if (!profile.is_approved) return NextResponse.json({ error: "APPROVAL_REQUIRED" }, { status: 403 });
  if (!hasEntitlement(profile.tier, "advancedCaseAnalysis")) {
    return NextResponse.json({ error: "PRO_PLUS_REQUIRED" }, { status: 403 });
  }

  const body = (await request.json()) as { sourceId?: unknown; claim?: unknown };
  const sourceId = typeof body.sourceId === "string" ? body.sourceId.trim() : "";
  const claim = typeof body.claim === "string" ? body.claim.trim() : "";

  if (!sourceId) {
    return NextResponse.json({ error: "MISSING_SOURCE_ID" }, { status: 422 });
  }

  const supabase = await createServerClient();
  const { data: fileRow, error: fileError } = await supabase
    .from("user_files")
    .select("id,original_name,storage_path,mime_type,user_id")
    .eq("id", sourceId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (fileError || !fileRow) {
    return NextResponse.json(
      { error: "UNKNOWN_SOURCE_ID", messageTr: "Dosya sizin hesabınızda bulunamadı." },
      { status: 404 }
    );
  }

  const { data: blob, error: dlError } = await supabase.storage
    .from("legal-files")
    .download(fileRow.storage_path);

  if (dlError || !blob) {
    return NextResponse.json(
      { error: "STORAGE_DOWNLOAD_FAILED", detail: dlError?.message },
      { status: 502 }
    );
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const extracted = extractDocumentText(buffer, fileRow.original_name, fileRow.mime_type);
  const structure = detectUyapStructure(extracted.text || fileRow.original_name);
  const overlap =
    claim.length > 0
      ? claimDocumentOverlap(claim, extracted.text)
      : { overlapRatio: 0, matchedTokens: [] as string[] };

  const grounded =
    extracted.charCount > 40
      ? overlap.overlapRatio >= 0.15 || claim.length === 0
      : claim.length === 0;

  return NextResponse.json({
    sourceId: fileRow.id,
    fileName: fileRow.original_name,
    extraction: {
      method: extracted.method,
      charCount: extracted.charCount,
      warnings: extracted.warnings,
      preview: extracted.text.slice(0, 1500),
    },
    structure,
    claimOverlap: {
      ratio: overlap.overlapRatio,
      matchedTokens: overlap.matchedTokens,
      grounded,
    },
    policyTr:
      "Tüm alanlar dosya baytlarından türetilir. Metinde olmayan mahkeme/esas/karar uydurulmaz. Tarama PDF'lerde OCR olmadan metin zayıf kalabilir.",
    policyEn:
      "All fields derive from file bytes. Court/docket fields are never invented. Scanned PDFs need OCR for rich text.",
  });
}
