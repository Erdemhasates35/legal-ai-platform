# Legal AI Platform Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Legal AI Platform into a fail-closed, source-provenance-first legal research application without deleting existing modules or weakening its Turkish Law + ECHR scope.

**Architecture:** Keep Next.js App Router as the web boundary and Supabase as the authenticated data/storage boundary. Add server-side session validation, approval/tier enforcement, private storage ownership, deterministic provenance verification, and additive legal-analysis modules; no generative output is considered verified unless source records exist and all verification gates pass.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, React 18, Supabase Auth/Postgres/Storage, Tailwind CSS, GitHub Actions, Vercel.

**Spec:** Existing MASTER PRO++ directive supplied by the project owner in this conversation.

## Global Constraints

- Preserve every existing module, route, function, schema table, environment variable, log, and architectural intent; changes are additive or narrowly corrective.
- Google OAuth is the only interactive authentication provider; access requires authenticated session plus admin approval, except the configured bootstrap administrator.
- Every legal claim exposed as verified must carry validated `source_id` provenance; missing or unverifiable provenance is a hard rejection.
- Free tier keeps deontic verification, source enforcement, and basic file handling; Pro++ keeps UYAP/UDF, precedent/citation graph, consortium, and advanced analysis.
- Storage is private and user-scoped; the browser never supplies an authoritative user id to the upload API.
- Service-role credentials are server-only and never trusted from request input.
- Existing Pro-Plasma dark theme remains intact.
- No TODO, placeholder, mock, or fake production behavior is introduced.
- Absolute universal “zero hallucination” is not represented as a factual guarantee; the enforceable property is fail-closed verified-output provenance.

---

### Task 1: Authentication, approval, and secure server session boundary

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/auth/guards.ts`
- Create: `src/app/pending/page.tsx`
- Create: `src/middleware.ts`
- Modify: `src/app/auth/callback/route.ts`
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/types/auth.ts`

**Deliverable:** Cookie-aware server Supabase client, centralized authenticated/approved/admin guards, protected dashboard/admin routes, safe OAuth callback redirect validation, and pending-access UX.

- [ ] Add server client using request cookies and `@supabase/ssr`.
- [ ] Add guards that read the authenticated user and profile; reject missing profiles, unapproved users, and non-admin users deterministically.
- [ ] Middleware protects `/dashboard/*` and `/admin/*` and allows auth/static/public routes.
- [ ] OAuth callback exchanges code server-side and redirects only to same-origin application paths.
- [ ] Preserve Google-only login UX.
- [ ] Add tests for missing session, pending user, approved user, and admin access.

### Task 2: Database/RLS/storage hardening and admin bootstrap

**Files:**
- Modify: `supabase/schema.sql`
- Create: `supabase/migrations/20260916_security_hardening.sql`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/bootstrap/route.ts`

**Deliverable:** Idempotent schema hardening, complete RLS coverage, private storage policies, safe first-admin bootstrap through a designated email, and auditable admin operations.

- [ ] Add helper functions/policies for role and approval checks without recursive policy failures.
- [ ] Enable RLS on legal/precedent/ECHR/deontic tables and restrict writes to authorized server/admin paths.
- [ ] Keep `user_files` user-owned and private.
- [ ] Make bootstrap email explicit through `ADMIN_BOOTSTRAP_EMAIL`; never auto-promote arbitrary first users.
- [ ] Admin mutations write `approval_logs`.
- [ ] Provide idempotent migration SQL; never drop existing application tables.

### Task 3: Fail-closed legal provenance verification kernel

**Files:**
- Create: `src/lib/verification/source-registry.ts`
- Create: `src/lib/verification/pipeline.ts`
- Create: `src/app/api/verify/route.ts`
- Modify: `src/lib/logic-engine/deontic.ts`
- Modify: `src/types/legal.ts`
- Create: `scripts/validate-verification.ts`

**Deliverable:** A single deterministic verification pipeline that validates source existence, active status, source-to-claim binding, deontic validity, and final confidence; no verified result can be returned without provenance.

- [ ] Define a source reference model covering statutes/rules, Turkish decisions, and ECtHR judgments.
- [ ] Reject empty, unknown, inactive, duplicated, or malformed source ids.
- [ ] Remove the current hard-coded confidence behavior from the verification path; scores derive from explicit checks.
- [ ] Keep `formalizeStatute` and existing public interfaces compatible.
- [ ] Expose one server route returning structured verification/rejection reasons.
- [ ] Add deterministic tests for accepted and rejected claims.

### Task 4: Secure real upload and document provenance

**Files:**
- Modify: `src/app/api/upload/route.ts`
- Modify: `src/components/modules/FileUploadZone.tsx`
- Modify: `src/lib/file-processor/uyap-udf.ts`
- Create: `src/lib/file-processor/file-validation.ts`
- Create: `src/app/api/files/[id]/route.ts`

**Deliverable:** Real PDF/DOCX/UDF upload with server-derived identity, extension/MIME consistency checks, safe filenames, private storage, database cleanup on partial failure, and signed-download authorization.

- [ ] Validate authenticated session server-side; ignore client-supplied user id.
- [ ] Validate file size, extension, MIME family, and safe storage key.
- [ ] Persist provenance metadata needed to trace a document to its owner and source record.
- [ ] On DB failure after storage success, remove the just-created object.
- [ ] Provide authorized file retrieval through short-lived signed URLs.
- [ ] Preserve existing UDF detection behavior and make it fail closed on unsupported/ambiguous input.

### Task 5: Free/Pro++ capability enforcement and live dashboard/admin surfaces

**Files:**
- Create: `src/lib/auth/entitlements.ts`
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/dashboard/files/page.tsx`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/components/layout/DashboardShell.tsx`

**Deliverable:** Server-authoritative tier gates and removal of static placeholder panels from the live path.

- [ ] Define Free/Pro++ entitlements once and consume them from server boundaries.
- [ ] Render actual current profile/tier state rather than hard-coded `free/user` props.
- [ ] Admin page lists pending users and supports approval/tier actions through protected APIs.
- [ ] Keep Pro++ modules additive and unavailable to Free users.
- [ ] Preserve existing visual language.

### Task 6: Citation graph and consortium integration

**Files:**
- Create: `src/lib/citation/graph.ts`
- Create: `src/app/api/analysis/route.ts`
- Modify: `src/lib/academic-verifier/consortium.ts`

**Deliverable:** Deterministic citation graph ranking and consortium orchestration that consume verified sources and cannot elevate an unverified claim.

- [ ] Build graph adjacency/ranking from persisted precedent edges and ECHR-to-Turkish citation links.
- [ ] Keep ranking descriptive rather than presenting unsupported legal conclusions.
- [ ] Require successful source verification before consortium consensus can become `overallValid`.
- [ ] Return explicit provenance and rejection reasons from advanced analysis.

### Task 7: CI, dependency/runtime configuration, and deployment verification

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `.github/workflows/deploy.yml`
- Modify: `next.config.mjs`
- Modify: `vercel.json`
- Create: `scripts/validate-production.ts`

**Deliverable:** Repeatable lint/typecheck/test/build pipeline with environment validation and Vercel-compatible server configuration.

- [ ] Add `@supabase/ssr` and the minimum test tooling required by the implementation.
- [ ] Add deterministic verification test command to CI.
- [ ] Validate required environment variables without printing secrets.
- [ ] Keep Vercel production deployment gated on quality checks.
- [ ] Verify build output and deployed routes using available deployment tooling.

### Task 8: Whole-system audit and release evidence

**Files:**
- Create: `docs/production-readiness.md`
- Create: `docs/security-model.md`
- Modify: `README.md`

**Deliverable:** Evidence-backed release documentation covering implemented controls, exact environment configuration, Supabase/Google/Vercel setup, source provenance contract, test evidence, and known limits.

- [ ] Audit every tracked application file against this plan.
- [ ] Run lint, TypeScript, verification tests, build, and deployment checks.
- [ ] Record exact live deployment status and URLs only after verification.
- [ ] Document that verified legal output is fail-closed and source-bound, not an absolute guarantee against all model hallucination.
- [ ] Keep legal-source claims attributable to actual authoritative sources.
