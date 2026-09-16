/**
 * Admin Panel – Sadece role = 'admin' kullanıcılar erişebilir
 * Free / Pro++ atama, onay, aylık ücret belirleme
 * Akademik & Baro kullanımına uygun, sade ve kurumsal arayüz
 */

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))]">
          Yönetici Paneli
        </h1>
        <p className="mt-2 text-[hsl(var(--text-secondary))]">
          Kullanıcı onayı · Free / Pro++ katman ataması · Aylık ücret belirleme · Dosya denetimi
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Onay Bekleyenler */}
        <section className="plasma-card p-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
            Onay Bekleyen Kullanıcılar
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--text-muted))]">
            Google ile kayıt olan ve henüz admin onayı almamış kullanıcılar burada listelenir.
            Onay vermeden platforma erişim yoktur.
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--text-muted))]">
            (Supabase bağlantısı sonrası canlı liste burada görünecek)
          </div>
        </section>

        {/* Tier & Ücret Yönetimi */}
        <section className="plasma-card p-6">
          <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
            Katman & Ücret Yönetimi
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--text-muted))]">
            Free → temel modüller<br />
            Pro++ (private) → tüm modüller + UYAP/UDF derin analiz + multi-agent + GNN
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--bg-tertiary))] px-4 py-3">
              <span className="text-sm">Free</span>
              <span className="text-sm font-medium text-[hsl(var(--success))]">Ücretsiz</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--bg-tertiary))] px-4 py-3">
              <span className="text-sm">Pro++</span>
              <span className="text-sm font-medium text-[hsl(var(--accent))]">
                Admin tarafından belirlenir
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="plasma-card mt-6 p-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
          Modül Erişim Özeti (Pro++)
        </h2>
        <ul className="mt-4 grid gap-2 text-sm text-[hsl(var(--text-secondary))] sm:grid-cols-2">
          <li>• Deontik Mantık Doğrulayıcı (Free + Pro++)</li>
          <li>• Dosya Yükleme & Tarama (Free + Pro++)</li>
          <li>• UYAP / UDF / e-Devlet Okuyucu (sadece Pro++)</li>
          <li>• Atıf Grafı GNN (sadece Pro++)</li>
          <li>• Q-NLP Tensor Arama (sadece Pro++)</li>
          <li>• Çoklu Ajan Konsorsiyumu (sadece Pro++)</li>
          <li>• Dava Analiz Motoru (sadece Pro++)</li>
          <li>• Emsal Görselleştirme (sadece Pro++)</li>
        </ul>
      </section>

      <p className="mt-8 text-center text-xs text-[hsl(var(--text-muted))]">
        Bu panel sadece role = admin kullanıcılar tarafından görülebilir.
        Tüm işlemler approval_logs tablosuna kaydedilir.
      </p>
    </main>
  );
}
