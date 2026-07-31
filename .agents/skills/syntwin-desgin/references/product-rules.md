# SynTwin product and access rules

## Audience

The primary buyer is a factory owner or manager. The product must also withstand scrutiny from technically knowledgeable operators and engineers. Use credible detail, not hype.

## Product language

Use Vietnamese consistently across the public site, authentication, pricing,
customer dashboard, demo, payment feedback, empty/error states, and admin
application. Keep API enum values and machine identifiers unchanged internally,
but translate their displayed labels. Do not mix English headings with Vietnamese
body copy unless a technical term has no clear Vietnamese equivalent.

## Subscription access matrix

| User state | Landing `/` | Login/register | Pricing | `/dashboard/demo` | Real `/dashboard/**` | `/admin/**` |
| --- | --- | --- | --- | --- | --- | --- |
| Logged out | Allowed | Allowed | Authenticate before checkout | Redirect to login | Redirect to login | Redirect to login |
| Free user | Allowed | Already authenticated | Allowed | Allowed | Redirect to demo or pricing | Forbidden |
| Basic user | Allowed | Already authenticated | Allowed | Redirect to real dashboard or allow preview only if explicitly requested | Allowed | Forbidden |
| Premium user | Allowed | Already authenticated | Allowed | Redirect to real dashboard or allow preview only if explicitly requested | Allowed | Forbidden |
| SuperAdmin | Allowed | Already authenticated | As currently supported | Not a customer demo target | Do not silently mix with customer workspace | Allowed |

Only authenticated Free users may enter `/dashboard/demo`. Basic and Premium subscriptions unlock the real customer dashboard.

Apply access control at the shared route/layout boundary. Avoid a flash of protected content. Preserve the intended return destination through login or checkout when practical.

## Demo rules

- The demo is a complete, read-only simulated factory experience.
- Place a persistent “Simulated demo data” indicator in the shell and chart context.
- Use deterministic values and timestamps so screenshots and tests are stable.
- Disable or intercept mutations such as add/edit/delete robot, commands, invitations, and profile/company changes; explain that the action is available on a paid workspace.
- Provide clear paths to compare Basic/Premium and upgrade.
- Never call protected production telemetry APIs from the demo.

## Dashboard rules

- Basic and Premium use real API data.
- Preserve company selection, robot management, alerts, analytics, company membership, profile, subscription, and admin capabilities.
- Replace the 3D Factory View completely with operational charts and metrics.
- Remove `canView3D` as a presentation gate; do not change backend contracts merely to redesign the frontend.
- Keep status, threshold, and subscription errors explicit.

## Landing rules

The public landing page must provide enough information for a factory decision-maker to evaluate SynTwin:

1. Clear operational promise without fabricated numbers.
2. Product visualization using representative, labeled interface data.
3. Capabilities: fleet monitoring, telemetry, alerts, analytics, company access, robot management.
4. How deployment/data flow works, phrased only as supported by the project.
5. Security/access explanation based on existing role behavior.
6. Basic/Premium comparison linked to live pricing.
7. FAQ addressing adoption, data, access, and plans.
8. Direct sign-in and registration/plan CTAs.

Remove all 3D visualization claims from metadata, copy, feature lists, pricing feature text, and UI.

## Functional preservation

Redesign presentation without changing:

- backend endpoint paths or payloads;
- authentication token lifecycle;
- VNPAY checkout/return behavior;
- role and company membership semantics;
- robot CRUD and device-secret flows;
- alert filtering and acknowledgement behavior if currently present;
- admin user/company management.
