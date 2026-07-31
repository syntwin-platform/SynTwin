# Phase 06: Responsive, accessibility, regression, and public Vercel QA

## Stories covered

- P2 mobile/keyboard usability.
- P2 maintainable shared system.
- All P1 acceptance criteria as release verification.
- P3 localization remains explicitly out of scope.

## Entry criteria

- Phases 01–05 are merged locally and independently buildable.
- All target routes and access states are implemented.
- API feedback documents all missing historical-data requirements.

## Work

### Automated closure

Resolve all baseline and introduced lint errors/warnings that affect shipped code. Run:

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run check:assets
```

Add/finish:

- access matrix tests;
- demo import/network isolation;
- customer workflow smoke tests;
- admin workflow smoke tests;
- payment return states;
- axe-based critical/serious accessibility checks;
- visual snapshots at 360 and 1440.

### Manual responsive matrix

At 360, 768, 1024, and 1440 verify:

- no horizontal page overflow;
- safe-area and mobile bottom navigation;
- readable charts with textual summaries;
- table mobile alternatives;
- dialogs and destructive confirmations;
- loading, empty, error, partial, stale, disabled, and success states;
- long copy/error strings and 200% browser zoom.

### Accessibility

- full keyboard order;
- visible focus;
- landmarks/headings;
- `aria-current`;
- chart figure/summary labelling;
- status text/icon in addition to color;
- 44px mobile targets;
- focus trap/restore and Escape;
- reduced motion;
- WCAG AA contrast.

### Credibility and dead-code audit

Search rendered/source copy for unsupported claims and all 3D language. Confirm unreferenced legacy marketing/Three.js assets and dependencies are gone without deleting engineering assets of uncertain ownership.

### Public deployment and verification

1. Confirm the frontend Git working tree contains only intended redesign files.
2. Commit in phase-aligned commits and push `main` only after local gates pass.
3. Deploy through the already linked Vercel project/CLI.
4. Verify production bundle uses the correct API URL.
5. Run public-domain smoke/E2E tests on `https://syn-twin-kappa.vercel.app/`.
6. Check landing, login, public pricing, Free demo, paid dashboard, payment return, and admin routing.
7. Inspect browser console and network for 404/401 loops, stale old API URLs, demo API leakage, failed assets, hydration errors, and CORS.
8. Record final deployment URL, commit SHA, test results, screenshots, and any backend API gaps.

Public Vercel QA is guest/read-only: landing, login/register entry, public pricing,
assets, metadata, console, network, and unauthenticated redirect behavior.
Free/Basic/Premium/SuperAdmin and mutation/payment states are covered by local
deterministic fixtures. Report authenticated public behavior as unverified; do not
create accounts, mutate production data, or initiate real VNPAY transactions.

Use implementation screenshots as the visual source of truth. Review each required
route/state at 360 and 1440 pixels, plus tablet widths for dense pages. No Figma
artifact or Figma synchronization is required.

## Verification searches

```powershell
rg -n -i 'FactoryScene|@react-three|\bthree\b|robot\.glb|3D|canView3D' app components lib package.json package-lock.json
rg -n -i '99\.8|latency|ROI|partner|leading manufacturers|predictive|sub-second|SOC-2|edge-hosted' app components
npm ls three @react-three/fiber @react-three/drei
git diff --check
```

Backend contract fields such as `canView3D` may remain in types only if still returned by the API; no UI or route may depend on them.

## Commit boundaries

1. Automated test/accessibility closure.
2. Responsive and visual fixes.
3. Dead-code/copy cleanup.
4. Production-only fixes discovered on Vercel.

## Exit criteria

- All spec success criteria are evidenced.
- Lint, typecheck, unit, build, E2E, accessibility, and visual suites pass.
- Public domain passes route/access/network/console smoke tests.
- No 3D runtime/claim or paid mock telemetry remains.
- Final commit and deployment are documented.
