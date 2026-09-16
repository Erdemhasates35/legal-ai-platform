import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { requireAdmin } from "@/lib/auth/guards";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  const service = createServiceClient();
  const { data, error } = await service
    .from("profiles")
    .select("id,email,full_name,role,tier,is_approved,approved_at,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "USERS_LOOKUP_FAILED" }, { status: 503 });
  return NextResponse.json({ adminId: admin.id, users: data ?? [] });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  const body = (await request.json()) as {
    userId?: unknown;
    action?: unknown;
    tier?: unknown;
  };

  const userId = typeof body.userId === "string" ? body.userId : "";
  const action = body.action === "approve" || body.action === "reject" || body.action === "tier_change"
    ? body.action
    : null;
  const tier = body.tier === "free" || body.tier === "private" ? body.tier : null;

  if (!userId || !action || (action === "tier_change" && !tier)) {
    return NextResponse.json({ error: "INVALID_ADMIN_OPERATION" }, { status: 422 });
  }

  const service = createServiceClient();
  const { data: target, error: targetError } = await service
    .from("profiles")
    .select("id,role,tier,is_approved")
    .eq("id", userId)
    .maybeSingle();
  if (targetError || !target) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  if (action === "approve") {
    const { error } = await service.from("profiles").update({ is_approved: true, role: target.role === "pending" ? "user" : target.role, approved_at: new Date().toISOString(), approved_by: admin.id }).eq("id", userId);
    if (error) return NextResponse.json({ error: "APPROVAL_FAILED" }, { status: 500 });
    await service.from("approval_logs").insert({ user_id: userId, action: "approve", old_value: String(target.is_approved), new_value: "true", performed_by: admin.id });
  }

  if (action === "reject") {
    const { error } = await service.from("profiles").update({ is_approved: false, role: "pending" }).eq("id", userId);
    if (error) return NextResponse.json({ error: "REJECTION_FAILED" }, { status: 500 });
    await service.from("approval_logs").insert({ user_id: userId, action: "reject", old_value: String(target.is_approved), new_value: "false", performed_by: admin.id });
  }

  if (action === "tier_change" && tier) {
    const { error } = await service.from("profiles").update({ tier }).eq("id", userId);
    if (error) return NextResponse.json({ error: "TIER_CHANGE_FAILED" }, { status: 500 });
    await service.from("approval_logs").insert({ user_id: userId, action: "tier_change", old_value: target.tier, new_value: tier, performed_by: admin.id });
  }

  return NextResponse.json({ success: true });
}
