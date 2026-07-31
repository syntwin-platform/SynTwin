# SynTwin route and surface map

## Public and acquisition

- `/`: full public landing page.
- `/login`: sign in and route by role/subscription.
- `/register`: account creation, then pricing.
- `/pricing`: live Free/Basic/Premium plan data and VNPAY checkout; currently authenticated.
- `/payment/vnpay-return`: checkout result and session refresh.
- global `not-found`: recovery links based on session state.

## Customer application

- `/dashboard`: factory operational overview; replace the 3D canvas with charts.
- `/dashboard/demo`: new Free-user-only simulated product experience.
- `/dashboard/robots`: robot list, detail, create/edit/delete, reset device secret.
- `/dashboard/alerts`: alert monitoring and detail/actions.
- `/dashboard/analytics`: historical/robot analytics.
- `/dashboard/company`: company details, ownership, members, monitors.
- `/dashboard/user`: profile and subscription.
- `/dashboard/settings`: compatibility redirect to `/dashboard/user`.

Shared customer surfaces:

- `components/AuthGuard.tsx`;
- `components/Sidebar.tsx`;
- `components/MobileBottomNav.tsx`;
- `components/DashboardHeader.tsx`;
- `components/CompanySwitcher.tsx`;
- `lib/company-context.tsx`.

## Admin application

- `/admin/dashboard`: platform metrics and distributions.
- `/admin/users`: filters, table, detail, role/status/subscription actions.
- `/admin/companies`: company list, member detail, monitor linking.

Shared admin surfaces:

- `components/AdminSidebar.tsx`;
- `components/AdminHeader.tsx`;
- `components/AuthGuard.tsx` with `requireAdmin`.

## Existing technical foundation

- Next.js App Router, React 19, TypeScript.
- Tailwind CSS v4 theme variables in `app/globals.css`.
- Radix/shadcn-style primitives in `components/ui`.
- Recharts and `components/ui/chart.tsx`.
- Framer Motion.
- Session persisted through `lib/auth.ts`; server profile/session restoration through `lib/api/auth`.

## Redesign sequencing

1. Tokens and shared primitives.
2. Access guard and route destinations.
3. Public landing/auth/pricing/payment/not-found.
4. Shared customer shell and demo.
5. Real factory overview and chart replacement.
6. Remaining customer management pages.
7. Shared admin shell and admin pages.
8. Responsive/accessibility/cross-route regression pass.

Keep each phase independently buildable and reviewable. Avoid a single wholesale rewrite that mixes access-control changes with every visual page change.
