import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Gerçek dosya yükleme API
 * Supabase Storage'a yükler + user_files tablosuna kayıt eder
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Dosya veya kullanıcı kimliği eksik" },
        { status: 400 }
      );
    }

    // Boyut kontrolü (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dosya boyutu 50 MB sınırını aşıyor" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ext = file.name.split(".").pop() ?? "bin";
    const storagePath = `${userId}/${Date.now()}-${file.name}`;

    // Storage'a yükle
    const { error: uploadError } = await supabase.storage
      .from("legal-files")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Veritabanına kayıt
    const { data: record, error: dbError } = await supabase
      .from("user_files")
      .insert({
        user_id: userId,
        original_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        category: "general",
        is_private: true
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: record,
      message: "Dosya başarıyla yüklendi"
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
