-- Legal AI Platform Schema (Turkish Law + ECHR)
-- Phase 2: Auth + Roles + Tiers + Files + Security
-- Mevcut tablolar KORUNDU – hiçbir şey silinmedi

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. KULLANICI & ROL & ONAY SİSTEMİ (Admin onayı zorunlu)
-- =====================================================

-- profiles: Google Auth sonrası oluşan kullanıcı profili
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('pending', 'user', 'admin')),
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'private')),
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,  -- Admin onayı olmadan platforma giremez
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  monthly_fee NUMERIC(10,2) DEFAULT 0,        -- Admin belirler (Private için)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin onayı geçmişi (denetim izi)
CREATE TABLE IF NOT EXISTS approval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'tier_change', 'fee_change')),
  old_value TEXT,
  new_value TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ABONELİK / TIER YÖNETİMİ
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'private')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending_payment')),
  monthly_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. DOSYA YÜKLEME / İNDİRME (esnek, kullanıcı dostu)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,          -- Supabase Storage yolu
  mime_type TEXT,
  size_bytes BIGINT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'case', 'precedent', 'evidence', 'other')),
  is_private BOOLEAN DEFAULT TRUE,     -- Private tier kullanıcıları için
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MEVCUT HUKUKİ TABLOLAR (AYNEN KORUNDU)
-- =====================================================

CREATE TABLE IF NOT EXISTS cases (
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

CREATE TABLE IF NOT EXISTS precedents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES cases(id),
  target_id UUID REFERENCES cases(id),
  citation_type TEXT CHECK (citation_type IN ('onay', 'bozma', 'atif', 'karsit', 'diger')),
  weight REAL DEFAULT 1.0,
  UNIQUE(source_id, target_id)
);

CREATE TABLE IF NOT EXISTS deontic_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statute_code TEXT NOT NULL,
  formal_expression TEXT NOT NULL,
  natural_language_tr TEXT NOT NULL,
  natural_language_en TEXT NOT NULL,
  source_article TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS echr_judgments (
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

CREATE TABLE IF NOT EXISTS echr_turkish_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  echr_id UUID REFERENCES echr_judgments(id),
  turkish_precedent_id UUID REFERENCES cases(id),
  citation_context TEXT
);

-- =====================================================
-- 5. İNDEXLER (performans – mevcutlar + yeniler)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cases_embedding ON cases USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_echr_embedding ON echr_judgments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_precedents_source ON precedents (source_id);
CREATE INDEX IF NOT EXISTS idx_precedents_target ON precedents (target_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON profiles (is_approved);
CREATE INDEX IF NOT EXISTS idx_user_files_user ON user_files (user_id);

-- =====================================================
-- 6. RLS (Row Level Security) – Minimum sürtünme, maksimum güvenlik
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_logs ENABLE ROW LEVEL SECURITY;

-- Kullanıcı kendi profilini görebilir
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin her şeyi görebilir / güncelleyebilir
CREATE POLICY "Admins full access profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Dosyalar: sadece sahibi veya admin
CREATE POLICY "Users manage own files" ON user_files
  FOR ALL USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- =====================================================
-- 7. TETİKLEYİCİ: Yeni Google kullanıcısı → profiles kaydı (pending)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'pending',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
