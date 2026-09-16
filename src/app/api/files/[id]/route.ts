import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: { id: string } }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("is_approved,role").eq("id", user.id).maybeSingle();
  if (!profile?.is_approved) return NextResponse.json({ error: "APPROVAL_REQUIRED" }, { status: 403 });

  const { data: file, error } = await supabase.from("user_files").select("id,user_id,storage_path").eq("id", context.params.id).maybeSingle();
  if (error || !file) return NextResponse.json({ error: "FILE_NOT_FOUND" }, { status: 404 });
  if (file.user_id !== user.id && profile.role !== "admin") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { data: signed, error: signedError } = await supabase.storage.from("legal-files").createSignedUrl(file.storage_path, 60);
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: "SIGNED_URL_FAILED" }, { status: 502 });
  return NextResponse.redirect(signed.signedUrl);
}
