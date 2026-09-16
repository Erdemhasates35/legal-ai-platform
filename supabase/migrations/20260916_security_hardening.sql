-- Additive security hardening. Existing tables are preserved.

CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role = 'admin' AND is_approved = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_user(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND is_approved = true
  );
$$;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.precedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deontic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echr_judgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echr_turkish_citations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access profiles" ON public.profiles;
CREATE POLICY "Admins full access profiles" ON public.profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users manage own files" ON public.user_files;
CREATE POLICY "Users manage own files" ON public.user_files
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins view approval logs" ON public.approval_logs;
CREATE POLICY "Admins view approval logs" ON public.approval_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins create approval logs" ON public.approval_logs;
CREATE POLICY "Admins create approval logs" ON public.approval_logs
  FOR INSERT WITH CHECK (public.is_admin() AND performed_by = auth.uid());

DROP POLICY IF EXISTS "Approved users read cases" ON public.cases;
CREATE POLICY "Approved users read cases" ON public.cases
  FOR SELECT USING (public.is_approved_user());

DROP POLICY IF EXISTS "Admins manage cases" ON public.cases;
CREATE POLICY "Admins manage cases" ON public.cases
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Approved users read precedents" ON public.precedents;
CREATE POLICY "Approved users read precedents" ON public.precedents
  FOR SELECT USING (public.is_approved_user());

DROP POLICY IF EXISTS "Admins manage precedents" ON public.precedents;
CREATE POLICY "Admins manage precedents" ON public.precedents
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Approved users read deontic rules" ON public.deontic_rules;
CREATE POLICY "Approved users read deontic rules" ON public.deontic_rules
  FOR SELECT USING (public.is_approved_user());

DROP POLICY IF EXISTS "Admins manage deontic rules" ON public.deontic_rules;
CREATE POLICY "Admins manage deontic rules" ON public.deontic_rules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Approved users read ECHR judgments" ON public.echr_judgments;
CREATE POLICY "Approved users read ECHR judgments" ON public.echr_judgments
  FOR SELECT USING (public.is_approved_user());

DROP POLICY IF EXISTS "Admins manage ECHR judgments" ON public.echr_judgments;
CREATE POLICY "Admins manage ECHR judgments" ON public.echr_judgments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Approved users read ECHR Turkish citations" ON public.echr_turkish_citations;
CREATE POLICY "Approved users read ECHR Turkish citations" ON public.echr_turkish_citations
  FOR SELECT USING (public.is_approved_user());

DROP POLICY IF EXISTS "Admins manage ECHR Turkish citations" ON public.echr_turkish_citations;
CREATE POLICY "Admins manage ECHR Turkish citations" ON public.echr_turkish_citations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('legal-files', 'legal-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Users upload own legal files" ON storage.objects;
CREATE POLICY "Users upload own legal files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'legal-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.is_approved_user()
  );

DROP POLICY IF EXISTS "Users read own legal files" ON storage.objects;
CREATE POLICY "Users read own legal files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'legal-files'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );

DROP POLICY IF EXISTS "Users delete own legal files" ON storage.objects;
CREATE POLICY "Users delete own legal files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'legal-files'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
  );
