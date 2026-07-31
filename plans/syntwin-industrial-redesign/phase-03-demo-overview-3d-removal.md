# Phase 03: Isolated Free demo, real paid overview, and complete 3D removal

## Stories covered

- P1 authenticated Free demo.
- P1 paid real-data dashboard.
- P1 charts/status instead of 3D.
- P1 honest unavailable data states.

## Entry criteria

- Route isolation proves demo does not mount `CompanyProvider`.
- Shared chart/state primitives and access matrix are stable.

## Work

### 1. Deterministic demo domain

Add:

- `lib/demo/types.ts`;
- `lib/demo/data.ts`;
- `lib/demo/selectors.ts`;
- `lib/demo/data.test.ts`;
- `components/demo/DemoShell.tsx`;
- `components/demo/DemoDashboard.tsx`;
- `components/demo/DemoMutationButton.tsx`;
- `components/demo/DemoUpgradeNotice.tsx`.

Fixtures use fixed IDs, fixed ISO timestamps, fixed values, and no `Date.now`, `Math.random`, or `crypto.randomUUID`.

Build `/dashboard/demo` as a complete read-only product showroom with:

- fleet status distribution;
- simulated cycle/throughput trend;
- temperature/load trend;
- simulated alert severity;
- robot comparison;
- recent simulated events;
- persistent “Simulated demo data” label;
- Basic/Premium comparison and upgrade CTA.

Selection, filters, tabs, and tooltips may be interactive. Mutation-like actions must be intercepted before any form/API call.

Add ESLint restricted-import rules for demo feature paths to reject imports from
live product API/company-context modules. The outer access boundary may perform
only authentication bootstrap/refresh (`GET /api/auth/me` and refresh when
required). Add `tests/e2e/demo-isolation.spec.ts` that fails on company, robot,
telemetry, subscription, user-management, or admin endpoints and on every
non-auth mutation. Assert all non-auth demo data comes from deterministic local
fixtures.

### 2. Real fleet adapter

Add:

- `hooks/useFleetSnapshot.ts`;
- `lib/api/telemetry.ts`;
- `lib/operations/fleet-selectors.ts`;
- `lib/operations/session-samples.ts`;
- unit tests for selectors and stale/partial-error behavior;
- `components/operations/FleetStatusPanel.tsx`;
- `TemperatureTrend.tsx`;
- `RobotComparisonTable.tsx`;
- `CurrentConditions.tsx`;
- `UnavailableOperationalMetric.tsx`;
- `RecentRobotContext.tsx`.

Use robot inventory and `getRobotLatestState` with `Promise.allSettled`. Preserve last good snapshots as visibly stale on refresh error. Derive only:

- current online/status distribution;
- current temperature by robot;
- current collision warnings;
- latest-seen/source comparison;
- current joint/TCP state where useful.

Add a typed frontend wrapper for:

```text
GET /api/robots/{robotId}/telemetry/history
```

Support `from`, `to`, `intervalSeconds`, `limit`, `runtimeSessionId`, and `fields`.
Use backend history for temperature, latency, status, collision warning, joint, and
TCP charts when points exist. Respect the one-hour default, seven-day maximum, and
10000-point maximum. Staging currently disables InfluxDB, so an empty history
response must render “Chưa có dữ liệu lịch sử từ hệ thống telemetry.”

Optional fallback trend points are sampled only after page open and labelled
“Dữ liệu trong phiên trình duyệt hiện tại; không được lưu trữ”.

Use robot command history for recent activity and real command success/failure.
Show explicit unavailable panels for backend gaps: load, aggregate
throughput/cycle time/OEE, factory-run history listing, alert lifecycle/severity,
and predictive maintenance. Keep `docs/backend-capability-assessment.md` as the
source-of-truth feedback rather than creating fake data.

### 3. Replace paid overview

Rewrite the paid `app/dashboard/(workspace)/page.tsx` around the real adapter and shared presentation. Overview actions link to the real robot/company routes; do not preserve local-only mock CRUD as if it were production behavior.

Remove unsupported DashboardHeader CPU, memory, latency, Live, notification count, and System Online claims unless a real endpoint is identified.

### 4. Atomic runtime/dependency cleanup

- Remove dynamic `FactoryScene` import.
- Delete `components/FactoryScene.tsx`.
- Delete overview-only `RobotPanel.tsx`, `AlertPanel.tsx`, and `RobotFormDialog.tsx` only after confirming no imports.
- Remove overview imports/exports from `lib/mock-data.ts`; demo uses its own
  deterministic module. Retain only the minimal analytics export still required
  by the unmigrated Phase 04 page, mark it temporary, and never reuse it.
  Delete the module in the Phase 04 analytics commit after zero-reference proof.
- Remove rendered `canView3D` gates/copy but retain backend response typing.
- Run npm uninstall for `three`, `@react-three/fiber`, `@react-three/drei`, and dev `@types/three` so package-lock remains synchronized.
- Remove `public/robot.glb` only after zero-reference proof.
- Do not delete `fairino_description` without confirming repository ownership/purpose.

## Verification

- Free-only demo access; paid/admin redirects; logged-out login return.
- Demo allows only required auth bootstrap/refresh; it makes zero company,
  robot, telemetry, subscription, user-management, or admin calls and zero
  non-auth mutation requests.
- Paid dashboard uses only successful real API data or explicit unavailable states.
- Test no-company, zero-robot, partial robot failure, all failure, stale recovery, abort, and company switch.
- Search plus `npm ls three @react-three/fiber @react-three/drei` and production
  bundle inspection show zero runtime Three.js/FactoryScene/3D references.
- Compare `package.json` and lockfile after uninstall.
- Screenshot demo and real overview at all target widths and data states.

## Commit boundaries

1. Demo fixtures/tests.
2. Demo UI and mutation interception.
3. Fleet adapter/selectors/tests.
4. Paid overview replacement.
5. Runtime 3D removal.
6. Dependency/assets/copy cleanup and API feedback.

## Exit criteria

- Factory 3D is completely absent.
- Free demo is deterministic, labelled, useful, and network-isolated.
- Paid overview never presents mock data as real.
- Quality checks and demo/access E2E pass.
