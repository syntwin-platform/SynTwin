import type { Page, Request, Route } from "@playwright/test";
import type {
    AdminCompany,
    AdminCompanyMember,
    AdminUserDetail,
    AdminUserListItem,
} from "@/lib/api/admin";
import { createBackendUser } from "./sessions";
import {
    adminCompanies,
    adminCompanyMembers,
    adminMetricCounts,
    adminUserDetails,
} from "../fixtures/admin";

export interface AdminApiMockController {
    requests: Request[];
    adminRequests: () => Request[];
}

export async function installAdminApiMocks(
    page: Page
): Promise<AdminApiMockController> {
    const requests: Request[] = [];
    const state = {
        users: structuredClone(adminUserDetails),
        companies: structuredClone(adminCompanies),
        members: structuredClone(adminCompanyMembers),
        nextMonitor: 2,
    };

    await page.route("**/api/**", async (route) => {
        const request = route.request();
        requests.push(request);
        await fulfillAdminRoute(route, state);
    });

    return {
        requests,
        adminRequests: () =>
            requests.filter((request) =>
                new URL(request.url()).pathname.startsWith("/api/admin/")
            ),
    };
}

async function fulfillAdminRoute(
    route: Route,
    state: {
        users: AdminUserDetail[];
        companies: AdminCompany[];
        members: Record<string, AdminCompanyMember[]>;
        nextMonitor: number;
    }
): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/auth/me") {
        await fulfillJson(route, createBackendUser("admin"));
        return;
    }

    if (path === "/api/auth/refresh") {
        await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({ message: "Refresh fixture disabled" }),
        });
        return;
    }

    if (path === "/api/auth/logout" && method === "POST") {
        await route.fulfill({ status: 204 });
        return;
    }

    if (path === "/api/admin/users" && method === "GET") {
        await fulfillAdminUsers(route, url, state.users);
        return;
    }

    const userMatch = path.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (userMatch && method === "GET") {
        const user = state.users.find(
            ({ id }) => id === decodeURIComponent(userMatch[1])
        );
        await fulfillJson(route, user ?? null, user ? 200 : 404);
        return;
    }

    const userMutation = path.match(
        /^\/api\/admin\/users\/([^/]+)\/(status|role|subscription)$/
    );
    if (userMutation && method === "PATCH") {
        const user = state.users.find(
            ({ id }) => id === decodeURIComponent(userMutation[1])
        );
        if (!user) {
            await fulfillJson(route, { message: "Không tìm thấy người dùng." }, 404);
            return;
        }

        const payload = parseBody(request);
        if (userMutation[2] === "status") {
            user.status = payload.status as AdminUserDetail["status"];
        } else if (userMutation[2] === "role") {
            user.role = payload.role as AdminUserDetail["role"];
        } else {
            user.subscriptionPlan =
                payload.subscriptionPlan as AdminUserDetail["subscriptionPlan"];
        }

        await fulfillJson(route, user);
        return;
    }

    if (path === "/api/admin/companies" && method === "GET") {
        const search = url.searchParams.get("search")?.toLocaleLowerCase(
            "vi"
        );
        const companies = search
            ? state.companies.filter((company) =>
                  `${company.name} ${company.ownerEmail}`
                      .toLocaleLowerCase("vi")
                      .includes(search)
              )
            : state.companies;
        await fulfillJson(route, companies);
        return;
    }

    const memberList = path.match(
        /^\/api\/admin\/companies\/([^/]+)\/members$/
    );
    if (memberList && method === "GET") {
        await fulfillJson(
            route,
            state.members[decodeURIComponent(memberList[1])] ?? []
        );
        return;
    }

    const addMonitor = path.match(
        /^\/api\/admin\/companies\/([^/]+)\/monitors$/
    );
    if (addMonitor && method === "POST") {
        const companyId = decodeURIComponent(addMonitor[1]);
        const payload = parseBody(request);
        const monitor: AdminCompanyMember = {
            userId: `monitor-${state.nextMonitor++}`,
            email: String(payload.email),
            fullName: null,
            avatarUrl: null,
            role: "Monitor",
            joinedAt: "2026-07-31T08:00:00.000Z",
        };
        state.members[companyId] = [
            ...(state.members[companyId] ?? []),
            monitor,
        ];
        await fulfillJson(route, monitor);
        return;
    }

    const monitorMutation = path.match(
        /^\/api\/admin\/companies\/([^/]+)\/monitors\/([^/]+)$/
    );
    if (monitorMutation) {
        const companyId = decodeURIComponent(monitorMutation[1]);
        const monitorId = decodeURIComponent(monitorMutation[2]);
        const members = state.members[companyId] ?? [];
        const monitorIndex = members.findIndex(
            ({ userId }) => userId === monitorId
        );

        if (method === "PUT" && monitorIndex >= 0) {
            const payload = parseBody(request);
            members[monitorIndex] = {
                ...members[monitorIndex],
                email: String(payload.email),
            };
            await fulfillJson(route, members[monitorIndex]);
            return;
        }

        if (method === "DELETE" && monitorIndex >= 0) {
            members.splice(monitorIndex, 1);
            await route.fulfill({ status: 204 });
            return;
        }
    }

    await fulfillJson(
        route,
        { message: `API fixture chưa hỗ trợ ${method} ${path}.` },
        404
    );
}

async function fulfillAdminUsers(
    route: Route,
    url: URL,
    users: AdminUserDetail[]
): Promise<void> {
    const status = url.searchParams.get("status");
    const plan = url.searchParams.get("plan");
    const role = url.searchParams.get("role");
    const search = url.searchParams.get("search")?.toLocaleLowerCase("vi");
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);

    if (pageSize === 1 && status) {
        await fulfillUserList(route, [], page, pageSize, metricStatus(status));
        return;
    }
    if (pageSize === 1 && plan) {
        await fulfillUserList(route, [], page, pageSize, metricPlan(plan));
        return;
    }
    if (pageSize === 1 && !role && !search) {
        await fulfillUserList(
            route,
            [],
            page,
            pageSize,
            adminMetricCounts.totalUsers
        );
        return;
    }

    let filtered: AdminUserListItem[] = users;
    if (status) filtered = filtered.filter((user) => user.status === status);
    if (plan) {
        filtered = filtered.filter(
            (user) => user.subscriptionPlan === plan
        );
    }
    if (role) filtered = filtered.filter((user) => user.role === role);
    if (search) {
        filtered = filtered.filter((user) =>
            `${user.fullName ?? ""} ${user.email}`
                .toLocaleLowerCase("vi")
                .includes(search)
        );
    }

    const totalItems =
        status || plan || role || search ? filtered.length : 41;
    await fulfillUserList(
        route,
        filtered,
        page,
        pageSize,
        totalItems
    );
}

async function fulfillUserList(
    route: Route,
    items: AdminUserListItem[],
    page: number,
    pageSize: number,
    totalItems: number
): Promise<void> {
    await fulfillJson(route, {
        items,
        page,
        pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    });
}

function metricStatus(status: string): number {
    return adminMetricCounts.byStatus[
        status as keyof typeof adminMetricCounts.byStatus
    ] ?? 0;
}

function metricPlan(plan: string): number {
    return adminMetricCounts.byPlan[
        plan as keyof typeof adminMetricCounts.byPlan
    ] ?? 0;
}

function parseBody(request: Request): Record<string, unknown> {
    const body = request.postData();
    return body ? (JSON.parse(body) as Record<string, unknown>) : {};
}

async function fulfillJson(
    route: Route,
    value: unknown,
    status = 200
): Promise<void> {
    await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(value),
    });
}
