import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const authClient = await createServerClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user?.email) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!bootstrapEmail || user.email.toLowerCase() !== bootstrapEmail) {
    return NextResponse.json({ error: "BOOTSTRAP_NOT_AUTHORIZED" }, { status: 403 });
  }

  const service = createServiceClient();
  const { count, error: countError } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (countError) return NextResponse.json({ error: "ADMIN_LOOKUP_FAILED" }, { status: 503 });
  if ((count ?? 0) > 0) return NextResponse.json({ error: "ADMIN_ALREADY_EXISTS" }, { status: 409 });

  const { error: updateError } = await service
    .from("profiles")
    .update({ role: "admin", is_approved: true, approved_at: new Date().toISOString(), approved_by: user.id })
    .eq("id", user.id);

  if (updateError) return NextResponse.json({ error: "BOOTSTRAP_FAILED" }, { status: 500 });

  const { error: logError } = await service.from("approval_logs").insert({
    user_id: user.id,
    action: "approve",
    old_value: "pending",
    new_value: "admin",
    performed_by: user.id,
    note: "Initial administrator bootstrap"
  });

  if (logError) return NextResponse.json({ error: "BOOTSTRAP_AUDIT_FAILED" }, { status: 500 });

  return NextResponse.json({ success: true, role: "admin", isApproved: true });
}
