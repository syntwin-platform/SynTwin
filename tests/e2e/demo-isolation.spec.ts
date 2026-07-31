import { expect, test } from "@playwright/test";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

test.describe("demo Free tách biệt và xác định", () => {
    test("hiển thị đầy đủ dữ liệu mô phỏng cố định và không gọi API sản phẩm", async ({
        page,
    }) => {
        await installSession(page, "free");
        const api = await installApiMocks(page, { session: "free" });

        await page.goto("/dashboard/demo");

        await expect(page).toHaveURL(/\/dashboard\/demo$/);
        await expect(
            page.getByText("Dữ liệu mô phỏng", { exact: false }).first()
        ).toBeVisible();

        for (const title of [
            "Trạng thái đội robot",
            "Sản lượng và chu kỳ",
            "Nhiệt độ và tải",
            "Cảnh báo theo mức độ",
            "So sánh robot",
            "Sự kiện gần đây",
        ]) {
            await expect(
                page.getByRole("heading", { name: title })
            ).toBeVisible();
        }

        const overview = page.getByTestId("demo-operational-overview");
        const firstRender = await overview.innerText();
        await page.reload();
        await expect(overview).toBeVisible();
        expect(await overview.innerText()).toBe(firstRender);

        expect(nonAuthRequests(api.requests)).toEqual([]);
    });

    test("chặn hành động thay đổi dữ liệu trước khi có request mạng", async ({
        page,
    }) => {
        await installSession(page, "free");
        const api = await installApiMocks(page, { session: "free" });

        await page.goto("/dashboard/demo");
        await page
            .getByRole("button", { name: "Thêm robot" })
            .click();

        await expect(
            page.getByText(
                "Tính năng này chỉ có trong không gian làm việc trả phí.",
                { exact: false }
            )
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: /xem gói basic và premium/i })
        ).toBeVisible();
        expect(nonAuthRequests(api.requests)).toEqual([]);
    });
});

function nonAuthRequests(
    requests: import("@playwright/test").Request[]
) {
    return requests
        .filter((request) => {
            const path = new URL(request.url()).pathname;
            return !path.startsWith("/api/auth/");
        })
        .map((request) => ({
            method: request.method(),
            path: new URL(request.url()).pathname,
        }));
}
