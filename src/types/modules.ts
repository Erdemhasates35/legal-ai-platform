/**
 * Module & Tier definitions – Academic / Bar Association ready
 * Free  → temel araçlar
 * Pro++ → tüm modüller + UYAP/UDF derin analiz + multi-agent + GNN full
 */

export type ModuleId =
  | "deontic-checker"
  | "citation-gnn"
  | "qnlp-retrieval"
  | "file-upload"
  | "uyap-udf-parser"
  | "multi-agent-consortium"
  | "admin-panel"
  | "case-analyzer"
  | "precedent-graph";

export type TierAccess = "free" | "pro_plus";

export interface PlatformModule {
  id: ModuleId;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  requiredTier: TierAccess;
  isCore: boolean;
}

/**
 * Akademik ve Baro kullanımına uygun modül kataloğu
 * Pro++ tümünü açar – hiçbir modül silinmez, sadece erişim katmanı değişir
 */
export const MODULE_CATALOG: PlatformModule[] = [
  {
    id: "deontic-checker",
    nameTr: "Deontik Mantık Doğrulayıcı",
    nameEn: "Deontic Logic Verifier",
    descriptionTr: "Kanun maddelerini biçimsel mantığa çevirir ve SAT kontrolü yapar.",
    descriptionEn: "Translates statutes into formal logic and runs SAT checks.",
    requiredTier: "free",
    isCore: true
  },
  {
    id: "file-upload",
    nameTr: "Dosya Yükleme & Tarama",
    nameEn: "File Upload & Scan",
    descriptionTr: "PDF, DOCX, UDF yükleme, otomatik tür tanıma ve temel metin çıkarma.",
    descriptionEn: "Upload PDF/DOCX/UDF, auto-detect type and extract text.",
    requiredTier: "free",
    isCore: true
  },
  {
    id: "uyap-udf-parser",
    nameTr: "UYAP / UDF / e-Devlet Okuyucu",
    nameEn: "UYAP / UDF / e-Devlet Parser",
    descriptionTr: "UYAP ve e-Devlet UDF/PDF dosyalarını yapılandırılmış veriye çevirir, mahkeme, esas, karar numarası çıkarır.",
    descriptionEn: "Parses UYAP and e-Devlet UDF/PDF into structured data (court, case no, decision no).",
    requiredTier: "pro_plus",
    isCore: false
  },
  {
    id: "citation-gnn",
    nameTr: "Atıf Grafı (GNN)",
    nameEn: "Citation Graph Neural Network",
    descriptionTr: "Yargıtay, Danıştay, AYM ve AİHM kararlarını graf olarak sıralar (PageRank + centrality).",
    descriptionEn: "Ranks Yargıtay, Danıştay, AYM and ECHR decisions via graph centrality.",
    requiredTier: "pro_plus",
    isCore: false
  },
  {
    id: "qnlp-retrieval",
    nameTr: "Q-NLP Tensor Arama",
    nameEn: "Quantum-Inspired Tensor Retrieval",
    descriptionTr: "Uzun belgelerdeki uzak anlam bağlarını koruyarak arama yapar.",
    descriptionEn: "Preserves long-range semantic dependencies in multi-page documents.",
    requiredTier: "pro_plus",
    isCore: false
  },
  {
    id: "multi-agent-consortium",
    nameTr: "Çoklu Ajan Konsorsiyumu",
    nameEn: "Multi-Agent Legal Consortium",
    descriptionTr: "Hakim, Savcı, Savunma ve Akademik Doğrulayıcı ajanları çapraz inceleme yapar.",
    descriptionEn: "Judge, Prosecutor, Defense and Academic Verifier agents cross-examine claims.",
    requiredTier: "pro_plus",
    isCore: false
  },
  {
    id: "case-analyzer",
    nameTr: "Dava Analiz Motoru",
    nameEn: "Case Analyzer",
    descriptionTr: "Yüklenen dosyayı deontik + GNN + multi-agent katmanlarından geçirir.",
    descriptionEn: "Runs uploaded files through deontic + GNN + multi-agent layers.",
    requiredTier: "pro_plus",
    isCore: false
  },
  {
    id: "precedent-graph",
    nameTr: "Emsal Görselleştirme",
    nameEn: "Precedent Graph Visualization",
    descriptionTr: "İnteraktif atıf ağı görselleştirmesi.",
    descriptionEn: "Interactive citation network visualization.",
    requiredTier: "pro_plus",
    isCore: false
  },
  {
    id: "admin-panel",
    nameTr: "Yönetici Paneli",
    nameEn: "Admin Panel",
    descriptionTr: "Kullanıcı onayı, Free/Pro++ atama, aylık ücret belirleme, dosya denetimi.",
    descriptionEn: "User approval, Free/Pro++ assignment, monthly fee setting, file audit.",
    requiredTier: "pro_plus",
    isCore: false
  }
];

export function canAccessModule(userTier: "free" | "private", moduleId: ModuleId): boolean {
  const mod = MODULE_CATALOG.find((m) => m.id === moduleId);
  if (!mod) return false;
  if (mod.isCore) return true;
  if (userTier === "private") return true;
  return mod.requiredTier === "free";
}
