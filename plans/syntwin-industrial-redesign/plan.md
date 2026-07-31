# Plan: SynTwin industrial-minimal full-site redesign

**Spec:** `plans/syntwin-industrial-redesign/spec.md`  
**Mode:** `--hard`  
**Risk:** high-risk — touches client auth/subscription routing, payment journey, protected API surfaces, and every frontend route.  
**Test:** default; add unit and E2E coverage before high-risk access/data changes  
**Tasks:** default  
**Status:** Phase 01 reviewer-approved — awaiting human hard-mode approval

## Scope challenge

- **Exists:** all major public, customer, payment, and admin routes already exist; subscription route policy and `/dashboard/demo` do not.
- **Minimum:** preserve the existing API contracts and workflows while introducing one visual system, one centralized route policy, an isolated Free demo, and an honest real-data dashboard without 3D.
- **Complexity:** Hard. The approved delivery shape is six phases, each split into independently buildable commits.

## Research decision

Adopt the shared recommendation from both research passes:

1. Centralize route authorization in pure policy helpers and client access boundaries.
2. Split `/dashboard/demo` from the paid workspace with an App Router route group so the demo never mounts `CompanyProvider`.
3. Share pure visual components, not API containers, between demo and paid dashboard.
4. Use current robot snapshots, telemetry history (when InfluxDB is enabled),
   command history, and labelled browser-session samples in paid routes; show
   unavailable states for metrics the backend does not provide.
5. Remove all 3D runtime, dependencies, claims, and mock operational data.
6. Preserve every real mutation and API contract through a route/action traceability checklist.

## Access policy

Authorization uses `session.subscriptionPlan`, not legacy `session.plan`.

| Request | Logged out | Free | Basic/Premium | SuperAdmin |
| --- | --- | --- | --- | --- |
| `/dashboard/demo` | `/login?next=/dashboard/demo` | Allow | `/dashboard` | `/admin/dashboard` |
| Real `/dashboard/**` | Login with safe `next` | `/dashboard/demo` | Allow | `/admin/dashboard` |
| `/admin/**` | Login with safe `next` | `/dashboard/demo` | `/dashboard` | Allow |
| `/pricing` | Allow viewing; login before checkout | Allow | Allow | View-only |
| `/login`, `/register` | Allow | `/dashboard/demo` | `/dashboard` | `/admin/dashboard` |

The client boundary renders only a neutral session-checking state until `restoreSession()` resolves. Backend authorization remains the security boundary because tokens are stored in localStorage.

## Data provenance policy

| Label | Source | Allowed use |
| --- | --- | --- |
| Live snapshot | Existing robot/company/user/admin APIs | Paid customer and admin routes |
| Backend history | Robot telemetry history, maximum 7 days | Paid charts when endpoint returns real points |
| Current browser session | Samples collected from successful live polling after page open | Paid trend charts with explicit non-retained label |
| Simulated demo data | Fixed deterministic fixtures | `/dashboard/demo` only, persistently labelled |
| Unavailable | Backend does not expose the metric/history | Honest empty/unavailable panel with backend feedback reference |

Never convert request failures to zero, infer load from joint angles, infer history from a current collision flag, or backfill paid charts with mock points.

## API behavior lock

Preserve:

- auth password/email-code flows, refresh deduplication, bearer attachment, error extraction, aborts, logout, and one refresh retry;
- register fields and browser timezone;
- public plan list, VNPAY checkout payload/navigation, return status states, retry, and session refresh after Paid;
- company selection persistence per user and access-revocation fallback;
- robot list/detail, five-second state polling, owner/monitor permissions, create/edit/delete/reset-secret, and one-time secret handling;
- company creation/editing, members, monitor add/replace/enable/disable/remove;
- profile and subscription reads/updates;
- admin metrics, search, filters, pagination, detail, user mutations, company members, and monitor linking;
- `/dashboard/settings` compatibility.

## Test and environment prerequisites

Phase 01 must install and configure:

- `vitest`, `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`;
- `@playwright/test` and `@axe-core/playwright`;
- Chromium via `npx playwright install chromium`;
- a Playwright `webServer` that starts the Next app, a configurable `baseURL`,
  deterministic API fixtures, HTML/JUnit reporters, and trace/screenshot/video
  artifacts on failure;
- explicit snapshot directories; visual snapshots are updated only through an
  intentional `--update-snapshots` review command;
- `test:a11y` and `test:visual` as tagged Playwright projects, not undeclared
  standalone runners;
- `scripts/check-build-assets.mjs` plus a committed pre-change size baseline.

Local E2E uses deterministic network/session fixtures for Free, Basic, Premium,
SuperAdmin, company, robot, telemetry, and payment states. No dedicated staging or
public test accounts are required. Public production QA is guest/read-only and
covers landing, auth entry, public pricing, static assets, redirects that do not
require a session, console, and network health. Authenticated live API behavior is
reported as unverified without credentials. Routine payment tests use mocked
statuses and never initiate real VNPAY payments.

## Validated product decisions

- `/pricing` is public; checkout requires login and preserves selected Basic/Premium.
- All user-facing copy is Vietnamese.
- Real charts use exactly what `SynTwin_Backend` exposes. See
  `docs/backend-capability-assessment.md`.
- No dedicated test accounts will be created.
- Implementation is code-first and reviewed through screenshots; no Figma handoff.

## Six-phase delivery

1. [x] [Foundation, access, route groups](phase-01-foundation-access.md)
2. [x] [Public acquisition and payment surfaces](phase-02-public-acquisition.md)
3. [Free demo, real overview, and 3D removal](phase-03-demo-overview-3d-removal.md)
4. [Customer management routes](phase-04-customer-routes.md)
5. [Admin application](phase-05-admin.md)
6. [Responsive, accessibility, regression, and public QA](phase-06-quality-public-qa.md)

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-07-31 03:31
**Phase in progress:** phase-02-public-acquisition
**Status:** Implemented and tested; code review in progress under the user's automatic-approval instruction.

### Decisions made this session

- Landing copy is limited to workflows and telemetry fields present in the
  frontend/backend source; representative numbers are persistently labelled
  as simulated.
- Password, email-code, registration, selected-plan and VNPay payload
  contracts are covered by browser tests.
- Acquisition surfaces are Vietnamese and have no horizontal overflow at
  360px.
- Unused Finova marketing components were deleted only after import search
  proved they had no consumers.

### Next immediate action

Resolve any Phase 02 review findings automatically, then begin Phase 03 demo,
real operational overview, and complete 3D runtime removal.

## Global verification

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run check:assets
rg -n -i 'FactoryScene|@react-three|\bthree\b|robot\.glb|canView3D|3D|99\.8|sub-second|leading manufacturers|predictive' app components lib package.json package-lock.json
npm ls three @react-three/fiber @react-three/drei
```

Required visual widths: 360, 768, 1024, and 1440 pixels. Public-domain verification targets `https://syn-twin-kappa.vercel.app/`.

## Cross-phase risks

- Client-only session storage prevents true server route authorization; never claim otherwise.
- Route moves into `(workspace)` preserve URLs but can break imports or metadata if mixed with visual rewrites.
- Current paid overview, alerts, and analytics contain fictional operational data; preserving interaction does not mean preserving false claims.
- Existing lint baseline is failing; record baseline, then finish with zero errors.
- Telemetry history exists for up to seven days, but staging currently has InfluxDB
  disabled and therefore returns no history points.
- Load, aggregate throughput/OEE, factory-run listing, and alert lifecycle/history
  remain backend gaps.
- Public-domain authenticated paid/admin verification is unavailable without test
  accounts; local deterministic E2E must provide that evidence.

## Red-team adjudication

- **ACCEPTED:** allow only auth bootstrap/refresh requests on the demo; forbid all
  non-auth live product APIs and mutations.
- **ACCEPTED:** keep the minimal temporary analytics export in `lib/mock-data.ts`
  through Phase 03 and delete it only with the Phase 04 analytics migration.
- **ACCEPTED:** add a validated existing-session boundary to `/login` and
  `/register` to prevent auth-form flash.
- **ACCEPTED:** define the selected-plan return contract and keep registration
  handoff at pricing.
- **ACCEPTED:** make one redirect coordinator the sole owner of token-expiry
  navigation.
- **ACCEPTED:** make test packages, browser setup, artifacts, snapshots, and build
  asset budgets executable prerequisites.
- **ACCEPTED:** distinguish mocked local E2E, authenticated staging fixtures, and
  read-only public production smoke tests.
- **REJECTED:** request new release authorization. The user already explicitly
  authorized pushing the frontend and testing/deploying on the public Vercel domain
  in this thread; deployment still occurs only after the reviewed SHA passes gates.
- **ACCEPTED:** widen 3D source/dependency/bundle proof.
- **ACCEPTED:** measure the 500 KB asset NFR against a recorded baseline.
