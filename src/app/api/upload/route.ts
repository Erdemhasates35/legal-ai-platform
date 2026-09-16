import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { validateUpload } from "@/lib/file-processor/file-validation";

export const runtime = "nodejs";
function errorStatus(code: string) { return ["FILE_TOO_LARGE", "UNSUPPORTED_FILE_TYPE", "MIME_EXTENSION_MISMATCH"].includes(code) ? 400 : 500; }

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_approved").eq("id", user.id).maybeSingle();
  if (!profile?.is_approved) return NextResponse.json({ error: "APPROVAL_REQUIRED" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    const validated = validateUpload(file);
    const storagePath = `${user.id}/${validated.storageName}`;

    const { error: uploadError } = await supabase.storage.from("legal-files").upload(storagePath, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (uploadError) return NextResponse.json({ error: "STORAGE_UPLOAD_FAILED" }, { status: 502 });

    const { data: record, error: dbError } = await supabase.from("user_files").insert({
      user_id: user.id, original_name: validated.safeName, storage_path: storagePath,
      mime_type: file.type || "application/octet-stream", size_bytes: file.size, category: "general", is_private: true
    }).select().single();

    if (dbError) {
      await supabase.storage.from("legal-files").remove([storagePath]);
      return NextResponse.json({ error: "FILE_RECORD_FAILED" }, { status: 500 });
    }
    return NextResponse.json({ success: true, file: record });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UPLOAD_FAILED";
    return NextResponse.json({ error: code }, { status: errorStatus(code) });
  }
}
