import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
export const runtime = "nodejs";

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!bootstrapEmail || user.email.toLowerCase() !== bootstrapEmail) return NextResponse.json({ error: "BOOTSTRAP_NOT_AUTHORIZED" }, { status: 403 });

  const { data: success, error } = await supabase.rpc("bootstrap_admin", { bootstrap_email: bootstrapEmail });
  if (error) return NextResponse.json({ error: "BOOTSTRAP_FAILED" }, { status: 500 });
  if (!success) return NextResponse.json({ error: "BOOTSTRAP_NOT_AVAILABLE" }, { status: 409 });
  return NextResponse.json({ success: true, role: "admin", isApproved: true });
}
