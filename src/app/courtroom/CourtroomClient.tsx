"use client";

import { useState } from "react";

type FormState = {
  title: string;
  proceeding_type: string;
  description: string;
  legal_question: string;
  participants: string;
  statements: string;
  claims: string;
  defences: string;
  requests: string;
  evidence: string;
};

const roles = [
  "Türk Hakimi",
  "Türk Cumhuriyet Savcısı",
  "Savunma Avukatı",
  "AYM/AİHM Uzmanı",
  "Delil ve Adli Analiz Uzmanı",
  "Akademik Hukuk Araştırmacısı",
];

export default function CourtroomClient() {
  const [form, setForm] = useState<FormState>({
    title: "",
    proceeding_type: "criminal",
    description: "",
    legal_question: "",
    participants: "",
    statements: "",
    claims: "",
    defences: "",
    requests: "",
    evidence: "",
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const update = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function start() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/courtroom/proceedings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const proceeding = await response.json();
      if (!response.ok) {
        throw new Error(proceeding.detail || proceeding.error || "Oluşturma başarısız");
      }

      const simulationResponse = await fetch("/api/courtroom/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: proceeding.session.id }),
      });
      const simulation = await simulationResponse.json();
      if (!simulationResponse.ok) {
        throw new Error(simulation.detail || simulation.error || "Simülasyon başarısız");
      }

      setResult({ ...proceeding, ...simulation });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Beklenmeyen hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--bg-primary))] px-6 py-10 text-[hsl(var(--text-primary))]">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">
            GLOBAL COURTROOM
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Proceeding-First Mahkeme Katmanı</h1>
          <p className="mt-2 max-w-3xl text-sm text-[hsl(var(--text-secondary))]">
            Belge olmadan olay anlatımıyla başlayın. Belgeler sonradan delil ve provenans kaynağı olarak bağlanır.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="plasma-card space-y-5 p-6">
            <input className="w-full rounded-xl border bg-transparent p-3" placeholder="Davanın başlığı" value={form.title} onChange={(e) => update("title", e.target.value)} />
            <select className="w-full rounded-xl border bg-transparent p-3" value={form.proceeding_type} onChange={(e) => update("proceeding_type", e.target.value)}>
              <option value="criminal">Ceza</option>
              <option value="civil">Hukuk</option>
              <option value="labor">İş</option>
              <option value="family">Aile</option>
              <option value="commercial">Ticaret</option>
              <option value="administrative">İdare</option>
              <option value="constitutional">Anayasa</option>
              <option value="echr">AİHM</option>
              <option value="other">Diğer</option>
            </select>
            <textarea className="min-h-40 w-full rounded-xl border bg-transparent p-3" placeholder="Olayları kendi sözlerinizle anlatın." value={form.description} onChange={(e) => update("description", e.target.value)} />
            <textarea className="min-h-24 w-full rounded-xl border bg-transparent p-3" placeholder="Hukuki soru / uyuşmazlık" value={form.legal_question} onChange={(e) => update("legal_question", e.target.value)} />
            <textarea className="min-h-24 w-full rounded-xl border bg-transparent p-3" placeholder={"Kişi adı|rol|temsil edilen taraf\nAli Veli|defendant|"} value={form.participants} onChange={(e) => update("participants", e.target.value)} />
            <textarea className="min-h-20 w-full rounded-xl border bg-transparent p-3" placeholder="Beyanlar — her satır bir beyan" value={form.statements} onChange={(e) => update("statements", e.target.value)} />
            <textarea className="min-h-20 w-full rounded-xl border bg-transparent p-3" placeholder="İddialar — her satır bir iddia" value={form.claims} onChange={(e) => update("claims", e.target.value)} />
            <textarea className="min-h-20 w-full rounded-xl border bg-transparent p-3" placeholder="Savunmalar — her satır bir savunma" value={form.defences} onChange={(e) => update("defences", e.target.value)} />
            <textarea className="min-h-20 w-full rounded-xl border bg-transparent p-3" placeholder="Talepler — her satır bir talep" value={form.requests} onChange={(e) => update("requests", e.target.value)} />
            <textarea className="min-h-20 w-full rounded-xl border bg-transparent p-3" placeholder="Deliller — her satır bir delil; başlangıçta UNKNOWN" value={form.evidence} onChange={(e) => update("evidence", e.target.value)} />
            <button disabled={busy || !form.title} onClick={start} className="w-full rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white disabled:opacity-50">
              {busy ? "Mahkeme simülasyonu yürütülüyor…" : "Mahkeme Katmanını Başlat"}
            </button>
            {error && <p className="text-sm text-[hsl(var(--danger))]">{error}</p>}
          </div>

          <aside className="plasma-card p-6">
            <h2 className="font-semibold">Yargısal roller</h2>
            <div className="mt-4 space-y-3 text-sm text-[hsl(var(--text-secondary))]">
              {roles.map((role) => <div key={role} className="rounded-lg border p-3">{role}</div>)}
            </div>
          </aside>
        </section>

        {result && (
          <section className="plasma-card p-6">
            <h2 className="font-semibold">Simülasyon tamamlandı</h2>
            <p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">
              Proceeding: {result.proceeding?.id} · Oturum: {result.session_id} · Tur: {result.turns}
            </p>
            <p className="mt-4 text-xs text-[hsl(var(--text-muted))]">
              Bu çıktı gerçek mahkeme kararı değildir; dosya verileri ve rol-temelli simülasyon muhakemesidir.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
