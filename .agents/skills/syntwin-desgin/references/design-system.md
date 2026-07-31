# SynTwin industrial-minimal design system

## Brand foundation

Use the existing robot-arm marks:

- primary vector: `public/images/syntwin-logo.svg`;
- raster fallback: `public/images/syntwin-logo.png`;
- primary accent: `#FD3E06`;
- primary hover: `#E63600`.

Do not redraw, distort, recolor, crop the arm, or place it on a busy background. Prefer the SVG where possible.

## Color roles

Use semantic CSS variables rather than route-level hardcoded hex values.

| Role | Value | Use |
| --- | --- | --- |
| Canvas | `#F9FAFA` | App and landing background |
| Surface | `#FFFFFF` | Panels, tables, forms |
| Ink | `#0F172A` | Primary text and strong structure |
| Steel | `#334155` | Secondary headings and icons |
| Muted | `#64748B` | Supporting copy and metadata |
| Line | `#E2E8F0` | Dividers, borders, chart grids |
| Brand | `#FD3E06` | Primary action, active state, key series |
| Brand hover | `#E63600` | Interactive brand state |
| Success | `#22C55E` | Healthy/online |
| Warning | `#F59E0B` | Degraded/attention |
| Danger | `#EF4444` | Critical/error/destructive |
| Info | `#2563EB` | Neutral system information |

Orange is not a general decoration. Keep most screens neutral so the logo and key operational signals remain distinct.

## Typography

- UI/body: Inter.
- Telemetry, identifiers, timestamps, units, and numeric metrics: JetBrains Mono.
- Use tabular numerals for data.
- Prefer sentence case. Reserve uppercase tracking for short technical eyebrows and table metadata.
- Use a restrained scale: 12/16, 14/20, 16/24, 20/28, 28/34, 40–64 for the landing hero.

## Shape, spacing, and depth

- Use a 4px spacing base with primary steps 4, 8, 12, 16, 24, 32, 48, 64.
- Use 6–8px radii for controls and operational panels; 10–12px only for major marketing surfaces.
- Use 1px borders for hierarchy.
- Avoid shadows in dashboards unless separating an overlay. Landing page may use one restrained hero/device shadow.
- Use a fine technical grid only in signature/hero/chart areas, never across every surface.

## Layout

- Desktop shell: persistent navigation, compact command header, fluid content.
- Operational pages: max information width should follow available viewport rather than a narrow marketing container.
- Landing: use a controlled 1200–1280px content width.
- Align titles, controls, KPI values, charts, and tables to a repeatable grid.
- On mobile, prioritize status, urgent action, primary chart, then detail. Do not shrink dense desktop layouts wholesale.

## Components

- Buttons: one primary orange action per local decision area; neutral secondary actions; red only for destructive actions.
- Cards: use panels only when content is semantically grouped. Avoid nesting cards.
- Tables: sticky header where useful, clear row hover/focus, exact values, responsive alternatives for mobile.
- Badges: compact, lightly tinted, always pair color with text/icon.
- Forms: persistent labels, specific help/error text, visible focus ring.
- Empty states: explain why no data exists and give the next valid action.

## Charts

- Use Recharts already installed in the project.
- Use brand orange for the focal series, then blue, green, amber, and violet only when multiple series are necessary.
- Keep grid lines subtle and axes legible.
- Always show units, time range, timezone where relevant, tooltip, and last-updated/loading/error state.
- Use real API data in paid dashboards and clearly deterministic mock data in `/dashboard/demo`.
- Do not imply precision unavailable from the API.
- Support keyboard-readable summaries or adjacent textual statistics for essential chart meaning.

## Motion and accessibility

- Use one orchestrated landing reveal and restrained 120–200ms UI transitions.
- Respect `prefers-reduced-motion`.
- Maintain WCAG AA contrast, visible focus, meaningful landmarks, and minimum 44px touch targets on mobile.
- Never communicate status by color alone.
