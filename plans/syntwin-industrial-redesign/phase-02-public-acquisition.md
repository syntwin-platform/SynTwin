# Phase 02: Landing, authentication, pricing, payment, and recovery

## Stories covered

- P1 credible public evaluation for factory owners/managers.
- P1 Free-to-paid journey.
- P2 responsive and keyboard operation on acquisition routes.

## Entry criteria

- Phase 01 access policy and shared primitives are stable.
- Login destinations and safe `next` behavior are covered by tests.

## Work

### 1. Public landing

Keep `app/page.tsx` server-oriented and compose:

- `components/marketing/SiteHeader.tsx`;
- `LandingHero.tsx`;
- `ProductPreview.tsx`;
- `Capabilities.tsx`;
- `OperatingFlow.tsx`;
- `AccessSecurity.tsx`;
- `PlanPreview.tsx`;
- `LandingFaq.tsx`;
- `SiteFooter.tsx`.

Use the existing logo SVG, bright industrial-minimal system, and one technical telemetry-grid signature. Product preview must be labelled “Representative interface” or “Simulated example”.

Write all public copy, navigation, CTAs, plan explanations, auth feedback, payment
states, and recovery actions in Vietnamese. Translate display labels while keeping
API plan codes and route identifiers unchanged.

Remove unsupported counts, uptime/latency/ROI/customer/partner/predictive/sub-second claims. Explain only capabilities supported by current project workflows. Remove all 3D language.

### 2. Auth surfaces

Redesign `app/login/page.tsx` without changing:

- password login;
- request/confirm six-digit email code;
- countdown/resend behavior;
- API-specific loading/success/error feedback;
- role/subscription destination.

Redesign `app/register/page.tsx` while preserving full name, email, password, confirmation, terms, timezone, validation, session storage, and pricing handoff. Remove unsupported SOC-2/uptime/edge badges.

### 3. Public plan browsing, authenticated checkout

Remove the whole-route auth gate from `app/pricing/layout.tsx`.

Update `app/pricing/page.tsx` so:

- public visitors can load `/api/subscription-plans`;
- Free/Basic/Premium contract and current-user state remain intact;
- clicking paid checkout while logged out routes to
  `/login?next=<encoded /pricing?plan=Basic|Premium>`;
- both password and email-code success return to pricing with the allowlisted
  plan selected and require a fresh checkout click (never auto-start payment);
- authenticated checkout still calls the same VNPAY endpoint/payload;
- SuperAdmin receives view-only behavior unless purchasing is explicitly supported.

Remove `canView3D` from rendered plan features but retain backend type fields.

Registration success always hands off to `/pricing`, preserving an eligible
selected plan if present; it does not redirect a new Free user straight to the
demo before the pricing decision.

### 4. Payment and recovery

Redesign `app/payment/vnpay-return/page.tsx` without altering `txnRef`, status polling/check, Paid/Pending/Failed/Refunded states, retry, or `restoreSession()` after Paid.

Redesign `app/not-found.tsx` and root metadata in `app/layout.tsx`. Use accurate non-3D description and role/subscription-aware recovery.

### 5. Legacy marketing cleanup

After import searches prove they are unused, delete or isolate unrelated Finova components such as old hero/services/features/testimonials/blog/FAQ/pricing sections and unused `styles/globals.css`. Keep deletion in a separate commit.

## Verification

- Anonymous landing/pricing loads without auth requests that block rendering.
- Authenticated checkout sends unchanged request and follows unchanged VNPAY navigation.
- All payment result states and Retry render.
- Password and email-code auth both honor eligible `next`.
- Copy audit finds no unsupported marketing or 3D claims.
- Screenshot `/`, `/login`, `/register`, `/pricing`, payment states, and not-found at 360 and 1440.
- Keyboard navigation and reduced-motion checks pass.

## Commit boundaries

1. Landing structure/content.
2. Login/register visual migration.
3. Public pricing and checkout gate.
4. Payment/not-found/metadata.
5. Proven-unused legacy cleanup.

## Exit criteria

- A logged-out decision-maker can understand capabilities and compare plans.
- No unsupported claim remains on rendered acquisition routes.
- Existing auth/payment contracts pass regression tests.
- Build and phase E2E tests pass.
