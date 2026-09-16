# Production Readiness Record

## Implemented controls

- Cookie-based Supabase SSR authentication boundary.
- Google OAuth callback with same-origin `next` validation.
- Middleware protection for dashboard and admin routes.
- Server-side approval and admin guards.
- Designated-email first-admin bootstrap with audit logging.
- Private Supabase Storage bucket and user-scoped object policies.
- Server-derived upload ownership and cleanup on partial failure.
- Short-lived signed download URLs.
- Fail-closed source/deontic verification pipeline.
- Deterministic precedent citation ranking.
- Pro++ analysis endpoint gated by entitlement and verification.
- Consortium gate that cannot mark an unverified claim as valid.
- CI quality gate for typecheck, tests and production build; the Next.js build performs the repository lint pass.

## Required runtime configuration

Configure these values in the Vercel project environment when overriding the verified public defaults in code:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ADMIN_BOOTSTRAP_EMAIL`

No service-role credential is required by the application runtime. Database and Storage writes use the caller-scoped SSR client and RLS; the bootstrap operation is a restricted database function.

Google OAuth provider configuration remains in Supabase Auth. The callback URL must point to `/auth/callback` on each configured application origin.

## Database deployment

Apply `supabase/migrations/20260916_security_hardening.sql` to the production Supabase project after confirming the existing schema is present. The migration is additive and does not drop application tables.

## Verification evidence

The repository contains deterministic checks in:

- `scripts/validate-deontic.ts`
- `scripts/validate-verification.ts`
- `scripts/validate-production.ts`

CI runs all three plus TypeScript and production build.

## Legal-system boundary

The application is a research and verification system. It does not replace a lawyer, judge, bar association, or court. Verified output means that the application has satisfied its explicit provenance/deontic gates; it does not mean that the resulting legal interpretation is universally correct or legally binding.

## Deployment status

A Vercel preview deployment for the hardened branch reached `READY` after a clean production build. Production should be considered live only after the main branch deployment and Google OAuth/runtime configuration are verified.
