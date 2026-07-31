import { expect, test, type Page, type Request } from "@playwright/test";
import { installAdminApiMocks } from "./helpers/admin-api-mocks";
import { installSession } from "./helpers/sessions";
import {
    adminCompanies,
    adminMetricCounts,
    adminUsers,
} from "./fixtures/admin";

test.describe("ứng dụng quản trị", () => {
    test.beforeEach(async ({ page }) => {
        await installSession(page, "admin");
    });

    test("shell có điều hướng quản trị đầy đủ, Việt hóa và không tràn ngang trên mobile", async ({
        page,
    }) => {
        await page.setViewportSize({ width: 360, height: 800 });
        await installAdminApiMocks(page);

        await page.goto("/admin/dashboard");

        const navigation = page.getByRole("navigation", {
            name: "Điều hướng quản trị",
        });
        await expect(navigation).toBeVisible();
        for (const item of [
            ["Tổng quan", "/admin/dashboard"],
            ["Người dùng", "/admin/users"],
            ["Công ty", "/admin/companies"],
        ] as const) {
            await expect(
                navigation.getByRole("link", { name: item[0] })
            ).toHaveAttribute("href", item[1]);
        }
        await expect(
            navigation.getByRole("link", { name: "Tổng quan" })
        ).toHaveAttribute("aria-current", "page");
        await expect(
            page.getByRole("button", { name: "Đăng xuất" })
        ).toBeVisible();
        await expectNoPageOverflow(page);
        await expectKnownEnglishAdminCopyToBeAbsent(page);
    });

    test("overview chỉ hiển thị số đếm tổng hợp từ API và có bản tóm tắt biểu đồ", async ({
        page,
    }) => {
        const api = await installAdminApiMocks(page);
        await page.goto("/admin/dashboard");

        await expect(
            page.getByRole("heading", { name: "Tổng quan nền tảng" })
        ).toBeVisible();
        await expectMetric(page, "Tổng người dùng", 37);
        await expectMetric(page, "Tài khoản hoạt động", 29);
        await expectMetric(page, "Công ty", 2);
        await expectMetric(
            page,
            /giám sát.*liên kết|tài khoản giám sát/i,
            4
        );

        await expect(
            page.getByText(
                `Hoạt động: ${adminMetricCounts.byStatus.Active}; Bị khóa: ${adminMetricCounts.byStatus.Locked}; Đã xóa: ${adminMetricCounts.byStatus.Deleted}`,
                { exact: false }
            )
        ).toBeVisible();
        await expect(
            page.getByText(
                `Free: ${adminMetricCounts.byPlan.Free}; Basic: ${adminMetricCounts.byPlan.Basic}; Premium: ${adminMetricCounts.byPlan.Premium}`,
                { exact: false }
            )
        ).toBeVisible();
        await expect(
            page.getByText(/dữ liệu được tổng hợp từ nhiều yêu cầu api/i)
        ).toBeVisible();

        const body = await page.locator("body").innerText();
        expect(body).not.toMatch(
            /(?:tăng|giảm|growth|uptime|so với kỳ trước)\s*[+:−-]?\s*\d+(?:[,.]\d+)?%/i
        );
        expect(adminGetRequests(api.adminRequests())).toHaveLength(8);

        await page.getByRole("button", { name: "Làm mới dữ liệu" }).click();
        await expect
            .poll(() => adminGetRequests(api.adminRequests()).length)
            .toBe(16);
    });

    test("người dùng giữ query phân trang, bộ lọc và ba PATCH action", async ({
        page,
    }) => {
        const api = await installAdminApiMocks(page);
        await page.goto("/admin/users");

        await expect(
            page.getByRole("heading", { name: "Quản lý người dùng" })
        ).toBeVisible();
        await expect(page.getByText(adminUsers[0].email)).toBeVisible();

        const nextPage = page.getByRole("button", { name: "Trang sau" });
        await expect(nextPage).toBeVisible();
        await nextPage.click();
        await expect
            .poll(() =>
                hasAdminRequest(api.requests, "GET", "/api/admin/users", {
                    page: "2",
                    pageSize: "20",
                })
            )
            .toBe(true);

        const search = page.getByRole("searchbox", {
            name: "Tìm theo tên hoặc email",
        });
        await search.fill("Trần An");
        await search.press("Enter");
        await page.getByRole("button", { name: "Bộ lọc" }).click();
        await page.getByLabel("Vai trò").selectOption("User");
        await page.getByLabel("Trạng thái").selectOption("Active");
        await page
            .getByLabel(/^Gói(?: dịch vụ)?$/)
            .selectOption("Basic");

        await expect
            .poll(() =>
                hasAdminRequest(api.requests, "GET", "/api/admin/users", {
                    search: "Trần An",
                    role: "User",
                    status: "Active",
                    plan: "Basic",
                    page: "1",
                    pageSize: "20",
                })
            )
            .toBe(true);

        const manageButton = page.getByRole("button", {
            name: new RegExp(
                `Quản lý (?:${adminUsers[0].fullName}|${adminUsers[0].email})`,
                "i"
            ),
        });
        await manageButton.click();
        const dialog = page.getByRole("dialog", {
            name: "Quản lý người dùng",
        });
        await expect(dialog).toBeVisible();

        await dialog.getByLabel("Trạng thái tài khoản").selectOption("Locked");
        await dialog
            .getByRole("button", { name: "Lưu trạng thái" })
            .click();
        await expectAdminMutation(api.requests, {
            path: `/api/admin/users/${adminUsers[0].id}/status`,
            body: { status: "Locked" },
        });

        await dialog
            .getByLabel("Vai trò", { exact: true })
            .selectOption("SuperAdmin");
        await dialog
            .getByRole("button", { name: "Lưu vai trò" })
            .click();
        await expectAdminMutation(api.requests, {
            path: `/api/admin/users/${adminUsers[0].id}/role`,
            body: { role: "SuperAdmin" },
        });

        await dialog
            .getByLabel("Gói dịch vụ", { exact: true })
            .selectOption("Premium");
        await dialog
            .getByRole("button", { name: "Lưu gói dịch vụ" })
            .click();
        await expectAdminMutation(api.requests, {
            path: `/api/admin/users/${adminUsers[0].id}/subscription`,
            body: { subscriptionPlan: "Premium" },
        });

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(manageButton).toBeFocused();
    });

    test("công ty giữ list/detail và đầy đủ vòng đời tài khoản giám sát", async ({
        page,
    }) => {
        const api = await installAdminApiMocks(page);
        await page.goto("/admin/companies");

        await expect(
            page.getByRole("heading", {
                name: /Quản lý quyền.*công ty/,
            })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", {
                name: adminCompanies[0].name,
            })
        ).toBeVisible();
        await expect(
            page.getByText(adminCompanies[0].ownerEmail).first()
        ).toBeVisible();
        expect(
            hasAdminRequest(
                api.requests,
                "GET",
                `/api/admin/companies/${adminCompanies[0].id}/members`
            )
        ).toBe(true);

        await page
            .getByLabel("Email tài khoản giám sát mới")
            .fill("new.monitor@minhphat.test");
        await page
            .getByRole("button", {
                name: /Liên kết (?:tài khoản|giám sát)/,
            })
            .click();
        await expectAdminMutation(api.requests, {
            method: "POST",
            path: `/api/admin/companies/${adminCompanies[0].id}/monitors`,
            body: { email: "new.monitor@minhphat.test" },
        });

        const monitorRow = page
            .getByRole("row")
            .filter({
                has: page.getByLabel("Email liên kết của Phạm Lan"),
            });
        const emailInput = monitorRow.getByLabel(
            "Email liên kết của Phạm Lan"
        );
        await expect(emailInput).toBeVisible();
        await emailInput.fill("replacement@minhphat.test");
        await monitorRow
            .getByRole("button", { name: "Lưu email" })
            .click();
        await expectAdminMutation(api.requests, {
            method: "PUT",
            path: `/api/admin/companies/${adminCompanies[0].id}/monitors/monitor-01`,
            body: { email: "replacement@minhphat.test" },
        });

        await monitorRow
            .getByRole("button", {
                name: /Gỡ.*(?:Phạm Lan|monitor@minhphat\.test)/,
            })
            .click();
        const confirmation = page.getByRole("alertdialog", {
            name: "Gỡ tài khoản giám sát",
        });
        await expect(confirmation).toContainText(
            "replacement@minhphat.test"
        );
        await confirmation
            .getByRole("button", { name: "Xác nhận gỡ" })
            .click();
        await expectAdminMutation(api.requests, {
            method: "DELETE",
            path: `/api/admin/companies/${adminCompanies[0].id}/monitors/monitor-01`,
        });
    });
});

async function expectMetric(
    page: Page,
    label: string | RegExp,
    value: number
): Promise<void> {
    const metric = page.locator("section, article, div").filter({
        has: page.getByText(label, { exact: true }),
    });
    await expect(metric.first()).toContainText(String(value));
}

async function expectNoPageOverflow(page: Page): Promise<void> {
    expect(
        await page.evaluate(
            () =>
                document.documentElement.scrollWidth <=
                window.innerWidth
        )
    ).toBe(true);
}

async function expectKnownEnglishAdminCopyToBeAbsent(
    page: Page
): Promise<void> {
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(
        /\b(?:Overview|User Management|Companies|Platform Online|Admin Console|Logout|Refresh data|Total Users|Active Accounts|Linked Monitors)\b/i
    );
}

function adminGetRequests(requests: Request[]): Request[] {
    return requests.filter(
        (request) =>
            request.method() === "GET" &&
            new URL(request.url()).pathname.startsWith("/api/admin/")
    );
}

function hasAdminRequest(
    requests: Request[],
    method: string,
    path: string,
    query?: Record<string, string>
): boolean {
    return requests.some((request) => {
        const url = new URL(request.url());
        return (
            request.method() === method &&
            url.pathname === path &&
            Object.entries(query ?? {}).every(
                ([key, value]) => url.searchParams.get(key) === value
            )
        );
    });
}

async function expectAdminMutation(
    requests: Request[],
    expected: {
        method?: "POST" | "PUT" | "PATCH" | "DELETE";
        path: string;
        body?: Record<string, unknown>;
    }
): Promise<void> {
    await expect
        .poll(() =>
            requests.find((request) => {
                if (
                    request.method() !== (expected.method ?? "PATCH") ||
                    new URL(request.url()).pathname !== expected.path
                ) {
                    return false;
                }

                return expected.body
                    ? JSON.stringify(request.postDataJSON()) ===
                          JSON.stringify(expected.body)
                    : true;
            })
        )
        .toBeTruthy();
}
