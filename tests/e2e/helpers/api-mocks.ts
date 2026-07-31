import type { Page, Request, Route } from "@playwright/test";
import {
    createBackendUser,
    type SessionKind,
} from "./sessions";
import type {
    PaymentStatus,
    VnPayPaymentStatus,
} from "@/lib/api/payments";
import {
    fixtureAdminCompanies,
    fixtureAdminCompanyMembers,
    fixtureAdminUser,
    fixtureCompany,
    fixtureLatestState,
    fixtureRobot,
    fixtureRobotCommands,
    fixtureSubscriptionPlans,
    fixtureTelemetryHistory,
} from "../fixtures/product";

export interface ApiMockOptions {
    session: SessionKind;
    restoreDelayMs?: number;
    authResultSession?: Exclude<SessionKind, "none">;
    checkoutPaymentUrl?: string;
    paymentStatus?: PaymentStatus;
    paymentStatusFailuresBeforeSuccess?: number;
}

export interface ApiMockController {
    requests: Request[];
    productRequests: () => Request[];
}

const productApiPattern =
    /\/api\/(companies|robots|subscription-plans|subscriptions|users|admin)(?:\/|$)/;

export async function installApiMocks(
    page: Page,
    options: ApiMockOptions
): Promise<ApiMockController> {
    const requests: Request[] = [];
    const state = {
        paymentStatusRequests: 0,
    };

    await page.route("**/api/**", async (route) => {
        const request = route.request();
        requests.push(request);
        await fulfillApiRoute(route, options, state);
    });

    return {
        requests,
        productRequests: () =>
            requests.filter((request) =>
                productApiPattern.test(new URL(request.url()).pathname)
            ),
    };
}

async function fulfillApiRoute(
    route: Route,
    options: ApiMockOptions,
    state: { paymentStatusRequests: number }
): Promise<void> {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path === "/api/auth/me") {
        if (options.restoreDelayMs) {
            await new Promise((resolve) =>
                setTimeout(resolve, options.restoreDelayMs)
            );
        }

        if (options.session === "none") {
            await route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({ message: "Unauthenticated fixture" }),
            });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(createBackendUser(options.session)),
        });
        return;
    }

    if (
        path === "/api/auth/register" &&
        request.method() === "POST"
    ) {
        await fulfillJson(route, {
            accessToken: "fixture-access-free",
            refreshToken: "fixture-refresh-free",
            expiresAt: "2099-01-01T00:00:00.000Z",
            user: createBackendUser("free"),
        });
        return;
    }

    if (
        path === "/api/auth/login" &&
        request.method() === "POST"
    ) {
        await fulfillAuth(
            route,
            options.authResultSession ?? "free"
        );
        return;
    }

    if (
        path === "/api/auth/login-code/request" &&
        request.method() === "POST"
    ) {
        await fulfillJson(route, {
            message: "Mã đăng nhập đã được gửi.",
        });
        return;
    }

    if (
        path === "/api/auth/login-code/confirm" &&
        request.method() === "POST"
    ) {
        await fulfillAuth(
            route,
            options.authResultSession ?? "free"
        );
        return;
    }

    if (path === "/api/auth/refresh") {
        await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ message: "Refresh is not configured" }),
        });
        return;
    }

    if (path === "/api/subscription-plans") {
        await fulfillJson(route, fixtureSubscriptionPlans);
        return;
    }

    if (path === "/api/companies") {
        await fulfillJson(route, [fixtureCompany]);
        return;
    }

    if (path === "/api/robots") {
        await fulfillJson(route, [fixtureRobot]);
        return;
    }

    if (/\/api\/robots\/[^/]+\/state\/latest$/.test(path)) {
        await fulfillJson(route, fixtureLatestState);
        return;
    }

    if (/\/api\/robots\/[^/]+\/telemetry\/history$/.test(path)) {
        await fulfillJson(route, fixtureTelemetryHistory);
        return;
    }

    if (/\/api\/robots\/[^/]+\/commands$/.test(path)) {
        await fulfillJson(route, fixtureRobotCommands);
        return;
    }

    if (path === "/api/users/me/subscription") {
        const plan =
            options.session === "premium" ? "Premium" : "Basic";
        const planDetails = fixtureSubscriptionPlans.find(
            (candidate) => candidate.code === plan
        );
        await fulfillJson(route, {
            planCode: plan,
            planName: plan,
            monthlyPrice: planDetails?.monthlyPrice ?? 0,
            maxRobots: planDetails?.maxRobots ?? 0,
            canView3D: false,
            canSendCommand: true,
            startsAt: "2026-01-01T00:00:00.000Z",
        });
        return;
    }

    if (
        path === "/api/payments/vnpay/checkout" &&
        request.method() === "POST"
    ) {
        const payload = request.postDataJSON() as {
            subscriptionPlan?: string;
        };
        const plan =
            payload.subscriptionPlan === "Premium"
                ? "Premium"
                : "Basic";

        await fulfillJson(route, {
            paymentId: "fixture-payment-01",
            merchantTransactionRef: "ST-20260731_001",
            paymentUrl:
                options.checkoutPaymentUrl ??
                "/payment/vnpay-return?txnRef=ST-20260731_001",
            amount: plan === "Premium" ? 299000 : 99000,
            currency: "VND",
            status: "Pending",
        });
        return;
    }

    if (/\/api\/payments\/vnpay\/status\/[^/]+$/.test(path)) {
        state.paymentStatusRequests += 1;

        if (
            state.paymentStatusRequests <=
            (options.paymentStatusFailuresBeforeSuccess ?? 0)
        ) {
            await route.fulfill({
                status: 503,
                contentType: "application/json",
                body: JSON.stringify({
                    message:
                        "Không thể xác minh giao dịch lúc này.",
                }),
            });
            return;
        }

        const paymentStatus =
            options.paymentStatus ?? "Pending";
        await fulfillJson(
            route,
            createPaymentStatus(paymentStatus)
        );
        return;
    }

    if (path === "/api/admin/users") {
        const url = new URL(request.url());
        const role = url.searchParams.get("role");
        const status = url.searchParams.get("status");
        const plan = url.searchParams.get("plan");
        const search = url.searchParams.get("search")?.toLowerCase();
        const matches =
            (!role || role === fixtureAdminUser.role) &&
            (!status || status === fixtureAdminUser.status) &&
            (!plan || plan === fixtureAdminUser.subscriptionPlan) &&
            (!search ||
                fixtureAdminUser.email.toLowerCase().includes(search) ||
                fixtureAdminUser.fullName.toLowerCase().includes(search));
        await fulfillJson(route, {
            items: matches ? [fixtureAdminUser] : [],
            page: 1,
            pageSize: 20,
            totalItems: matches ? 1 : 0,
            totalPages: 1,
        });
        return;
    }

    if (/\/api\/admin\/users\/[^/]+$/.test(path)) {
        await fulfillJson(route, fixtureAdminUser);
        return;
    }

    if (/\/api\/admin\/users\/[^/]+\/status$/.test(path)) {
        const payload = request.postDataJSON() as { status?: string };
        await fulfillJson(route, {
            ...fixtureAdminUser,
            status: payload.status ?? fixtureAdminUser.status,
        });
        return;
    }

    if (/\/api\/admin\/users\/[^/]+\/role$/.test(path)) {
        const payload = request.postDataJSON() as { role?: string };
        await fulfillJson(route, {
            ...fixtureAdminUser,
            role: payload.role ?? fixtureAdminUser.role,
        });
        return;
    }

    if (/\/api\/admin\/users\/[^/]+\/subscription$/.test(path)) {
        const payload = request.postDataJSON() as {
            subscriptionPlan?: string;
        };
        await fulfillJson(route, {
            ...fixtureAdminUser,
            subscriptionPlan:
                payload.subscriptionPlan ??
                fixtureAdminUser.subscriptionPlan,
        });
        return;
    }

    if (path === "/api/admin/companies") {
        await fulfillJson(route, fixtureAdminCompanies);
        return;
    }

    if (/\/api\/admin\/companies\/[^/]+\/members$/.test(path)) {
        await fulfillJson(route, fixtureAdminCompanyMembers);
        return;
    }

    if (
        /\/api\/admin\/companies\/[^/]+\/monitors$/.test(path) &&
        request.method() === "POST"
    ) {
        const payload = request.postDataJSON() as { email?: string };
        await fulfillJson(route, {
            ...fixtureAdminCompanyMembers[1],
            userId: "fixture-new-monitor",
            email: payload.email ?? "new.monitor@syntwin.test",
        });
        return;
    }

    if (
        /\/api\/admin\/companies\/[^/]+\/monitors\/[^/]+$/.test(
            path
        ) &&
        request.method() === "PUT"
    ) {
        const payload = request.postDataJSON() as { email?: string };
        await fulfillJson(route, {
            ...fixtureAdminCompanyMembers[1],
            userId: "fixture-replacement-monitor",
            email:
                payload.email ??
                "replacement.monitor@syntwin.test",
        });
        return;
    }

    if (
        /\/api\/admin\/companies\/[^/]+\/monitors\/[^/]+$/.test(
            path
        ) &&
        request.method() === "DELETE"
    ) {
        await route.fulfill({ status: 204, body: "" });
        return;
    }

    await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
    });
}

async function fulfillAuth(
    route: Route,
    kind: Exclude<SessionKind, "none">
): Promise<void> {
    await fulfillJson(route, {
        accessToken: `fixture-access-${kind}`,
        refreshToken: `fixture-refresh-${kind}`,
        expiresAt: "2099-01-01T00:00:00.000Z",
        user: createBackendUser(kind),
    });
}

function createPaymentStatus(
    paymentStatus: PaymentStatus
): VnPayPaymentStatus {
    return {
        paymentId: "fixture-payment-01",
        merchantTransactionRef: "ST-20260731_001",
        paymentStatus,
        subscriptionStatus:
            paymentStatus === "Paid"
                ? "Active"
                : paymentStatus === "Pending"
                  ? "PendingPayment"
                  : "Canceled",
        subscriptionPlan: "Basic",
        amount: 99000,
        currency: "VND",
        responseCode: paymentStatus === "Paid" ? "00" : "24",
        transactionStatus:
            paymentStatus === "Paid" ? "00" : "02",
        createdAt: "2026-07-31T08:00:00.000Z",
        paidAt:
            paymentStatus === "Paid"
                ? "2026-07-31T08:01:00.000Z"
                : null,
        processedAt:
            paymentStatus === "Pending"
                ? null
                : "2026-07-31T08:01:00.000Z",
    };
}

async function fulfillJson(
    route: Route,
    value: unknown
): Promise<void> {
    await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(value),
    });
}
