-- Legal AI Platform Schema (Turkish Law + ECHR)
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uyap_id TEXT UNIQUE,
  court_type TEXT NOT NULL CHECK (court_type IN ('Yargitay', 'Danistay', 'AYM', 'Asliye', 'Idare', 'other')),
  decision_number TEXT NOT NULL,
  decision_date DATE NOT NULL,
  parties JSONB,
  full_text TEXT NOT NULL,
  embedding VECTOR(1536),
  source_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE precedents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES cases(id),
  target_id UUID REFERENCES cases(id),
  citation_type TEXT CHECK (citation_type IN ('onay', 'bozma', 'atif', 'karsit', 'diger')),
  weight REAL DEFAULT 1.0,
  UNIQUE(source_id, target_id)
);

CREATE TABLE deontic_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statute_code TEXT NOT NULL,
  formal_expression TEXT NOT NULL,
  natural_language_tr TEXT NOT NULL,
  natural_language_en TEXT NOT NULL,
  source_article TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE echr_judgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT UNIQUE NOT NULL,
  case_name TEXT NOT NULL,
  judgment_date DATE NOT NULL,
  articles TEXT[] NOT NULL,
  outcome TEXT CHECK (outcome IN ('violation', 'no_violation', 'struck_out', 'friendly_settlement')),
  full_text TEXT NOT NULL,
  embedding VECTOR(1536),
  hudoc_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE echr_turkish_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echr_id UUID REFERENCES echr_judgments(id),
  turkish_precedent_id UUID REFERENCES cases(id),
  citation_context TEXT
);

-- Indexes for performance
CREATE INDEX ON cases USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON echr_judgments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON precedents (source_id);
CREATE INDEX ON precedents (target_id);
