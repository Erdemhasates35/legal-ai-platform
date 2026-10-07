import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

type AgentSpec = {
  role_key: string;
  display_name: string;
  mandate: string;
  methodology: string;
  source_scope: string;
  order_index: number;
};

const AGENTS: AgentSpec[] = [
  {role_key:"judge_tr",display_name:"Türk Hakimi",mandate:"Tarafsız biçimde olguları, usulü ve Türk hukuku sorularını sınamak.",methodology:"Delil durumunu olgu statülerine ayır; taraf iddialarını birbirine karşı test et; belirsizliği karar öncesi koru.",source_scope:"Türk mevzuatı, Yargıtay, Danıştay, AYM ve dosya içeriği",order_index:1},
  {role_key:"prosecutor_tr",display_name:"Türk Cumhuriyet Savcısı",mandate:"İddia teorisini ve ispat yükünü sınamak.",methodology:"Her iddiayı somut olgu ve delil bağlantısıyla test et; karşı açıklamaları da kaydet.",source_scope:"Dosya olguları, deliller, Türk ceza/usul kaynakları",order_index:2},
  {role_key:"defence_tr",display_name:"Savunma Avukatı",mandate:"İddiaların zayıf noktalarını ve sanık/karşı taraf lehine alternatif açıklamaları ortaya koymak.",methodology:"Çelişki, eksik delil, usul güvencesi ve makul alternatifleri adversarial biçimde test et.",source_scope:"Dosya olguları, savunmalar, deliller, usul güvenceleri",order_index:3},
  {role_key:"echr_expert",display_name:"AYM/AİHM Uzmanı",mandate:"Temel haklar ve uluslararası insan hakları ölçütlerini sınamak.",methodology:"Müdahale, meşru amaç, kanunilik, gereklilik, ölçülülük ve etkili başvuru boyutlarını test et.",source_scope:"AYM, AİHM, AİHS ve ilgili uluslararası kaynaklar",order_index:4},
  {role_key:"evidence_analyst",display_name:"Delil ve Adli Analiz Uzmanı",mandate:"Delilin kaynağını, bütünlüğünü, bağlantısını ve çelişkilerini değerlendirmek.",methodology:"Kaynak/provenans zinciri kur; doğrulanmamış unsurları VERIFIED olarak işaretleme.",source_scope:"Deliller, olaylar, beyanlar, provenance kayıtları",order_index:5},
  {role_key:"academic_reviewer",display_name:"Akademik Hukuk Araştırmacısı",mandate:"Muhakemenin kaynaklandırılabilirliğini ve kavramsal tutarlılığını denetlemek.",methodology:"Hukuki soruları ayrıştır; normatif dayanak ile olgusal çıkarımı ayır; açık kalan noktaları işaretle.",source_scope:"Mevzuat, içtihat, AYM/AİHM, akademik hukuk metodolojisi",order_index:6}
];

function cleanText(value: unknown, max = 20000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseParticipants(value: string) {
  return value.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
    const [name, role = "other", represented_party = ""] = line.split("|").map(x => x.trim());
    return { display_name:name, role, represented_party };
  }).filter(x => x.display_name);
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.is_approved) return NextResponse.json({error:"APPROVAL_REQUIRED"},{status:403});

  const body = await request.json().catch(() => ({}));
  const title = cleanText(body.title, 300);
  const proceedingType = cleanText(body.proceeding_type, 40) || "other";
  const description = cleanText(body.description);
  const legalQuestion = cleanText(body.legal_question, 5000);
  const participants = parseParticipants(cleanText(body.participants, 10000));
  if (!title) return NextResponse.json({error:"TITLE_REQUIRED"},{status:422});

  const supabase = await createServerClient();
  const {data: proceeding, error: proceedingError} = await supabase.from("proceedings").insert({
    title, proceeding_type:proceedingType, description, legal_question, created_by:profile.id, status:"active"
  }).select("id,title,proceeding_type,status").single();
  if (proceedingError || !proceeding) return NextResponse.json({error:"PROCEEDING_CREATE_FAILED",detail:proceedingError?.message},{status:500});

  if (participants.length) {
    const {error} = await supabase.from("proceeding_participants").insert(participants.map(p => ({...p, proceeding_id:proceeding.id})));
    if (error) return NextResponse.json({error:"PARTICIPANT_CREATE_FAILED",detail:error.message},{status:500});
  }

  if (description) {
    await supabase.from("case_events").insert({
      proceeding_id:proceeding.id,
      title:"Başlangıç anlatısı",
      description,
      fact_status:"ASSERTED",
      source_kind:"user_narrative"
    });
  }

  if (legalQuestion) {
    await supabase.from("legal_questions").insert({proceeding_id:proceeding.id,question:legalQuestion});
  }

  const {data: session, error: sessionError} = await supabase.from("simulation_sessions").insert({
    proceeding_id:proceeding.id,
    created_by:profile.id,
    mode:"adversarial",
    status:"draft",
    scenario_snapshot:{source:"proceeding_core",documents_optional:true}
  }).select("id,status").single();
  if (sessionError || !session) return NextResponse.json({error:"SIMULATION_CREATE_FAILED",detail:sessionError?.message},{status:500});

  const {error: agentError} = await supabase.from("simulation_agents").insert(
    AGENTS.map(agent => ({...agent,session_id:session.id}))
  );
  if (agentError) return NextResponse.json({error:"AGENT_CREATE_FAILED",detail:agentError.message},{status:500});

  return NextResponse.json({proceeding,session,agents:AGENTS.length});
}
