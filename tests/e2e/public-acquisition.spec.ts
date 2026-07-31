import { expect, test, type Page } from "@playwright/test";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

const prohibitedMarketingClaims =
    /\b3D\b|99[.,]8%|<\s*50\s*ms|predictive|dự đoán lỗi|leading manufacturers|sub-second|\bROI\b|\buptime\b/i;

test.describe("landing công khai đáng tin cậy", () => {
    test("trình bày đủ thông tin ra quyết định, không dùng tuyên bố 3D hoặc số liệu thiếu nguồn", async ({
        page,
    }) => {
        await installSession(page, "none");
        const api = await installApiMocks(page, {
            session: "none",
        });

        await page.goto("/");

        await expect(
            page.getByRole("heading", { level: 1 })
        ).toBeVisible();
        await expect(
            page.getByText(
                /giao diện minh họa|ví dụ mô phỏng|dữ liệu mô phỏng/i
            ).first()
        ).toBeVisible();
        await expect(
            page
                .locator("#nang-luc")
                .getByRole("heading", { level: 2 })
        ).toBeVisible();
        await expect(
            page
                .locator("#van-hanh")
                .getByRole("heading", { level: 2 })
        ).toBeVisible();
        await expect(
            page
                .locator("#bao-mat")
                .getByRole("heading", { level: 2 })
        ).toBeVisible();
        await expect(
            page
                .getByRole("link", {
                    name: /xem giá đang áp dụng|bảng giá|so sánh gói/i,
                })
                .first()
        ).toBeVisible();
        await expect(
            page.getByText("Câu hỏi thường gặp", {
                exact: true,
            })
        ).toBeVisible();

        await expect(
            page.getByRole("link", { name: /đăng nhập/i }).first()
        ).toHaveAttribute("href", "/login");
        await expect(
            page
                .getByRole("link", {
                    name: /đăng ký|tạo tài khoản/i,
                })
                .first()
        ).toHaveAttribute("href", /\/register/);
        await expect(
            page
                .getByRole("link", {
                    name: /bảng giá|xem gói|so sánh gói/i,
                })
                .first()
        ).toHaveAttribute("href", /\/pricing/);

        const renderedCopy = await page.locator("body").innerText();
        expect(renderedCopy).not.toMatch(prohibitedMarketingClaims);
        expect(
            api.requests.filter(
                (request) =>
                    new URL(request.url()).pathname ===
                    "/api/auth/me"
            )
        ).toEqual([]);
    });
});

test.describe("xác thực và bàn giao gói đã chọn", () => {
    test("đăng nhập bằng mật khẩu giữ chính xác gói Basic và không tự checkout", async ({
        page,
    }) => {
        await installSession(page, "none");
        const api = await installApiMocks(page, {
            session: "none",
            authResultSession: "free",
        });

        await page.goto(
            "/login?next=%2Fpricing%3Fplan%3DBasic"
        );
        await page.getByLabel(/email/i).fill("owner@syntwin.test");
        await page
            .getByLabel(/^mật khẩu$/i)
            .fill("Syntwin#123");
        const passwordSubmit = page.locator(
            'form button[type="submit"]'
        );
        await expect(passwordSubmit).toHaveText(/đăng nhập/i);
        await passwordSubmit.click();

        await expect(page).toHaveURL(/\/pricing\?plan=Basic$/);
        await expect(
            page.locator('article[data-selected="true"]')
        ).toContainText("Basic");
        expect(
            requestsFor(api.requests, "/api/auth/login", "POST")
        ).toHaveLength(1);
        expect(
            requestsFor(
                api.requests,
                "/api/payments/vnpay/checkout",
                "POST"
            )
        ).toHaveLength(0);
    });

    test("đăng nhập bằng mã email sáu số giữ gói Premium và yêu cầu bấm checkout lại", async ({
        page,
    }) => {
        await installSession(page, "none");
        const api = await installApiMocks(page, {
            session: "none",
            authResultSession: "free",
        });

        await page.goto(
            "/login?next=%2Fpricing%3Fplan%3DPremium"
        );
        await page
            .getByRole("button", { name: /mã (qua )?email/i })
            .click();
        await page.getByLabel(/email/i).fill("owner@syntwin.test");
        const codeSubmit = page.locator(
            'form button[type="submit"]'
        );
        await expect(codeSubmit).toHaveText(/gửi mã/i);
        await codeSubmit.click();
        await page
            .getByLabel(/mã đăng nhập.*6|mã.*6 chữ số/i)
            .fill("123456");
        await expect(codeSubmit).toHaveText(
            /xác nhận mã|đăng nhập/i
        );
        await codeSubmit.click();

        await expect(page).toHaveURL(
            /\/pricing\?plan=Premium$/
        );
        await expect(
            page.locator('article[data-selected="true"]')
        ).toContainText("Premium");
        expect(
            requestsFor(
                api.requests,
                "/api/auth/login-code/request",
                "POST"
            )
        ).toHaveLength(1);
        expect(
            requestsFor(
                api.requests,
                "/api/auth/login-code/confirm",
                "POST"
            )
        ).toHaveLength(1);
        expect(
            requestsFor(
                api.requests,
                "/api/payments/vnpay/checkout",
                "POST"
            )
        ).toHaveLength(0);
    });

    test("đăng ký gửi nguyên contract backend và bàn giao Premium sang bảng giá", async ({
        page,
    }) => {
        await installSession(page, "none");
        const api = await installApiMocks(page, {
            session: "none",
        });

        await page.goto("/register?plan=Premium");
        await page
            .getByLabel(/họ và tên/i)
            .fill("Nguyễn Minh An");
        await page
            .getByLabel(/email/i)
            .fill("manager@syntwin.test");
        await page
            .getByLabel(/^mật khẩu$/i)
            .fill("Syntwin#123");
        await page
            .getByLabel(/xác nhận mật khẩu/i)
            .fill("Syntwin#123");
        await page.getByRole("checkbox").check();
        await page
            .getByRole("button", {
                name: /tạo tài khoản|đăng ký/i,
            })
            .click();

        await expect(page).toHaveURL(
            /\/pricing\?plan=Premium$/
        );
        await expect(
            page.locator('article[data-selected="true"]')
        ).toContainText("Premium");

        const registerRequest = requestsFor(
            api.requests,
            "/api/auth/register",
            "POST"
        )[0];
        expect(registerRequest).toBeDefined();
        expect(registerRequest.postDataJSON()).toEqual({
            email: "manager@syntwin.test",
            password: "Syntwin#123",
            fullName: "Nguyễn Minh An",
            timezone: expect.any(String),
        });
    });
});

test.describe("bảng giá và checkout", () => {
    test("khách xem được bảng giá không gọi auth/me và nhận đúng next khi chọn Basic", async ({
        page,
    }) => {
        await installSession(page, "none");
        const api = await installApiMocks(page, {
            session: "none",
        });

        await page.goto("/pricing");
        const basicPlan = planCard(page, "Basic");
        await expect(basicPlan).toBeVisible();
        await expect(planCard(page, "Premium")).toBeVisible();

        expect(
            requestsFor(api.requests, "/api/auth/me")
        ).toHaveLength(0);

        await basicPlan.getByRole("button").click();
        await expect(page).toHaveURL(/\/login\?next=/);
        const destination = new URL(page.url());
        expect(destination.pathname).toBe("/login");
        expect(destination.searchParams.get("next")).toBe(
            "/pricing?plan=Basic"
        );
    });

    test("Basic checkout giữ payload VNPay và chỉ điều hướng sau phản hồi backend", async ({
        page,
    }) => {
        await installSession(page, "basic");
        const api = await installApiMocks(page, {
            session: "basic",
            checkoutPaymentUrl:
                "/payment/vnpay-return?txnRef=ST-20260731_001",
        });

        await page.goto("/pricing?plan=Premium");
        await planCard(page, "Premium")
            .getByRole("button", {
                name: /thanh toán.*VNPay/i,
            })
            .click();

        await expect(page).toHaveURL(
            /\/payment\/vnpay-return\?txnRef=ST-20260731_001$/
        );
        const checkoutRequest = requestsFor(
            api.requests,
            "/api/payments/vnpay/checkout",
            "POST"
        )[0];
        expect(checkoutRequest.postDataJSON()).toEqual({
            subscriptionPlan: "Premium",
        });
    });

    test("SuperAdmin chỉ xem và không phát sinh checkout", async ({
        page,
    }) => {
        await installSession(page, "admin");
        const api = await installApiMocks(page, {
            session: "admin",
        });

        await page.goto("/pricing");
        const action = planCard(page, "Basic").getByRole("button");

        await expect(action).toBeDisabled();
        await expect(action).toHaveText(/chỉ xem/i);
        expect(
            requestsFor(
                api.requests,
                "/api/payments/vnpay/checkout",
                "POST"
            )
        ).toHaveLength(0);
    });
});

test.describe("kết quả VNPay", () => {
    const states = [
        {
            status: "Paid" as const,
            heading: /thanh toán thành công/i,
            displayStatus: "Đã thanh toán",
            action: /vào bảng điều khiển/i,
        },
        {
            status: "Pending" as const,
            heading: /giao dịch đang xử lý/i,
            displayStatus: "Đang xử lý",
            action: /kiểm tra lại/i,
        },
        {
            status: "Failed" as const,
            heading: /thanh toán không thành công/i,
            displayStatus: "Thất bại",
            action: /quay lại chọn gói/i,
        },
        {
            status: "Refunded" as const,
            heading: /giao dịch đã được hoàn tiền/i,
            displayStatus: "Đã hoàn tiền",
            action: /quay lại chọn gói/i,
        },
    ];

    for (const state of states) {
        test(`hiển thị trạng thái ${state.status} bằng tiếng Việt`, async ({
            page,
        }) => {
            await installSession(page, "basic");
            await installApiMocks(page, {
                session: "basic",
                paymentStatus: state.status,
            });

            await page.goto(
                "/payment/vnpay-return?txnRef=ST-20260731_001"
            );

            await expect(
                page.getByRole("heading", {
                    name: state.heading,
                })
            ).toBeVisible();
            await expect(
                page.getByText(state.displayStatus, {
                    exact: true,
                })
            ).toBeVisible();
            await expect(
                page.getByRole(
                    state.status === "Pending"
                        ? "button"
                        : "link",
                    { name: state.action }
                )
            ).toBeVisible();
        });
    }

    test("lỗi xác minh giữ được thao tác thử lại và phục hồi khi backend sẵn sàng", async ({
        page,
    }) => {
        await installSession(page, "basic");
        const api = await installApiMocks(page, {
            session: "basic",
            paymentStatus: "Pending",
            paymentStatusFailuresBeforeSuccess: 1,
        });

        await page.goto(
            "/payment/vnpay-return?txnRef=ST-20260731_001"
        );
        await expect(page.locator('p[role="alert"]')).toContainText(
            "Không thể xác minh giao dịch lúc này."
        );

        await page
            .getByRole("button", { name: /kiểm tra lại/i })
            .click();

        await expect(
            page.getByRole("heading", {
                name: /giao dịch đang xử lý/i,
            })
        ).toBeVisible();
        expect(
            requestsMatching(
                api.requests,
                /\/api\/payments\/vnpay\/status\/ST-20260731_001$/,
                "GET"
            )
        ).toHaveLength(2);
    });
});

test.describe("tiếng Việt và responsive acquisition", () => {
    test("các route cốt lõi dùng nhãn tiếng Việt", async ({
        page,
    }) => {
        await installSession(page, "none");
        await installApiMocks(page, { session: "none" });

        const assertions: Array<{
            route: string;
            heading: RegExp;
        }> = [
            { route: "/", heading: /vận hành|nhà máy/i },
            { route: "/login", heading: /đăng nhập/i },
            {
                route: "/register",
                heading: /tạo tài khoản|đăng ký|bắt đầu bằng demo/i,
            },
            { route: "/pricing", heading: /gói dịch vụ|bảng giá/i },
        ];

        for (const assertion of assertions) {
            await page.goto(assertion.route);
            await expect(
                page
                    .getByRole("heading", {
                        name: assertion.heading,
                    })
                    .first()
            ).toBeVisible();
        }
    });

    test("không tràn ngang ở 360px trên các route công khai", async ({
        page,
    }) => {
        await page.setViewportSize({
            width: 360,
            height: 800,
        });
        await installSession(page, "none");
        await installApiMocks(page, { session: "none" });

        for (const route of [
            "/",
            "/login",
            "/register",
            "/pricing",
            "/route-khong-ton-tai",
        ]) {
            await page.goto(route);
            await expectNoHorizontalOverflow(page);
        }
    });
});

function planCard(page: Page, name: "Basic" | "Premium") {
    return page.locator("article").filter({
        has: page.getByRole("heading", { name }),
    });
}

function requestsFor(
    requests: import("@playwright/test").Request[],
    path: string,
    method?: string
) {
    return requests.filter((request) => {
        const requestPath = new URL(request.url()).pathname;
        return (
            requestPath === path &&
            (!method || request.method() === method)
        );
    });
}

function requestsMatching(
    requests: import("@playwright/test").Request[],
    path: RegExp,
    method?: string
) {
    return requests.filter((request) => {
        const requestPath = new URL(request.url()).pathname;
        return (
            path.test(requestPath) &&
            (!method || request.method() === method)
        );
    });
}

async function expectNoHorizontalOverflow(
    page: Page
): Promise<void> {
    await expect
        .poll(async () =>
            page.evaluate(() => ({
                viewport: window.innerWidth,
                page: document.documentElement.scrollWidth,
            }))
        )
        .toEqual({
            viewport: 360,
            page: 360,
        });

}
