export type CourtType = "Yargitay" | "Danistay" | "AYM" | "Asliye" | "Idare" | "AİHM" | "other";

export interface LegalCase {
  id: string;
  uyapId: string | null;
  courtType: CourtType;
  decisionNumber: string;
  decisionDate: string;
  parties: Record<string, string>;
  fullText: string;
  embedding: number[] | null;
  sourceFilePath: string | null;
  createdAt: string;
}

export interface PrecedentEdge {
  id: string;
  sourceId: string;
  targetId: string;
  citationType: "onay" | "bozma" | "atif" | "karsit" | "diger";
  weight: number;
}

export interface DeonticRule {
  id: string;
  statuteCode: string;
  formalExpression: string;
  naturalLanguageTr: string;
  naturalLanguageEn: string;
  sourceArticle: string | null;
  isActive: boolean;
}

export interface EchrJudgment {
  id: string;
  applicationNumber: string;
  caseName: string;
  judgmentDate: string;
  articles: string[];
  outcome: "violation" | "no_violation" | "struck_out" | "friendly_settlement";
  fullText: string;
  embedding: number[] | null;
  hudocUrl: string | null;
}

export interface VerificationResult {
  isValid: boolean;
  sourceIds: string[];
  deonticScore: number;
  gnnRank: number;
  confidence: number;
  messageTr: string;
  messageEn: string;
  rejectedReason?: string;
}
