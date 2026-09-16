"use client";

import { useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "pending" | "user" | "admin";
  tier: "free" | "private";
  is_approved: boolean;
};

export function AdminUserTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [busy, setBusy] = useState<string | null>(null);

  async function mutate(userId: string, action: "approve" | "reject" | "tier_change", tier?: "free" | "private") {
    setBusy(`${userId}:${action}`);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, action, tier })
      });
      if (!response.ok) throw new Error("ADMIN_OPERATION_FAILED");
      const updated = await fetch("/api/admin/users", { cache: "no-store" }).then((res) => res.json());
      setUsers(updated.users ?? []);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-[hsl(var(--text-muted))]">
          <tr>
            <th className="px-3 py-3">Kullanıcı</th>
            <th className="px-3 py-3">Durum</th>
            <th className="px-3 py-3">Katman</th>
            <th className="px-3 py-3">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-[hsl(var(--border))]">
              <td className="px-3 py-4">
                <div className="font-medium text-[hsl(var(--text-primary))]">{user.full_name || "İsimsiz"}</div>
                <div className="text-xs text-[hsl(var(--text-muted))]">{user.email}</div>
              </td>
              <td className="px-3 py-4 text-[hsl(var(--text-secondary))]">{user.is_approved ? "Onaylı" : "Bekliyor"}</td>
              <td className="px-3 py-4 text-[hsl(var(--text-secondary))]">{user.tier === "private" ? "Pro++" : "Free"}</td>
              <td className="px-3 py-4">
                <div className="flex flex-wrap gap-2">
                  {!user.is_approved && user.role !== "admin" && (
                    <button disabled={busy !== null} onClick={() => mutate(user.id, "approve")} className="plasma-button">Onayla</button>
                  )}
                  {user.role !== "admin" && user.is_approved && (
                    <button disabled={busy !== null} onClick={() => mutate(user.id, "reject")} className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs">Askıya al</button>
                  )}
                  {user.role !== "admin" && (
                    <button disabled={busy !== null} onClick={() => mutate(user.id, "tier_change", user.tier === "private" ? "free" : "private")} className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs">
                      {user.tier === "private" ? "Free" : "Pro++"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
