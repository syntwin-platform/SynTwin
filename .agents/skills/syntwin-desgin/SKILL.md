---
name: syntwin-desgin
description: Project-specific design and implementation guidance for SynTwin's Next.js frontend. Use when designing, redesigning, reviewing, or implementing SynTwin landing, authentication, pricing, customer dashboard, demo dashboard, admin dashboard, responsive layouts, data visualizations, navigation, or shared UI components. Preserve existing product behavior and APIs while enforcing the SynTwin industrial-minimal visual system, subscription access rules, credible product messaging, accessibility, and visual verification.
---

# SynTwin Design

Create a bright, professional industrial interface that feels precise, calm, and credible. Keep all existing behavior unless the task explicitly changes a product rule.

## Load project context

Before editing, read only the references relevant to the task:

- Always read [design-system.md](references/design-system.md).
- Read [product-rules.md](references/product-rules.md) for authentication, subscription, demo, pricing, or dashboard access.
- Read [page-map.md](references/page-map.md) when changing navigation, layouts, or multiple routes.

Inspect the current route, its API calls, loading/error/empty states, and related shared components before changing code. Treat existing data contracts and mutations as behavior that must not regress.

## Design direction

Use **industrial minimalism**:

- Make the interface bright, clean, exact, and information-led.
- Use the robot-arm logo and its orange-red accent as the recognizable brand signal.
- Use graphite, steel, and cool gray for structure; reserve orange-red for primary actions, active state, and one important data series.
- Prefer hairline dividers, aligned baselines, restrained radii, and tabular data over decorative cards.
- Use white space to create hierarchy without making operational screens sparse.
- Spend visual boldness on one signature: a precise telemetry rail or technical plotting surface with fine grid/tick details. Keep the rest quiet.
- Avoid neon sci-fi styling, heavy glassmorphism, excessive gradients, oversized rounded cards, generic floating blobs, and dark control-room backgrounds.

## Workflow

1. Inventory the current page:
   - user goal;
   - routes and navigation entry points;
   - API reads and writes;
   - forms, dialogs, filters, tables, and destructive actions;
   - loading, empty, error, disabled, and responsive states.
2. Preserve behavior:
   - do not remove a feature because its old presentation is being replaced;
   - maintain API payloads, validation, authorization, and feedback;
   - keep keyboard and screen-reader behavior;
   - keep admin and customer flows visually related but clearly scoped.
3. Compose with shared primitives:
   - centralize tokens in `app/globals.css`;
   - extend existing `components/ui` primitives before creating one-off controls;
   - create shared shell, page header, metric, chart, data-state, and paywall patterns where repetition exists.
4. Build data-first layouts:
   - show the decision or anomaly before secondary detail;
   - combine a small number of KPI summaries with trend/context charts;
   - use tables for exact comparison and charts for patterns;
   - never fabricate live production data outside the explicitly labeled demo route.
5. Verify:
   - run lint and production build;
   - test all affected routes at desktop and mobile widths;
   - capture screenshots and review hierarchy, clipping, overflow, contrast, focus, and empty/loading/error states;
   - confirm existing interactions and API calls still work.

## Factory analytics rules

Remove the 3D factory canvas from the product. Replace it with an operational overview using available telemetry:

- fleet availability and status distribution;
- throughput/cycle-time trend;
- temperature and load trend;
- alert volume/severity;
- robot comparison and recent events.

Prefer line/area charts for time, bars for comparison, and segmented bars or compact donuts for composition. Avoid gauges unless a hard threshold is the primary decision. Add units, time range, source/last-updated state, accessible labels, and honest empty/error states.

## Copy rules

Write for factory owners and managers who can validate technical claims:

- lead with operational decisions and measurable capabilities;
- explain how data is collected, monitored, and acted upon;
- avoid unsupported customer counts, uptime percentages, ROI numbers, partner logos, and superlatives;
- label demo content as simulated;
- use active, specific control labels;
- keep English or Vietnamese consistent within each experience unless localization is explicitly requested.

## Definition of done

A SynTwin redesign is complete only when:

- existing functional paths remain available;
- route access follows [product-rules.md](references/product-rules.md);
- no 3D factory UI or 3D marketing claim remains;
- the landing page is credible and complete for a purchasing decision-maker;
- customer, demo, pricing, auth, and admin surfaces share the same tokens and interaction language;
- charts are responsive and accessible;
- lint/build pass and screenshots have been reviewed at representative breakpoints.
