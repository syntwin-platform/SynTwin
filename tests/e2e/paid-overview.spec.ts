import { expect, test } from "@playwright/test";
import { fixtureRobot } from "./fixtures/product";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

test.describe("tổng quan vận hành trả phí dùng dữ liệu thật", () => {
    test("đọc inventory, trạng thái, lịch sử và hoạt động robot từ API", async ({
        page,
    }) => {
        await installSession(page, "basic");
        const api = await installApiMocks(page, { session: "basic" });

        await page.goto("/dashboard");

        await expect(
            page.getByRole("heading", { name: "Tổng quan vận hành" })
        ).toBeVisible();
        await expect(
            page.getByText(fixtureRobot.robotName, { exact: true }).first()
        ).toBeVisible();
        await expect(
            page.getByText(/61[,.]8\s*°C/).first()
        ).toBeVisible();
        await expect(page.getByText(/18\s*ms/).first()).toBeVisible();
        await expect(
            page.getByText(/Đang chạy|Running|Trực tuyến/i).first()
        ).toBeVisible();
        await expect(page.getByText(/J1.*12[,.]4°/).first()).toBeVisible();
        await expect(page.getByText(/X 420[,.]5.*Y 112[,.]3/i).first()).toBeVisible();
        await expect(page.getByText(/Nguồn: fixture/i).first()).toBeVisible();
        await expect(
            page.getByText("Dữ liệu mô phỏng", { exact: false })
        ).toHaveCount(0);
        await expect(
            page.getByText(/3D/i)
        ).toHaveCount(0);

        const requestedPaths = api.requests.map(
            (request) => new URL(request.url()).pathname
        );
        expect(requestedPaths).toContain("/api/robots");
        expect(requestedPaths).toContain(
            `/api/robots/${fixtureRobot.id}/state/latest`
        );
        expect(requestedPaths).toContain(
            `/api/robots/${fixtureRobot.id}/telemetry/history`
        );
        expect(requestedPaths).toContain(
            `/api/robots/${fixtureRobot.id}/commands`
        );
    });

    test("nói rõ dữ liệu lịch sử và chỉ số backend chưa cung cấp", async ({
        page,
    }) => {
        await installSession(page, "premium");
        await installApiMocks(page, { session: "premium" });
        await page.route(
            "**/api/robots/*/telemetry/history**",
            async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: "[]",
                });
            }
        );

        await page.goto("/dashboard");

        await expect(
            page.getByText(
                "Chưa có dữ liệu lịch sử từ hệ thống telemetry.",
                { exact: true }
            )
        ).toBeVisible();

        for (const unavailableMetric of [
            "Tải robot",
            "Sản lượng và chu kỳ",
            "Vòng đời cảnh báo",
            "Bảo trì dự đoán",
            "OEE",
            "Lịch sử ca sản xuất",
        ]) {
            const panel = page.locator("section, article").filter({
                has: page.getByRole("heading", {
                    name: unavailableMetric,
                }),
            });

            await expect(panel).toContainText(
                /backend chưa cung cấp|chưa khả dụng/i
            );
        }
    });
});
