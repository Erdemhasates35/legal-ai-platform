export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Legal AI Platform
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Sıfır-Hallüsinasyon Hukuki Yapay Zeka · Türk Hukuku + AİHM
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Zero-Hallucination Legal AI · Turkish Law + ECHR
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">1. Deontik Mantık</h2>
          <p className="mt-2 text-sm text-slate-600">
            Kanun maddeleri biçimsel mantığa çevrilir ve SAT kontrolünden geçer.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">2. Atıf Grafı (GNN)</h2>
          <p className="mt-2 text-sm text-slate-600">
            Yargıtay / Danıştay / AYM / AİHM kararları graf olarak sıralanır.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">3. Q-NLP Tensor</h2>
          <p className="mt-2 text-sm text-slate-600">
            Uzun belgelerdeki anlam bağları korunarak arama yapılır.
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Her iddia zorunlu olarak source_id ile doğrulanır. Doğrulanmayan çıktı üretilmez.
      </p>
    </main>
  );
}
