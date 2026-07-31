import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

const evidenceDir = resolve(process.cwd(), "artifacts/phase-03");

for (const scenario of [
    { name: "demo-1440", route: "/dashboard/demo", session: "free" as const, width: 1440, height: 1000 },
    { name: "demo-360", route: "/dashboard/demo", session: "free" as const, width: 360, height: 900 },
    { name: "overview-1440", route: "/dashboard", session: "basic" as const, width: 1440, height: 1000 },
    { name: "overview-360", route: "/dashboard", session: "basic" as const, width: 360, height: 900 },
]) {
    test(`${scenario.name} @visual`, async ({ page }) => {
        mkdirSync(evidenceDir, { recursive: true });
        await page.setViewportSize({
            width: scenario.width,
            height: scenario.height,
        });
        await installSession(page, scenario.session);
        await installApiMocks(page, { session: scenario.session });
        await page.goto(scenario.route);
        await expect(
            page.getByRole("heading", {
                level: 1,
                name:
                    scenario.session === "free"
                        ? "Tổng quan nhà máy mô phỏng"
                        : "Tổng quan vận hành",
            })
        ).toBeVisible();
        if (scenario.session === "free") {
            await expect(
                page.locator(".recharts-area-curve")
            ).toHaveCount(1);
            await expect(
                page.locator(".recharts-line-curve")
            ).toHaveCount(2);
        } else {
            await expect(
                page.getByText(/60[,.]9\s*°C/).first()
            ).toBeVisible();
            await expect(
                page.getByText("Start", { exact: true })
            ).toBeVisible();
            await page.evaluate(() => {
                const main = document.querySelector("main");
                if (!main) return;
                main.style.height = "auto";
                main.style.overflow = "visible";
                let parent = main.parentElement;
                while (parent) {
                    parent.style.height = "auto";
                    parent.style.overflow = "visible";
                    parent = parent.parentElement;
                }
            });
        }
        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <=
                        window.innerWidth
                )
            )
            .toBe(true);
        await page.screenshot({
            path: resolve(evidenceDir, `${scenario.name}.png`),
            fullPage: true,
        });
    });
}
