# Spec: SynTwin industrial-minimal full-site redesign

**Date:** 2026-07-31
**Status:** Ready

---

## Problem Statement

SynTwin có chức năng quản lý nhà máy, robot và admin nhưng trải nghiệm còn thiếu nhất quán, phụ thuộc vào màn hình 3D không còn phù hợp, và landing chưa đủ độ tin cậy cho chủ/quản lý nhà máy. Cần một hệ thống giao diện sáng, industrial-minimal, data-first, giữ nguyên toàn bộ chức năng và bổ sung hành trình Free demo → paid dashboard rõ ràng.

---

## User Stories

- **[P1]** As a factory owner or manager, I want to understand SynTwin's real capabilities from the public landing page so that I can make an informed evaluation without marketing hype.
  Accepted when: `/` presents product value, representative interface, capabilities, operating flow, access/security, live plan path, FAQ, and sign-in/register CTAs without unsupported metrics, logos, or 3D claims.

- **[P1]** As an authenticated Free user, I want to explore a complete simulated dashboard so that I can understand the service before purchasing.
  Accepted when: `/dashboard/demo` is accessible only to authenticated Free users, clearly labels all values as simulated, uses deterministic mock data, exposes no real mutation, and links to Basic/Premium pricing.

- **[P1]** As a Basic or Premium user, I want to access operational dashboards backed by real API data so that I can monitor and manage my factory.
  Accepted when: Basic/Premium sessions reach all current customer routes and every existing read/write workflow still works with no 3D canvas.

- **[P1]** As a Free user, I want protected routes to lead me to the demo or upgrade path so that I understand why access is restricted and what to do next.
  Accepted when: every real `/dashboard/**` route except `/dashboard/demo` blocks Free users before protected content renders and provides a deterministic demo/pricing destination.

- **[P1]** As a SuperAdmin, I want the existing admin capabilities in the same design language so that I can manage users and companies without losing any control.
  Accepted when: `/admin/dashboard`, `/admin/users`, and `/admin/companies` preserve all current filters, details, role/status/subscription actions, monitor linking, loading, empty, and error states.

- **[P1]** As an operator, I want charts and exact status data instead of the 3D scene so that I can identify trends, thresholds, and incidents quickly.
  Accepted when: the factory overview contains fleet status, cycle/throughput, temperature/load, alert severity, robot comparison, and recent event context using real available data; missing history is stated honestly.

- **[P2]** As a user on mobile or keyboard, I want every core workflow to remain usable so that device or input method does not block work.
  Accepted when: all target routes work at 360px, 768px, and 1440px widths; focus is visible; navigation, dialogs, forms, tables/alternatives, and charts are operable or have accessible summaries.

- **[P2]** As a product team member, I want shared tokens and primitives so that future SynTwin UI work remains consistent.
  Accepted when: route-level styling uses semantic tokens and shared patterns for shell, page headers, data states, metrics, charts, controls, and paywalls instead of duplicated hardcoded visual rules.

- **[P3]** As an international user, I want full localization so that all product copy follows my language preference.
  Accepted when: deferred to a future localization project; this redesign only keeps language internally consistent per experience.

---

## Functional Requirements

1. FR-01: Preserve current backend endpoint paths, request bodies, session refresh, VNPAY checkout/return, company context, role semantics, robot management, alerts, analytics, profile/subscription, and admin mutations.
2. FR-02: Remove the 3D factory canvas, `FactoryScene` usage, plan gating for 3D presentation, and all public/product claims about 3D visualization.
3. FR-03: Replace the factory canvas with a responsive operational overview using current telemetry, robots, alerts, companies, and events where available.
4. FR-04: Every real chart must show unit, time/data scope, loading, empty, error, and last-updated/source context where meaningful.
5. FR-05: Add `/dashboard/demo` with deterministic simulated factories, robots, telemetry, trends, alerts, and events.
6. FR-06: Keep demo interactions read-only. Mutation controls must be disabled or intercepted with an explanation and upgrade CTA.
7. FR-07: Permit `/dashboard/demo` only for authenticated Free users.
8. FR-08: Permit real customer dashboard routes only for authenticated Basic/Premium users; redirect logged-out users to login and Free users to demo or pricing.
9. FR-09: Keep SuperAdmin restricted to `/admin/**` according to current role rules and do not silently mix admin/customer contexts.
10. FR-10: Redesign public landing with credible product positioning for factory decision-makers, representative UI, capabilities, workflow, access/security, pricing path, FAQ, and CTAs.
11. FR-11: Redesign login, register, pricing, payment result, not-found, customer shell/pages, and admin shell/pages with the same SynTwin design tokens.
12. FR-12: Preserve every current form field, filter, table action, dialog, confirmation, loading state, empty state, success feedback, and error feedback.
13. FR-13: Use the existing SynTwin logo without modification and centralize colors, typography, radii, spacing, state colors, and chart colors.
14. FR-14: Navigation must expose only destinations valid for the current role/subscription and retain the `/dashboard/settings` compatibility redirect.
15. FR-15: Remove or isolate unrelated legacy landing components/copy so they cannot appear in the SynTwin experience.
16. FR-16: Render all user-facing product copy in consistent Vietnamese while preserving backend enum values, identifiers, and payloads internally.

---

## Non-Functional Requirements

- Performance: remove Three.js/React Three Fiber from the customer overview path; no redesigned route may introduce a new blocking asset larger than 500 KB; production build must complete.
- Security: access checks must happen before protected page content renders; demo must not invoke protected mutation APIs; no tokens or credentials may be embedded in mock data or UI.
- Accessibility: all core controls must be keyboard reachable with visible focus; status cannot rely on color alone; text/control contrast must meet WCAG 2.1 AA.
- Responsive: no horizontal page overflow at 360px, 768px, 1024px, or 1440px; primary actions and critical status remain visible.
- Reliability: existing API errors remain recoverable and specific; charts never substitute invented values when a real API request fails.
- Maintainability: shared visual decisions use semantic tokens/components; TypeScript, ESLint, and production build pass with no newly introduced warnings.

---

## Success Criteria

- [ ] Route coverage: 100% of the 15 existing pages plus new `/dashboard/demo` render under their intended access state.
- [ ] Functional preservation: 100% of inventoried existing actions remain present and mapped to the same API contract.
- [ ] Access matrix: logged-out, Free, Basic, Premium, and SuperAdmin states each pass their expected route checks with zero protected-content flash.
- [ ] 3D removal: zero runtime imports/usages of `FactoryScene`, `three`, `@react-three/fiber`, or `@react-three/drei`, and zero user-facing 3D claims.
- [ ] Demo isolation: zero protected mutation API calls can be initiated from `/dashboard/demo`.
- [ ] Visual QA: approved screenshots exist for landing, auth, pricing, demo, real dashboard, one management page, and each admin page at 1440px and 360px.
- [ ] Quality gates: `npm run lint` and `npm run build` exit with code 0.
- [ ] Accessibility: automated scan reports zero critical/serious issues on landing, login, demo, real dashboard, and admin dashboard; keyboard smoke test passes primary flows.
- [ ] Copy credibility: zero unsupported uptime, customer-count, ROI, partner-logo, or 3D claims remain in rendered routes or metadata.
- [ ] Language consistency: all rendered routes use Vietnamese labels, actions, loading, empty, success, and error copy, except unchanged technical identifiers.

---

## Out of Scope

- Backend endpoint, schema, infrastructure, or Cloud Run changes.
- Real telemetry APIs that do not currently exist; missing backend data must be documented separately.
- Native mobile applications.
- Full internationalization framework and translated locale catalog.
- Reintroducing any 3D factory visualization.

---

## Assumptions

- Backend continues returning `Free`, `Basic`, `Premium` and `SuperAdmin` values currently modeled in `lib/auth.ts`.
- Existing Recharts dependency is sufficient for the redesigned charts.
- Backend exposes robot telemetry history for up to seven days, but staging
  currently disables InfluxDB; the frontend must treat an empty response as
  unavailable data, not fabricate history.
- Paid dashboard charts may derive summaries from latest state, telemetry history
  when available, command history, and browser-session samples, but must not
  fabricate missing load/throughput/OEE/alert history.
- `/pricing` remains the purchase/upgrade path and VNPAY remains the current payment workflow.
- The project-local skill name intentionally follows the user-requested spelling `syntwin-desgin`.
- No dedicated Free/Basic/Premium/SuperAdmin test accounts will be provisioned;
  authenticated access states are verified locally with deterministic API/session
  fixtures, while public-domain QA remains guest/read-only.
- Implementation is code-first and reviewed with screenshots; no Figma artifact is required.
