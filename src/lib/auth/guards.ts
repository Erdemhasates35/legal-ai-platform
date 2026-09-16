import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export interface CurrentProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "pending" | "user" | "admin";
  tier: "free" | "private";
  is_approved: boolean;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,tier,is_approved")
    .eq("id", user.id)
    .maybeSingle();

  return (data as CurrentProfile | null) ?? null;
}

export async function requireApprovedUser() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  if (!profile.is_approved) redirect("/pending");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireApprovedUser();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}
