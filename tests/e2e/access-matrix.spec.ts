import { expect, test } from "@playwright/test";
import { installApiMocks } from "./helpers/api-mocks";
import {
    createSession,
    installSession,
    type SessionKind,
} from "./helpers/sessions";

test.describe("ma trận truy cập theo gói", () => {
    const cases: Array<{
        name: string;
        session: SessionKind;
        route: string;
        expectedPath: string;
    }> = [
        {
            name: "khách được xem demo trực tiếp",
            session: "none",
            route: "/dashboard/demo",
            expectedPath: "/dashboard/demo",
        },
        {
            name: "Free vào dashboard thật được chuyển sang landingpage",
            session: "free",
            route: "/dashboard/robots",
            expectedPath: "/",
        },
        {
            name: "Basic vào dashboard thật",
            session: "basic",
            route: "/dashboard",
            expectedPath: "/dashboard",
        },
        {
            name: "Premium vào dashboard thật",
            session: "premium",
            route: "/dashboard/robots",
            expectedPath: "/dashboard/robots",
        },
        {
            name: "SuperAdmin được truy cập user workspace dashboard",
            session: "admin",
            route: "/dashboard",
            expectedPath: "/dashboard",
        },
        {
            name: "Basic không vào admin",
            session: "basic",
            route: "/admin/users",
            expectedPath: "/dashboard",
        },
        {
            name: "SuperAdmin vào admin",
            session: "admin",
            route: "/admin/dashboard",
            expectedPath: "/admin/dashboard",
        },
    ];

    for (const accessCase of cases) {
        test(accessCase.name, async ({ page }) => {
            await installSession(page, accessCase.session);
            await installApiMocks(page, {
                session: accessCase.session,
            });

            await page.goto(accessCase.route);

            await expect(page).toHaveURL(
                new RegExp(
                    `${escapeRegExp(accessCase.expectedPath)}(?:\\?|$)`
                )
            );
        });
    }
});

test("không hiển thị nội dung bảo vệ khi phiên đang được xác minh", async ({
    page,
}) => {
    await installSession(page, "free");
    await installApiMocks(page, {
        session: "free",
        restoreDelayMs: 1_000,
    });

    await page.goto("/dashboard");

    await expect(
        page.getByText("SynTwin Factory", { exact: false })
    ).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
});

test("demo Free không gọi API sản phẩm thật", async ({ page }) => {
    await installSession(page, "free");
    const api = await installApiMocks(page, { session: "free" });

    await page.goto("/dashboard/demo");
    await expect(page).toHaveURL(/\/dashboard\/demo$/);
    await expect(
        page.getByText("Dữ liệu mô phỏng", { exact: false })
    ).toBeVisible();
    expect(api.productRequests()).toEqual([]);
});

test("người đã đăng nhập không nhìn thấy form đăng nhập", async ({
    page,
}) => {
    await installSession(page, "basic");
    await installApiMocks(page, {
        session: "basic",
        restoreDelayMs: 500,
    });

    await page.goto("/login");

    await expect(
        page.getByRole("heading", { name: /đăng nhập/i })
    ).toHaveCount(0);
    await expect(page).toHaveURL(/\/dashboard$/);
});

test("khách xem được bảng giá và chỉ đăng nhập khi bắt đầu thanh toán", async ({
    page,
}) => {
    await installSession(page, "none");
    await installApiMocks(page, { session: "none" });

    await page.goto("/pricing");
    const businessPlan = page.locator("article").filter({
        has: page.getByRole("heading", { name: /Business/i }),
    });

    await expect(businessPlan).toBeVisible();
    await businessPlan.locator("a, button").first().click();
    await expect(page).toHaveURL(
        /\/login\?next=%2Fpricing%3Fplan%3DBasic$/
    );
});

test("đăng ký giữ điểm đến bảng giá thay vì bị chuyển sang demo", async ({
    page,
}) => {
    await installSession(page, "none");
    await installApiMocks(page, { session: "none" });

    await page.goto("/register?plan=Basic");
    await page.locator('input[type="text"]').fill("Quản lý thử nghiệm");
    await page.locator('input[type="email"]').fill("new@syntwin.test");
    await page.locator('input[type="password"]').nth(0).fill("Syntwin#123");
    await page.locator('input[type="password"]').nth(1).fill("Syntwin#123");
    await page.locator('input[type="checkbox"]').check();
    await page
        .getByRole("button", {
            name: /tạo tài khoản|đăng ký/i,
        })
        .click();

    await expect(page).toHaveURL(/\/pricing\?plan=Basic$/);
    await expect(page.getByText("Business").first()).toBeVisible();
});

test("SuperAdmin chỉ xem bảng giá và không thể checkout", async ({
    page,
}) => {
    await installSession(page, "admin");
    const api = await installApiMocks(page, { session: "admin" });

    await page.goto("/pricing");
    const businessPlan = page.locator("article").filter({
        has: page.getByRole("heading", { name: /Business/i }),
    });
    const action = businessPlan.getByRole("button");

    await expect(action).toBeDisabled();
    await expect(action).toHaveText("Chỉ xem");
    expect(
        api.requests.filter((request) =>
            new URL(request.url()).pathname.includes("/payments")
        )
    ).toEqual([]);
});

test("thay đổi gói trong session được áp dụng ngay cho route hiện tại", async ({
    page,
}) => {
    await installSession(page, "free");
    await installApiMocks(page, { session: "free" });
    await page.goto("/dashboard/demo");
    await installApiMocks(page, { session: "basic" });

    await page.evaluate((nextSession) => {
        localStorage.setItem(
            "syntwin_session",
            JSON.stringify(nextSession)
        );
        window.dispatchEvent(new Event("syntwin-session-changed"));
    }, createSession("basic"));

    await expect(page).toHaveURL(/\/dashboard$/);
});

test("token cũ và refresh thất bại quay về login an toàn", async ({
    page,
}) => {
    await installSession(page, "free");
    await installApiMocks(page, { session: "none" });

    await page.goto("/dashboard/demo");
    await expect(page).toHaveURL(
        /\/login\?next=%2Fdashboard%2Fdemo$/
    );
});

test("callback VNPay đầy đủ được giữ nguyên khi yêu cầu đăng nhập lại", async ({
    page,
}) => {
    await installSession(page, "none");
    await installApiMocks(page, { session: "none" });
    const callback =
        "/payment/vnpay-return?responseCode=00&signatureValid=true&status=success&transactionStatus=00&txnRef=ST-20260731_001";

    await page.goto(callback);
    await expect(page).toHaveURL(/\/login\?next=/);
    const url = new URL(page.url());

    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("next")).toBe(callback);
});

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
