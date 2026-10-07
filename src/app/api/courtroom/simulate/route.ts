import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/supabase/server";
export const runtime = "nodejs";
export const maxDuration = 180;
const instructions: Record<string,string> = {
judge_tr:"Tarafsız hâkim: olgu statülerini koru, usul ve ispat sorunlarını ayır.",
prosecutor_tr:"Savcı: iddia teorisini somut olgu ve delil bağlantılarıyla sına.",
defence_tr:"Savunma: çelişki, eksik delil, alternatif açıklama ve usul güvencelerini sına.",
echr_expert:"AYM/AİHM: temel hak, kanunilik, gereklilik ve ölçülülük sorunlarını sına.",
evidence_analyst:"Delil uzmanı: provenans, bütünlük, bağlantı ve çelişkileri değerlendir.",
academic_reviewer:"Akademik araştırmacı: normatif soru, olgu, çıkarım ve araştırma boşluklarını ayır."
};
function parseJson(s:string){try{return JSON.parse(s.replace(/^```json\\s*/i,"").replace(/```$/,"").trim())}catch{return null}}
export async function POST(request:Request){
const profile=await getCurrentProfile(); if(!profile?.is_approved)return NextResponse.json({error:"APPROVAL_REQUIRED"},{status:403});
const body=await request.json().catch(()=>({})); const sessionId=typeof body.session_id==="string"?body.session_id.trim():"";
if(!sessionId)return NextResponse.json({error:"SESSION_ID_REQUIRED"},{status:422});
const supabase=await createServerClient();
const {data:session}=await supabase.from("simulation_sessions").select("id,proceeding_id").eq("id",sessionId).single();
if(!session)return NextResponse.json({error:"UNKNOWN_SESSION"},{status:404});
const [p,pa,ev,st,cl,de,reqs,ei,qq,lr,pr,ag]=await Promise.all([
supabase.from("proceedings").select("*").eq("id",session.proceeding_id).single(),
supabase.from("proceeding_participants").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("case_events").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("statements").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("claims").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("defences").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("requests").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("evidence_items").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("legal_questions").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("legal_rules").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("precedent_refs").select("*").eq("proceeding_id",session.proceeding_id),
supabase.from("simulation_agents").select("*").eq("session_id",session.id).order("order_index")
]);
if(!p.data||!ag.data?.length)return NextResponse.json({error:"SIMULATION_DATA_INCOMPLETE"},{status:409});
const key=process.env.OPENAI_API_KEY?.trim(); if(!key)return NextResponse.json({error:"OPENAI_API_KEY_NOT_CONFIGURED"},{status:503});
const model=process.env.OPENAI_MODEL?.trim()||"gpt-6-luna";
await supabase.from("simulation_sessions").update({status:"running",started_at:new Date().toISOString()}).eq("id",session.id);
const dossier={proceeding:p.data,participants:pa.data,events:ev.data,statements:st.data,claims:cl.data,defences:de.data,requests:reqs.data,evidence:ei.data,questions:qq.data,rules:lr.data,precedents:pr.data};
const prior:any[]=[]; let index=0;
const agents=[...ag.data].sort((a,b)=>a.role_key==="judge_tr"?1:b.role_key==="judge_tr"?-1:a.order_index-b.order_index);
try{for(const a of agents){
const input=["Gerçek mahkeme kararı üretme; bu bir simülasyondur.","CASE CORE tek doğruluk kaynağıdır.","VERIFIED, ASSERTED, INFERRED, UNKNOWN ayrımını koru; bilinmeyeni doğrulanmış gerçek yapma.","Verilmeyen mevzuat, içtihat veya karar numarası uydurma.","JSON üret: {position,key_findings,fact_assessment,contradictions,missing_evidence,legal_questions,sources_used}.","ROL: "+a.display_name,"GÖREV: "+(instructions[a.role_key]||a.mandate),"DOSYA: "+JSON.stringify(dossier).slice(0,60000),"ÖNCEKİ: "+JSON.stringify(prior).slice(0,30000)].join("\n\n");
const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model,instructions:"Akademik hukuk muhakemesi; provenans ve belirsizlik koruması.",input})});
if(!res.ok)throw new Error("OPENAI_"+res.status); const json=await res.json() as {output_text?:string}; const raw=json.output_text||""; const parsed=parseJson(raw);
const position=parsed?.position||raw; const sources=Array.isArray(parsed?.sources_used)?parsed.sources_used:[]; const facts=Array.isArray(parsed?.fact_assessment)?parsed.fact_assessment:[]; const contradictions=Array.isArray(parsed?.contradictions)?parsed.contradictions:[];
const ins=await supabase.from("simulation_turns").insert({session_id:session.id,agent_id:a.id,turn_index:index++,stage:a.role_key==="judge_tr"?"judicial_synthesis":"adversarial_review",position,cited_sources:sources,fact_assessment:facts,contradiction_flags:contradictions}); if(ins.error)throw new Error(ins.error.message);
prior.push({role:a.display_name,position}); }
const judge=prior.find(x=>x.role==="Türk Hakimi")||prior[prior.length-1];
await supabase.from("simulation_decisions").insert({proceeding_id:session.proceeding_id,session_id:session.id,decision_type:"simulation",outcome:"Simülasyon değerlendirmesi; gerçek yargı kararı değildir.",reasoning:judge?.position||"Sentez üretilemedi.",unresolved_questions:qq.data||[],created_by:profile.id});
await supabase.from("simulation_sessions").update({status:"completed",completed_at:new Date().toISOString()}).eq("id",session.id);
await supabase.from("proceedings").update({status:"simulated",updated_at:new Date().toISOString()}).eq("id",session.proceeding_id);
return NextResponse.json({session_id:session.id,status:"completed",turns:index});
}catch(error){await supabase.from("simulation_sessions").update({status:"failed"}).eq("id",session.id);return NextResponse.json({error:"SIMULATION_FAILED",detail:error instanceof Error?error.message:"UNKNOWN"},{status:502})}}