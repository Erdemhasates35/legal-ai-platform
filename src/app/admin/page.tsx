import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { requireAdmin } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data: users } = await supabase.from("profiles").select("id,email,full_name,role,tier,is_approved").order("created_at", { ascending: false });

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">Kurumsal Yönetim</p><h1 className="mt-2 text-3xl font-bold text-[hsl(var(--text-primary))]">Yönetici Paneli</h1><p className="mt-2 text-[hsl(var(--text-secondary))]">Kullanıcı onayı, Free/Pro++ katman yönetimi ve denetim izi.</p></header>
      <section className="plasma-card p-6"><h2 className="mb-5 text-lg font-semibold text-[hsl(var(--text-primary))]">Kullanıcılar</h2><AdminUserTable initialUsers={users ?? []} /></section>
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="plasma-card p-6"><h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Free</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--text-secondary))]">Deontik doğrulama, source_id zorunluluğu ve temel belge işlemleri.</p></div>
        <div className="plasma-card p-6"><h2 className="text-lg font-semibold text-[hsl(var(--accent))]">Pro++</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--text-secondary))]">UYAP/UDF, citation graph, consortium ve ileri dava analiz modülleri.</p></div>
      </section>
    </main>
  );
}
