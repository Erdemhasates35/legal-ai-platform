/**
 * Dosya Yükleme & Tarama Modülü
 * Free: temel yükleme + metin çıkarma
 * Pro++: UYAP/UDF yapılandırılmış analiz + yorumlama
 * Kullanıcıyı yormayan, tek tıkla çalışan tasarım
 */

export default function FilesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))]">
          Dosya Yükleme & Tarama
        </h1>
        <p className="mt-2 text-[hsl(var(--text-secondary))]">
          PDF · DOCX · UDF · e-Devlet çıktıları · Tek tıkla yükle, otomatik tanı
        </p>
      </header>

      {/* Yükleme Alanı */}
      <section className="plasma-card p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--bg-tertiary))] px-6 py-16 text-center transition-colors hover:border-[hsl(var(--accent-muted))]">
          <div className="mb-4 text-4xl text-[hsl(var(--accent))]">📄</div>
          <p className="text-lg font-medium text-[hsl(var(--text-primary))]">
            Dosyayı buraya sürükleyin veya tıklayın
          </p>
          <p className="mt-2 text-sm text-[hsl(var(--text-muted))]">
            Desteklenen: PDF, UDF, DOCX · Maksimum 50 MB
          </p>
          <button className="plasma-button mt-6">
            Dosya Seç
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[hsl(var(--bg-secondary))] p-4">
            <h3 className="font-medium text-[hsl(var(--text-primary))]">Free Katman</h3>
            <ul className="mt-2 space-y-1 text-sm text-[hsl(var(--text-secondary))]">
              <li>• Dosya yükleme</li>
              <li>• Otomatik tür tanıma</li>
              <li>• Temel metin çıkarma</li>
              <li>• Deontik ön kontrol</li>
            </ul>
          </div>
          <div className="rounded-lg bg-[hsl(var(--bg-secondary))] p-4">
            <h3 className="font-medium text-[hsl(var(--accent))]">Pro++ Katman</h3>
            <ul className="mt-2 space-y-1 text-sm text-[hsl(var(--text-secondary))]">
              <li>• UYAP / UDF yapılandırılmış okuma</li>
              <li>• Mahkeme · Esas · Karar no çıkarma</li>
              <li>• Çoklu ajan yorumlama</li>
              <li>• GNN emsal bağlantısı</li>
            </ul>
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-[hsl(var(--text-muted))]">
        Yüklenen her dosya source_id ile kaydedilir. Hallüsinasyon riski taşıyan çıktı üretilmez.
        UYAP derin analizi yalnızca Pro++ kullanıcılarına açıktır.
      </p>
    </main>
  );
}
