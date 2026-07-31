# Phase 05: Admin application

## Stories covered

- P1 SuperAdmin retains complete management capability.
- P2 shared visual language, responsive tables, keyboard operation.

## Entry criteria

- Access policy reliably separates admin and customer destinations.
- Shared shell, data-state, chart, table, dialog, and feedback primitives are stable.
- Deterministic local SuperAdmin/company/user API fixtures cover list, filter,
  pagination, detail, mutation success, validation, and failure states. No live
  admin account is required.

## Work

### Admin shell

Add:

- `components/shell/AdminShell.tsx`;
- `AdminHeader.tsx`;
- `AdminSidebar.tsx`;
- `AdminMobileNav.tsx`;
- `components/navigation/admin-nav.ts`.

Migrate current `components/AdminHeader.tsx` and `AdminSidebar.tsx` behavior into the shell. Preserve logout and active navigation. Add mobile navigation for every admin route.

### Admin overview

Redesign `app/admin/dashboard/page.tsx` while preserving:

- metrics derived from current admin API composition;
- refresh and abort behavior;
- total users, active accounts, companies, linked monitors;
- plan/status distributions;
- loading/error/empty states.

Use accessible chart summaries and honest source labels. Do not imply snapshot simultaneity beyond the composed requests.

### Users

Redesign `app/admin/users/page.tsx` while preserving:

- search;
- role/status/plan filters and clear;
- page size 20 and pagination;
- selected user detail;
- role/status/subscription mutations;
- SuperAdmin restrictions;
- success/error/dirty/disabled states.

Use a responsive table with exact-value mobile rows; do not remove columns/actions merely to fit mobile.

### Companies

Redesign `app/admin/companies/page.tsx` while preserving:

- search/list/select;
- owner/member detail;
- monitor add/replace/remove;
- confirmation;
- list/detail count refresh;
- loading/error/empty states.

## Verification

- SuperAdmin access and non-admin redirects for Free/Basic/Premium.
- Network trace of all admin GET/PATCH/POST/PUT/DELETE paths and unchanged payloads.
- Filter combinations, pagination boundary, refresh, abort, empty data, backend validation, and mutation success/error.
- Keyboard table/detail/dialog flows and focus restoration.
- Chart text summaries and status not color-only.
- Screenshot admin overview/users/companies at 360, 768, and 1440.
- Lint, typecheck, admin E2E, accessibility scan, and build.

## Commit boundaries

1. Admin shell/navigation.
2. Overview.
3. Users.
4. Companies.

## Exit criteria

- Every existing admin workflow passes traceability checks.
- Admin pages are usable on desktop and mobile.
- No customer/demo provider or navigation is mounted in admin.
