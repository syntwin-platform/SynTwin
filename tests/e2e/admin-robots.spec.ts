import { expect, test } from "@playwright/test";
import { installAdminApiMocks } from "./helpers/admin-api-mocks";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

test.describe("quản lý robot doanh nghiệp dành cho SuperAdmin", () => {
    test.beforeEach(async ({ page }) => {
        await installSession(page, "admin");
        await installAdminApiMocks(page);
        await installApiMocks(page, { session: "admin" });
    });

    test("hiển thị mục Quản lý Robot trong sidebar và cho phép điều hướng đến /admin/robots", async ({
        page,
    }) => {
        await page.goto("/admin/dashboard");

        const navigation = page.getByRole("navigation", {
            name: "Điều hướng quản trị",
        });
        const robotLink = navigation.getByRole("link", { name: "Quản lý Robot" });
        await expect(robotLink).toBeVisible();
        await expect(robotLink).toHaveAttribute("href", "/admin/robots");

        await robotLink.click();
        await expect(page).toHaveURL(/\/admin\/robots$/);
        await expect(
            page.getByRole("heading", { name: "Quản lý Robot Doanh nghiệp" })
        ).toBeVisible();
    });

    test("hiển thị danh sách robot, KPI và các bộ lọc tìm kiếm", async ({ page }) => {
        await page.goto("/admin/robots");

        await expect(page.getByText("Tổng số Robot")).toBeVisible();
        await expect(page.getByText("Đang kết nối")).toBeVisible();
        await expect(
            page.getByRole("table", { name: "Bảng quản lý robot doanh nghiệp" })
        ).toBeVisible();

        // Search input test
        const searchInput = page.getByPlaceholder(/Tìm kiếm theo tên robot/i);
        await expect(searchInput).toBeVisible();
        await searchInput.fill("RA-001");
        await expect(page.getByText("RA-001").first()).toBeVisible();
    });

    test("cho phép SuperAdmin mở modal xem chi tiết telemetry và reset device secret", async ({
        page,
    }) => {
        await page.goto("/admin/robots");

        // Click detail button
        const detailButton = page.getByTitle("Xem chi tiết & Telemetry").first();
        await expect(detailButton).toBeVisible();
        await detailButton.click();

        await expect(page.getByText(/ID:\s*fixture-robot-ra-001/i)).toBeVisible();
        await page.getByRole("button", { name: "Đóng", exact: true }).click();

        // Click reset secret button
        const secretButton = page.getByTitle("Reset mã kết nối Secret").first();
        await expect(secretButton).toBeVisible();
        await secretButton.click();

        await expect(
            page.getByRole("heading", { name: "Reset Mã Kết Nối Secret" })
        ).toBeVisible();
        await page.getByRole("button", { name: "Hủy" }).click();
    });

    test("cho phép SuperAdmin mở modal tạo robot mới cho doanh nghiệp", async ({
        page,
    }) => {
        await page.goto("/admin/robots");

        const createButton = page.getByRole("button", { name: "Thêm Robot mới" });
        await expect(createButton).toBeVisible();
        await createButton.click();

        await expect(
            page.getByRole("heading", { name: "Thêm Robot Mới Cho Doanh Nghiệp" })
        ).toBeVisible();
        await expect(page.getByLabel(/Doanh nghiệp sở hữu/i)).toBeVisible();
        await expect(page.getByLabel(/Tên Robot/i)).toBeVisible();

        await page.getByRole("button", { name: "Hủy" }).click();
    });

    test("không tràn ngang ở 360px trên trang /admin/robots", async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 800 });
        await page.goto("/admin/robots");

        const scrollWidth = await page.evaluate(
            () => document.documentElement.scrollWidth
        );
        const clientWidth = await page.evaluate(
            () => document.documentElement.clientWidth
        );
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
});
