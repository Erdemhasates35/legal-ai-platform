import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/guards";
export const runtime = "nodejs";

async function requireAdminApi() {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, response: NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 }) };
  if (!profile.is_approved || profile.role !== "admin") return { profile: null, response: NextResponse.json({ error: "ADMIN_REQUIRED" }, { status: 403 }) };
  return { profile, response: null };
}

export async function GET() {
  const { profile, response } = await requireAdminApi(); if (response) return response;
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("profiles").select("id,email,full_name,role,tier,is_approved,approved_at,created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "USERS_LOOKUP_FAILED" }, { status: 503 });
  return NextResponse.json({ adminId: profile!.id, users: data ?? [] });
}

export async function PATCH(request: Request) {
  const { profile, response } = await requireAdminApi(); if (response) return response;
  const body = (await request.json()) as { userId?: unknown; action?: unknown; tier?: unknown };
  const userId = typeof body.userId === "string" ? body.userId : "";
  const action = body.action === "approve" || body.action === "reject" || body.action === "tier_change" ? body.action : null;
  const tier = body.tier === "free" || body.tier === "private" ? body.tier : null;
  if (!userId || !action || (action === "tier_change" && !tier)) return NextResponse.json({ error: "INVALID_ADMIN_OPERATION" }, { status: 422 });
  if (userId === profile!.id && action === "reject") return NextResponse.json({ error: "SELF_REJECTION_FORBIDDEN" }, { status: 409 });

  const supabase = await createServerClient();
  const { data: target, error: targetError } = await supabase.from("profiles").select("id,role,tier,is_approved").eq("id", userId).maybeSingle();
  if (targetError || !target) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  if (action === "approve") {
    const { error } = await supabase.from("profiles").update({ is_approved: true, role: target.role === "pending" ? "user" : target.role, approved_at: new Date().toISOString(), approved_by: profile!.id }).eq("id", userId);
    if (error) return NextResponse.json({ error: "APPROVAL_FAILED" }, { status: 500 });
    const { error: auditError } = await supabase.from("approval_logs").insert({ user_id: userId, action: "approve", old_value: String(target.is_approved), new_value: "true", performed_by: profile!.id });
    if (auditError) return NextResponse.json({ error: "AUDIT_FAILED" }, { status: 500 });
  }
  if (action === "reject") {
    const { error } = await supabase.from("profiles").update({ is_approved: false, role: "pending" }).eq("id", userId);
    if (error) return NextResponse.json({ error: "REJECTION_FAILED" }, { status: 500 });
    const { error: auditError } = await supabase.from("approval_logs").insert({ user_id: userId, action: "reject", old_value: String(target.is_approved), new_value: "false", performed_by: profile!.id });
    if (auditError) return NextResponse.json({ error: "AUDIT_FAILED" }, { status: 500 });
  }
  if (action === "tier_change" && tier) {
    const { error } = await supabase.from("profiles").update({ tier }).eq("id", userId);
    if (error) return NextResponse.json({ error: "TIER_CHANGE_FAILED" }, { status: 500 });
    const { error: auditError } = await supabase.from("approval_logs").insert({ user_id: userId, action: "tier_change", old_value: target.tier, new_value: tier, performed_by: profile!.id });
    if (auditError) return NextResponse.json({ error: "AUDIT_FAILED" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
