export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--text-primary))] sm:text-5xl">
          Legal AI Platform
        </h1>
        <p className="mt-4 text-lg text-[hsl(var(--text-secondary))]">
          Sıfır-Hallüsinasyon Hukuki Yapay Zeka · Türk Hukuku + AİHM
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--text-muted))]">
          Zero-Hallucination Legal AI · Turkish Law + ECHR
        </p>
      </div>

      <div className="grid w-full gap-5 sm:grid-cols-3">
        <div className="plasma-card p-6">
          <h2 className="font-semibold text-[hsl(var(--text-primary))]">1. Deontik Mantık</h2>
          <p className="mt-3 text-sm text-[hsl(var(--text-secondary))]">
            Kanun maddeleri biçimsel mantığa çevrilir ve SAT kontrolünden geçer.
          </p>
        </div>
        <div className="plasma-card p-6">
          <h2 className="font-semibold text-[hsl(var(--text-primary))]">2. Atıf Grafı (GNN)</h2>
          <p className="mt-3 text-sm text-[hsl(var(--text-secondary))]">
            Yargıtay / Danıştay / AYM / AİHM kararları graf olarak sıralanır.
          </p>
        </div>
        <div className="plasma-card p-6">
          <h2 className="font-semibold text-[hsl(var(--text-primary))]">3. Q-NLP Tensor</h2>
          <p className="mt-3 text-sm text-[hsl(var(--text-secondary))]">
            Uzun belgelerdeki anlam bağları korunarak arama yapılır.
          </p>
        </div>
      </div>

      <div className="plasma-card w-full max-w-2xl p-6 text-center">
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          <span className="font-medium text-[hsl(var(--accent))]">Giriş:</span> Sadece Google hesabı ile.
          <br />
          <span className="font-medium text-[hsl(var(--accent))]">Onay:</span> Yönetici (Admin) onayı olmadan erişim yok.
          <br />
          <span className="font-medium text-[hsl(var(--accent))]">Katmanlar:</span> Free (temel) · Private (tüm modüller + özel özellikler)
        </p>
      </div>

      <p className="text-center text-xs text-[hsl(var(--text-muted))]">
        Her iddia zorunlu olarak source_id ile doğrulanır. Doğrulanmayan çıktı üretilmez.
      </p>
    </main>
  );
}
