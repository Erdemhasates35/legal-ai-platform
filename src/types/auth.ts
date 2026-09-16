/**
 * Auth, Role, Tier and Approval types
 * Zero-hallucination: every field maps directly to the verified schema.
 */

export type UserRole = "pending" | "user" | "admin";
export type UserTier = "free" | "private";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  tier: UserTier;
  isApproved: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  monthlyFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: UserTier;
  status: "active" | "cancelled" | "expired" | "pending_payment";
  monthlyFee: number;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
}

export interface UserFile {
  id: string;
  userId: string;
  originalName: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
  category: "general" | "case" | "precedent" | "evidence" | "other";
  isPrivate: boolean;
  createdAt: string;
}

export interface ApprovalLog {
  id: string;
  userId: string;
  action: "approve" | "reject" | "tier_change" | "fee_change";
  oldValue: string | null;
  newValue: string | null;
  performedBy: string;
  note: string | null;
  createdAt: string;
}

/** Admin only – used in admin panel */
export interface AdminApprovalPayload {
  userId: string;
  approve: boolean;
  tier?: UserTier;
  monthlyFee?: number;
  note?: string;
}
