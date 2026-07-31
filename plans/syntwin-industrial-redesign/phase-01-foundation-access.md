# Phase 01: Foundation, access policy, and route isolation

## Stories covered

- P1 Free user protected-route handling.
- P1 Basic/Premium real-dashboard access.
- P1 SuperAdmin separation.
- P2 shared tokens/primitives.
- P2 keyboard/mobile foundation.

## Entry criteria

- Spec approved and current route/API inventory captured.
- Record baseline results for lint, typecheck, and build before source changes.

## Work

### 1. Baseline and tests

Add test tooling and scripts without changing runtime behavior:

- `vitest.config.ts`;
- `playwright.config.ts`;
- `tests/e2e/helpers/sessions.ts`;
- `tests/e2e/helpers/api-mocks.ts`;
- `scripts/check-build-assets.mjs`;
- dev dependencies `vitest`, `jsdom`, `@testing-library/react`,
  `@testing-library/jest-dom`, `@playwright/test`, and
  `@axe-core/playwright`;
- package scripts: `typecheck`, `test:unit`, `test:e2e`, `test:a11y`,
  `test:visual`, and `check:assets`.

Run `npx playwright install chromium`. Configure Playwright `webServer` to start
Next, use an environment-configurable `baseURL`, emit HTML/JUnit reports and
trace/screenshot/video on failure, and keep approved snapshots in a named
directory. `test:a11y` and `test:visual` are tagged Playwright projects.
Snapshot updates require an explicit reviewed `--update-snapshots` run.

Record a pre-change build/route asset baseline. `check-build-assets.mjs` compares
the Next build manifests against it and fails when the redesign adds a blocking
client chunk, font, or image larger than 500000 bytes.

Write access-policy tests before integrating the boundary:

- `lib/access-policy.test.ts`;
- `lib/safe-destination.test.ts`;
- `tests/e2e/access-matrix.spec.ts`.

### 2. Semantic visual foundation

Update `app/globals.css` to expose the skill’s semantic canvas, surface, ink, steel, muted, line, brand, status, chart, radius, spacing, focus, and typography roles.

Add reusable primitives:

- `components/shared/BrandMark.tsx`;
- `components/shared/PageHeader.tsx`;
- `components/shared/MetricCell.tsx`;
- `components/shared/StatusBadge.tsx`;
- `components/shared/DataState.tsx`;
- `components/shared/ChartPanel.tsx`;
- `components/shared/SourceContext.tsx`;
- `components/shared/ResponsiveDataTable.tsx`;
- `components/shared/PaywallNotice.tsx`;
- `components/shared/ConfirmAction.tsx`;
- `components/shared/FeedbackBanner.tsx`.

Do not restyle every route yet. Add Storybook only if already available; it is not required.

### 3. Pure access policy

Add:

- `lib/access-policy.ts`: `getDefaultDestination`, `evaluateRouteAccess`, `isFreeCustomer`, `isPaidCustomer`, `isAdmin`;
- `lib/safe-destination.ts`: same-origin/known-path validation, reject external URLs and `//`;
- `components/auth/AccessBoundary.tsx`;
- `components/auth/AccessLoading.tsx`.

Replace independent private session state inside `components/AuthGuard.tsx` with the centralized boundary/session subscription. Re-evaluate when payment/profile refresh updates local session.

Update:

- `app/login/page.tsx` and login-code success path to honor only eligible `next`;
- `app/register/page.tsx` to preserve its pricing handoff rather than using the
  Free-user default destination;
- add an auth-route boundary for `/login` and `/register`: when local session
  material exists, validate it with `restoreSession()` before rendering and
  redirect by policy; with no local session, render immediately without an
  authenticated request;
- `lib/api/client.ts` and the access boundary to use one idempotent redirect
  coordinator as the sole owner of expiry navigation. It captures and validates
  `pathname + search`, encodes it as `next`, and prevents competing redirects
  from concurrent 401/refresh failures;
- `app/not-found.tsx` to use the policy default.

Define the checkout return contract:

```text
/login?next=%2Fpricing%3Fplan%3DBasic
/login?next=%2Fpricing%3Fplan%3DPremium
```

Allowlist only `Basic|Premium`. Password and email-code login return to pricing
with that plan selected, but require a fresh user click before VNPAY navigation.
Successful registration always returns to pricing and preserves an eligible
selected plan.

### 4. Route isolation without URL changes

Move paid pages under:

```text
app/dashboard/(workspace)/layout.tsx
app/dashboard/(workspace)/page.tsx
app/dashboard/(workspace)/robots/page.tsx
app/dashboard/(workspace)/alerts/page.tsx
app/dashboard/(workspace)/analytics/page.tsx
app/dashboard/(workspace)/company/page.tsx
app/dashboard/(workspace)/user/page.tsx
app/dashboard/(workspace)/settings/page.tsx
```

- `app/dashboard/layout.tsx` owns only the pathname-aware dashboard boundary.
- `(workspace)/layout.tsx` owns paid-only admission, `CompanyProvider`, and the existing shell.
- Reserve `app/dashboard/demo/page.tsx` as a minimal Free-only placeholder with no company/API provider.
- Keep `/dashboard/settings` → `/dashboard/user` behavior after admission.

## Verification

- Unit-test every cell of the access matrix, invalid/external `next`, and eligible/ineligible return paths.
- E2E-test slow `restoreSession()` and confirm zero protected-content flash.
- Allow only `GET /api/auth/me` and token refresh when required during demo
  admission; confirm `/dashboard/demo` creates no company, robot, telemetry,
  subscription, user-management, or admin request.
- Confirm payment/profile session updates re-evaluate destination.
- Test direct authenticated visits to login/register, slow restore, stale token,
  no-session immediate form render, and zero auth-form flash.
- Test missing token, failed refresh, concurrent 401s, query preservation, and
  unsafe destinations through the redirect coordinator.
- Confirm route URLs are unchanged after route-group moves.
- Run lint, typecheck, unit tests, access E2E, asset check, and build after each
  commit.

## Commit boundaries

1. Test tooling and baseline record.
2. Semantic tokens/shared primitives.
3. Pure access policy and tests.
4. Boundary integration and safe destinations.
5. Route groups and conditional provider mounting.

## Exit criteria

- Access matrix passes for logged-out, Free, Basic, Premium, and SuperAdmin.
- Demo placeholder is structurally isolated from live providers.
- Existing paid/admin pages still render unchanged for eligible sessions.
- Build passes; baseline lint issues are documented and no new issue is introduced.
