# Phase 04: Customer management routes

## Stories covered

- P1 Basic/Premium operational workflows.
- P1 chart/status replacement across alerts and analytics.
- P2 responsive, keyboard, and shared-component consistency.

## Entry criteria

- Paid workspace shell and fleet adapter are stable.
- Demo and live domains are separated.
- Overview uses the final shared visual primitives.

## Work

Create a route/action/API traceability checklist before each page migration.

### Robots

Redesign `app/dashboard/(workspace)/robots/page.tsx` first. Preserve:

- company-scoped list;
- five-second latest-state polling and abort cleanup;
- owner versus monitor behavior;
- create, edit, delete, reset device secret;
- every field/validation;
- destructive confirmations;
- one-time secret display/copy;
- loading, empty, partial state, and API errors.

Fix pre-existing effect/lint issues without altering polling semantics. Ensure dialogs trap/restore focus, close with Escape, have labelled titles, and use 44px mobile targets.

### Company

Redesign `company/page.tsx` while preserving selected-company persistence and fallback, create/edit, owner/monitor permissions, members, monitor add/replace/status/remove, confirmations, counts, and feedback.

Do not consolidate the two company API modules during this visual phase; their input normalization/types differ.

### Profile and subscription

Redesign `user/page.tsx` while preserving profile/subscription reads, name/avatar/timezone update, billing navigation, and session refresh. Remove only rendered 3D capability language. Keep settings compatibility.

### Alerts

Replace hardcoded `ROBOT_LOGS` with current real conditions from the fleet adapter:

- collision warnings/current connectivity;
- real robot command status/failure results;
- current condition filters and detail selection;
- timestamps/source and partial/stale states.

Keep the useful filter/detail interaction, but explicitly state that historical alert log and acknowledgement are unavailable until a backend endpoint exists. Do not label current conditions as history.

### Analytics

Replace seeded historical KPIs with:

- current robot comparison;
- backend telemetry history for temperature, latency, status, collision, joint,
  and TCP series when InfluxDB returns points;
- browser-session samples clearly labelled;
- real temperature/current status;
- unavailable panels for load, aggregate throughput/OEE, alert lifecycle, and
  factory-run history that the current backend cannot list.

Preserve robot selection, company-change reset, zero-robot state, and exact units for real fields.

After the analytics page no longer imports its temporary seed export, run a
zero-reference search and delete the remaining `lib/mock-data.ts` module in the
same buildable commit.

### Shared shell/navigation

Finalize customer desktop/mobile navigation, `aria-current`, safe-area padding, company switcher, account menu, logout, paywall destinations, and removal of emoji/full-page reload links.

## Verification

- Verify every preserved mutation locally through deterministic API/session
  fixtures for owner and monitor roles. Do not create staging/public test accounts;
  mark authenticated live mutation testing as not verified.
- Verify owner and monitor presentations/actions separately.
- Test `maxRobots` `-1`, `0`, `1`, `2`, `3+`.
- Test company selection storage synchronization and revoked-company fallback.
- Test loading, empty, error, partial, stale, and retry states for each route.
- Network trace confirms same methods/paths/payloads.
- Keyboard/dialog/table/mobile smoke tests.
- Screenshot each route at 360 and 1440 plus one tablet width.
- Lint, typecheck, unit, customer E2E, and build.

## Commit boundaries

1. Robots.
2. Company.
3. Profile/subscription/settings.
4. Alerts real-current-state migration.
5. Analytics real/session-state migration.
6. Customer shell/mobile navigation closure.

## Exit criteria

- All existing real customer actions remain available with unchanged contracts.
- No paid route contains fabricated operational data.
- Customer routes share the industrial-minimal system and pass responsive/accessibility smoke tests.
