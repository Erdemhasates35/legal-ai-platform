-- Keep the bootstrap allowlist inaccessible through client roles.
-- The SECURITY DEFINER trigger reads this private table internally.
ALTER TABLE private.admin_bootstrap_allowlist ENABLE ROW LEVEL SECURITY;
