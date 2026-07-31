import { expect, test, type Page } from "@playwright/test";
import {
    fixtureLatestState,
    fixtureRobot,
} from "./fixtures/product";
import { installApiMocks } from "./helpers/api-mocks";
import { installSession } from "./helpers/sessions";

test.describe("cảnh báo là điều kiện hiện tại từ API", () => {
    for (const condition of [
        {
            status: "Fault",
            summary: /Bất thường\s*1/i,
            label: /Lỗi/i,
        },
        {
            status: "Warning",
            summary: /Cần chú ý\s*1/i,
            label: /Cảnh báo/i,
        },
    ]) {
        test(`phân loại và Việt hóa trạng thái ${condition.status}`, async ({
            page,
        }) => {
            await installSession(page, "basic");
            await installApiMocks(page, {
                session: "basic",
            });
            await overrideJson(
                page,
                "**/api/robots/*/state/latest**",
                {
                    ...fixtureLatestState,
                    collisionWarning: false,
                    status: condition.status,
                }
            );

            await page.goto("/dashboard/alerts");

            const conditions = page.getByRole("region", {
                name: "Danh sách điều kiện hiện tại",
            });
            await expect(conditions).toContainText(
                condition.summary
            );
            await expect(conditions).toContainText(
                condition.label
            );
            await expect(conditions).not.toContainText(
                condition.status
            );
        });
    }

    test("kết hợp kết nối, va chạm và lệnh thất bại mà không gọi đó là lịch sử", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });
        const observedPaths: string[] = [];
        page.on("request", (request) => {
            observedPaths.push(
                new URL(request.url()).pathname
            );
        });
        await overrideJson(
            page,
            "**/api/robots/*/state/latest**",
            {
                ...fixtureLatestState,
                collisionWarning: true,
                status: "Error",
            }
        );
        await overrideJson(
            page,
            "**/api/robots/*/commands**",
            [
                {
                    id: "fixture-command-failed",
                    robotId: fixtureRobot.id,
                    commandType: "Start",
                    payload: null,
                    status: "Failed",
                    createdAt:
                        "2026-07-31T07:55:00.000Z",
                    completedAt:
                        "2026-07-31T07:55:02.000Z",
                    failureReason:
                        "Bộ điều khiển từ chối lệnh",
                    result: null,
                },
            ]
        );

        await page.goto("/dashboard/alerts");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /cảnh báo|điều kiện vận hành/i,
            })
        ).toBeVisible();
        await expect(
            page.getByRole("button", {
                name: new RegExp(
                    `${fixtureRobot.robotName}.*va chạm`,
                    "i"
                ),
            })
        ).toBeVisible();
        await expect(
            page.getByText(/va chạm/i).first()
        ).toBeVisible();
        await expect(
            page.getByText(
                "Bộ điều khiển từ chối lệnh",
                { exact: true }
            )
        ).toBeVisible();
        await expect(
            page.getByRole("status")
        ).toContainText(
            /không phải.*(nhật ký|lịch sử) cảnh báo/i
        );
        await expect(
            page.getByRole("status")
        ).toContainText(/chưa có API/i);

        expect(observedPaths).toContain("/api/robots");
        expect(observedPaths).toContain(
            `/api/robots/${fixtureRobot.id}/state/latest`
        );
        expect(observedPaths).toContain(
            `/api/robots/${fixtureRobot.id}/commands`
        );
    });

    test("trạng thái bình thường không sinh incident hoặc số liệu giả", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });

        await page.goto("/dashboard/alerts");

        await expect(
            page.getByRole("region", {
                name: "Danh sách điều kiện hiện tại",
            })
        ).toContainText(/Bất thường\s*0/i);

        const copy = await page.locator("main").innerText();
        expect(copy).not.toMatch(
            /AL-\d+|quá nhiệt ở 77|mất kết nối lúc|đã xác nhận bởi/i
        );
    });
});

test.describe("analytics dùng telemetry thật và khai báo phần thiếu", () => {
    test("không biến dữ liệu va chạm chưa có thành trạng thái an toàn", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });
        await overrideJson(
            page,
            "**/api/robots/*/state/latest**",
            {
                ...fixtureLatestState,
                collisionWarning: null,
            }
        );

        await page.goto("/dashboard/analytics");

        const collisionMetric = page
            .locator("section")
            .filter({
                hasText: "Cảnh báo va chạm",
            })
            .first();
        await expect(collisionMetric).toContainText(
            "Chưa xác định"
        );
    });

    test("đọc inventory, latest và history với đúng đơn vị", async ({
        page,
    }) => {
        await installSession(page, "premium");
        const api = await installApiMocks(page, {
            session: "premium",
        });

        await page.goto("/dashboard/analytics");

        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /phân tích vận hành|phân tích robot/i,
            })
        ).toBeVisible();
        await expect(
            page.getByText(fixtureRobot.robotName, {
                exact: true,
            }).first()
        ).toBeVisible();
        await expect(
            page.getByText(/61[,.]8\s*°C/).first()
        ).toBeVisible();
        await expect(
            page.getByText(/18\s*ms/).first()
        ).toBeVisible();
        await expect(
            page.getByRole("figure", {
                name: "Nhiệt độ và độ trễ theo thời gian",
            })
        ).toContainText(
            /Nguồn: API lịch sử (đo đạc|telemetry) robot/i
        );

        const paths = requestedPaths(api.requests);
        expect(paths).toContain("/api/robots");
        expect(paths).toContain(
            `/api/robots/${fixtureRobot.id}/state/latest`
        );
        expect(paths).toContain(
            `/api/robots/${fixtureRobot.id}/telemetry/history`
        );
    });

    test("history rỗng không được thay bằng uptime, cycle, load hoặc OEE seed", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });
        await overrideJson(
            page,
            "**/api/robots/*/telemetry/history**",
            []
        );

        await page.goto("/dashboard/analytics");

        await expect(
            page.getByText(
                /chưa có dữ liệu lịch sử.*telemetry/i
            )
        ).toBeVisible();
        const copy = await page.locator("main").innerText();

        for (const seededClaim of [
            "98.2%",
            "12.847",
            "12,847",
            "312h",
            "Peak Load",
            "Weekly Uptime",
        ]) {
            expect(copy).not.toContain(seededClaim);
        }

        for (const unavailableMetric of [
            /tải robot/i,
            /sản lượng|OEE|chu kỳ/i,
            /vòng đời cảnh báo/i,
            /lịch sử (đợt chạy|ca sản xuất)/i,
        ]) {
            const panel = page
                .locator("article")
                .filter({
                    has: page.getByRole("heading", {
                        name: unavailableMetric,
                    }),
                });

            await expect(panel).toContainText(
                /chưa (cung cấp|có API)|chưa khả dụng/i
            );
        }
    });
});

test.describe("customer routes và shell", () => {
    test("chủ sở hữu có thể gỡ tài khoản giám sát qua API công ty", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });
        const monitor = {
            userId: "fixture-monitor-user",
            email: "monitor.fixture@syntwin.test",
            fullName: "Giám sát mẫu",
            avatarUrl: null,
            role: "Monitor",
            isActive: true,
            joinedAt: "2026-02-01T00:00:00.000Z",
        };
        await overrideJson(
            page,
            "**/api/companies/*/members**",
            [monitor]
        );
        await page.route(
            "**/api/companies/*/monitors/*",
            async (route) => {
                if (
                    route.request().method() === "DELETE"
                ) {
                    await route.fulfill({
                        status: 204,
                        body: "",
                    });
                    return;
                }
                await route.fallback();
            }
        );

        await page.goto("/dashboard/company");

        const removeButton = page.getByRole("button", {
            name: `Gỡ tài khoản giám sát ${monitor.fullName}`,
        });
        await expect(removeButton).toBeVisible();

        page.once("dialog", (dialog) =>
            dialog.accept()
        );
        const requestPromise = page.waitForRequest(
            (request) =>
                request.method() === "DELETE" &&
                new URL(request.url()).pathname ===
                    `/api/companies/${fixtureRobot.companyId}/monitors/${monitor.userId}`
        );
        await removeButton.click();
        await requestPromise;

        await expect(
            page.getByText(
                "Tài khoản giám sát đã được gỡ khỏi công ty."
            )
        ).toBeVisible();
    });

    test("hộp thoại robot chỉ cho chọn HTTP hoặc MQTT và có nhãn truy cập được", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });

        await page.goto("/dashboard/robots");
        await page
            .getByRole("button", {
                name: /thêm robot/i,
            })
            .click();

        const dialog = page.getByRole("dialog", {
            name: "Thêm robot mới",
        });
        await expect(
            dialog.getByLabel("Tên robot")
        ).toBeVisible();
        await expect(
            dialog.getByLabel("Mẫu máy")
        ).toBeVisible();

        const connectionType =
            dialog.getByLabel("Kiểu kết nối");
        await expect(connectionType).toHaveValue("HTTP");
        await expect(
            connectionType.locator("option")
        ).toHaveText(["HTTP", "MQTT"]);
        expect(
            (await connectionType.boundingBox())?.height
        ).toBeGreaterThanOrEqual(44);
    });

    test("owner giữ các điểm vào quản lý robot, công ty, tài khoản và settings", async ({
        page,
    }) => {
        await installSession(page, "basic");
        await installApiMocks(page, {
            session: "basic",
        });

        await page.goto("/dashboard/robots");
        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /quản lý robot|robot của công ty/i,
            })
        ).toBeVisible();
        await expect(
            page.getByRole("button", {
                name: /thêm robot|đăng ký robot/i,
            })
        ).toBeVisible();

        await page.goto("/dashboard/company");
        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /công ty|không gian công ty/i,
            })
        ).toBeVisible();

        await page.goto("/dashboard/user");
        await expect(
            page.getByRole("heading", {
                level: 1,
                name: /tài khoản|hồ sơ/i,
            })
        ).toBeVisible();

        await page.goto("/dashboard/settings");
        await expect(page).toHaveURL(/\/dashboard\/user$/);
    });

    test("desktop và mobile navigation đánh dấu route hiện tại bằng aria-current", async ({
        page,
    }) => {
        await installSession(page, "premium");
        await installApiMocks(page, {
            session: "premium",
        });

        await page.goto("/dashboard/analytics");

        const desktopNav = page.getByRole("navigation", {
            name: "Điều hướng chính",
        });
        await expect(
            desktopNav.getByRole("link", {
                name: "Phân tích",
            })
        ).toHaveAttribute("aria-current", "page");
        await expect(
            page.getByRole("button", {
                name: "Đăng xuất",
            })
        ).toBeVisible();

        await page.setViewportSize({
            width: 360,
            height: 800,
        });
        const mobileNav = page.getByRole("navigation", {
            name: "Điều hướng di động",
        });
        await expect(
            mobileNav.getByRole("link", {
                name: "Phân tích",
            })
        ).toHaveAttribute("aria-current", "page");
        await expect(
            mobileNav.getByRole("link", {
                name: "Công ty",
            })
        ).toHaveAttribute(
            "href",
            "/dashboard/company"
        );
    });
});

async function overrideJson(
    page: Page,
    pattern: string,
    body: unknown
): Promise<void> {
    await page.route(pattern, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(body),
        });
    });
}

function requestedPaths(
    requests: import("@playwright/test").Request[]
): string[] {
    return requests.map(
        (request) => new URL(request.url()).pathname
    );
}
