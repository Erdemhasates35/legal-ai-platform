"use client";
import { useState } from "react";
export default function CourtroomClient(){
const [form,setForm]=useState({title:"",proceeding_type:"criminal",description:"",legal_question:"",participants:"",statements:"",claims:"",defences:"",requests:"",evidence:""});
const [busy,setBusy]=useState(false); const [result,setResult]=useState<any>(null); const [error,setError]=useState("");
async function start(){setBusy(true);setError("");setResult(null);try{
const r=await fetch("/api/courtroom/proceedings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
const j=await r.json(); if(!r.ok)throw new Error(j.detail||j.error||"Oluşturma başarısız");
const s=await fetch("/api/courtroom/simulate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:j.session.id})});
const sj=await s.json(); if(!s.ok)throw new Error(sj.detail||sj.error||"Simülasyon başarısız"); setResult({...j,...sj});
}catch(e){setError(e instanceof Error?e.message:"Beklenmeyen hata")}finally{setBusy(false)}}
return (
<main className="min-h-screen bg-[hsl(var(--bg-primary))] px-6 py-10 text-[hsl(var(--text-primary))]"><div className="mx-auto max-w-7xl space-y-8">
<header><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">GLOBAL COURTROOM</p><h1 className="mt-2 text-3xl font-semibold">Proceeding-First Mahkeme Katmanı</h1><p className="mt-2 max-w-3xl text-sm text-[hsl(var(--text-secondary))]">Belge olmadan olay anlatımıyla başlayın. Belgeler sonradan delil ve provenans kaynağı olarak bağlanır.</p></header>
<section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="plasma-card p-6 space-y-5">
<input className="w-full rounded-xl border p-3 bg-transparent" placeholder="Davanın başlığı" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
<select className="w-full rounded-xl border p-3 bg-transparent" value={form.proceeding_type} onChange={e=>setForm({...form,proceeding_type:e.target.value})}><option value="criminal">Ceza</option><option value="civil">Hukuk</option><option value="labor">İş</option><option value="family">Aile</option><option value="commercial">Ticaret</option><option value="administrative">İdare</option><option value="constitutional">Anayasa</option><option value="echr">AİHM</option><option value="other">Diğer</option></select>
<textarea className="min-h-40 w-full rounded-xl border p-3 bg-transparent" placeholder="Olayları kendi sözlerinizle anlatın. Bilinmeyenleri kesin gerçek gibi yazmayın." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
<textarea className="min-h-24 w-full rounded-xl border p-3 bg-transparent" placeholder="Hukuki soru / uyuşmazlık" value={form.legal_question} onChange={e=>setForm({...form,legal_question:e.target.value})}/>
<textarea className="min-h-24 w-full rounded-xl border p-3 bg-transparent" placeholder={"Kişi adı|rol|temsil edilen taraf\nAli Veli|defendant|"} value={form.participants} onChange={e=>setForm({...form,participants:e.target.value})}/>
<textarea className="min-h-20 w-full rounded-xl border p-3 bg-transparent" placeholder="Beyanlar — her satır bir beyan" value={form.statements} onChange={e=>setForm({...form,statements:e.target.value})}/>
<textarea className="min-h-20 w-full rounded-xl border p-3 bg-transparent" placeholder="İddialar — her satır bir iddia" value={form.claims} onChange={e=>setForm({...form,claims:e.target.value})}/>
<textarea className="min-h-20 w-full rounded-xl border p-3 bg-transparent" placeholder="Savunmalar — her satır bir savunma" value={form.defences} onChange={e=>setForm({...form,defences:e.target.value})}/>
<textarea className="min-h-20 w-full rounded-xl border p-3 bg-transparent" placeholder="Talepler — her satır bir talep" value={form.requests} onChange={e=>setForm({...form,requests:e.target.value})}/>
<textarea className="min-h-20 w-full rounded-xl border p-3 bg-transparent" placeholder="Deliller — her satır bir delil; başlangıçta UNKNOWN" value={form.evidence} onChange={e=>setForm({...form,evidence:e.target.value})}/>
<button disabled={busy||!form.title} onClick={start} className="w-full rounded-xl bg-[hsl(var(--accent))] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?"Mahkeme simülasyonu yürütülüyor…":"Mahkeme Katmanını Başlat"}</button>
{error&&<p className="text-sm text-[hsl(var(--danger))]">{error}</p>}</div>
<aside className="plasma-card p-6"><h2 className="font-semibold">Yargısal roller</h2><div className="mt-4 space-y-3 text-sm text-[hsl(var(--text-secondary))]">{["Türk Hakimi","Türk Cumhuriyet Savcısı","Savunma Avukatı","AYM/AİHM Uzmanı","Delil ve Adli Analiz Uzmanı","Akademik Hukuk Araştırmacısı"].map(x=><div key={x} className="rounded-lg border p-3">{x}</div>)}</div></aside></section>
{result&&<section className="plasma-card p-6"><h2 className="font-semibold">Simülasyon tamamlandı</h2><p className="mt-2 text-sm text-[hsl(var(--text-secondary))]">Proceeding: {result.proceeding?.id} · Oturum: {result.session_id} · Tur: {result.turns}</p><p className="mt-4 text-xs text-[hsl(var(--text-muted))]">Bu çıktı gerçek mahkeme kararı değildir; dosya verileri ve rol-temelli simülasyon muhakemesidir.</p></section>}</div></main>\n)}
}