import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { installAdminApiMocks } from "./helpers/admin-api-mocks";
import { installApiMocks } from "./helpers/api-mocks";
import {
    installSession,
    type SessionKind,
} from "./helpers/sessions";

const publicRoutes = ["/", "/login", "/register", "/pricing"] as const;
const customerRoutes = [
    "/dashboard/demo",
    "/dashboard",
    "/dashboard/robots",
    "/dashboard/company",
    "/dashboard/user",
    "/dashboard/alerts",
    "/dashboard/analytics",
] as const;
const adminRoutes = [
    "/admin/dashboard",
    "/admin/users",
    "/admin/companies",
] as const;

for (const route of publicRoutes) {
    test(`${route} không có lỗi a11y nghiêm trọng @a11y`, async ({ page }) => {
        await installSession(page, "none");
        await installApiMocks(page, { session: "none" });
        await openAndWait(page, route);
        await expectNoSeriousViolations(page);
    });
}

for (const route of customerRoutes) {
    test(`${route} không có lỗi a11y nghiêm trọng @a11y`, async ({ page }) => {
        const session: SessionKind =
            route === "/dashboard/demo" ? "free" : "basic";
        await installSession(page, session);
        await installApiMocks(page, { session });
        await openAndWait(page, route);
        await expectNoSeriousViolations(page);
    });
}

for (const route of adminRoutes) {
    test(`${route} không có lỗi a11y nghiêm trọng @a11y`, async ({ page }) => {
        await installSession(page, "admin");
        await installAdminApiMocks(page);
        await openAndWait(page, route);
        await expectNoSeriousViolations(page);
    });
}

async function openAndWait(page: Page, route: string): Promise<void> {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
}

async function expectNoSeriousViolations(page: Page): Promise<void> {
    const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
    const blocking = result.violations.filter(
        (violation) =>
            violation.impact === "critical" ||
            violation.impact === "serious"
    );

    if (blocking.length > 0) {
        throw new Error(
            blocking
                .map(
                    (violation) =>
                        `${violation.id} (${violation.impact}): ${violation.nodes
                            .map(
                                (node) =>
                                    `${node.target.join(" ")} — ${node.failureSummary ?? ""}`
                            )
                            .join(", ")}`
                )
                .join("\n")
        );
    }
}
