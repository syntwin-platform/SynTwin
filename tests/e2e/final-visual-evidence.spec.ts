import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { installAdminApiMocks } from "./helpers/admin-api-mocks";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

const widths = [360, 768, 1440] as const;

const customerRoutes = [
    { name: "overview", route: "/dashboard" },
    { name: "robots", route: "/dashboard/robots" },
    { name: "company", route: "/dashboard/company" },
    { name: "profile", route: "/dashboard/user" },
    { name: "alerts", route: "/dashboard/alerts" },
    { name: "analytics", route: "/dashboard/analytics" },
] as const;

const adminRoutes = [
    { name: "overview", route: "/admin/dashboard" },
    { name: "users", route: "/admin/users" },
    { name: "companies", route: "/admin/companies" },
] as const;

for (const scenario of customerRoutes) {
    for (const width of widths) {
        test(`customer-${scenario.name}-${width} @visual`, async ({ page }) => {
            await installSession(page, "basic");
            await installApiMocks(page, { session: "basic" });
            await captureEvidence(
                page,
                scenario.route,
                "phase-04",
                `${scenario.name}-${width}`,
                width
            );
        });
    }
}

for (const scenario of adminRoutes) {
    for (const width of widths) {
        test(`admin-${scenario.name}-${width} @visual`, async ({ page }) => {
            await installSession(page, "admin");
            await installAdminApiMocks(page);
            await captureEvidence(
                page,
                scenario.route,
                "phase-05",
                `${scenario.name}-${width}`,
                width
            );
        });
    }
}

async function captureEvidence(
    page: Page,
    route: string,
    phase: string,
    name: string,
    width: number
): Promise<void> {
    const evidenceDir = resolve(process.cwd(), "artifacts", phase);
    mkdirSync(evidenceDir, { recursive: true });
    await page.setViewportSize({ width, height: 960 });
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect
        .poll(() =>
            page.evaluate(
                () => document.documentElement.scrollWidth <= window.innerWidth
            )
        )
        .toBe(true);
    await expandScrollableShell(page);
    await page.screenshot({
        path: resolve(evidenceDir, `${name}.png`),
        fullPage: true,
    });
}

async function expandScrollableShell(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.documentElement.style.overflowX = "hidden";
        document.body.style.overflowX = "hidden";
        const main = document.querySelector("main");
        if (!main) return;
        main.style.height = "auto";
        main.style.minHeight = "100vh";
        main.style.overflowY = "visible";
        main.style.overflowX = "hidden";
        let parent = main.parentElement;
        while (parent) {
            parent.style.height = "auto";
            parent.style.minHeight = "0";
            parent.style.overflowY = "visible";
            parent.style.overflowX = "hidden";
            parent = parent.parentElement;
        }
    });
}
