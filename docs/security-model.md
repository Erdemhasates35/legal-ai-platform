# Legal AI Platform Security Model

## Authentication

- Google OAuth is the only interactive sign-in path.
- Supabase SSR stores the session in cookies; server authorization uses the authenticated Supabase user, not a browser-supplied user id.
- `/dashboard/*` and `/admin/*` are protected by middleware and server-side guards.
- Approval is stored in `profiles.is_approved`; role is stored in `profiles.role`.

## Authorization

- `free` provides deontic verification, source enforcement and basic file handling.
- `private` is the existing schema value used for the Pro++ entitlement set.
- Admin mutations are server-only and audited in `approval_logs`.
- Service-role credentials are never exposed to client components.

## File security

- `legal-files` is private.
- Storage paths are prefixed by the authenticated user's UUID.
- Upload requests derive ownership from the Supabase session and ignore any client-supplied user identifier.
- Downloads require ownership or admin role and use short-lived signed URLs.
- Storage objects are removed when the corresponding database insert fails.

## Legal provenance

A verified legal claim must satisfy all of these gates:

1. non-empty claim text;
2. at least one `source_id`;
3. every `source_id` exists in the source registry/query result;
4. every source is active;
5. every source has a valid formal deontic expression;
6. the final analysis preserves the exact verified source id set.

Any failed gate produces a structured rejection. The system does not convert a failed verification into a positive legal conclusion.

## Scope of the guarantee

The enforceable system property is **fail-closed verified output**: unverified claims are not represented as verified legal conclusions. This is materially different from an absolute claim that no generative model could ever hallucinate in any future context. The platform therefore records provenance and verification status rather than relying on a global “zero hallucination” assertion.
