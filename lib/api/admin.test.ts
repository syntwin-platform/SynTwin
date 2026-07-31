import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequest } = vi.hoisted(() => ({
    apiRequest: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
    apiRequest,
}));

import {
    adminAddCompanyMonitor,
    adminGetDashboardMetrics,
    adminRemoveCompanyMonitor,
    adminReplaceCompanyMonitor,
    adminUpdateUserRole,
    adminUpdateUserStatus,
    adminUpdateUserSubscription,
} from "./admin";

describe("admin API contracts", () => {
    beforeEach(() => {
        apiRequest.mockReset();
    });

    it("derives overview metrics only from the composed admin API responses", async () => {
        apiRequest.mockImplementation((path: string) => {
            const url = new URL(path, "https://syntwin.test");
            if (url.pathname === "/api/admin/companies") {
                return Promise.resolve([
                    { monitorCount: 1 },
                    { monitorCount: 3 },
                ]);
            }

            const status = url.searchParams.get("status");
            const plan = url.searchParams.get("plan");
            const totals: Record<string, number> = {
                Active: 29,
                Locked: 7,
                Deleted: 1,
                Free: 18,
                Basic: 12,
                Premium: 7,
            };
            return Promise.resolve({
                items: [],
                page: 1,
                pageSize: 1,
                totalItems:
                    (status && totals[status]) ||
                    (plan && totals[plan]) ||
                    37,
                totalPages: 1,
            });
        });

        const signal = new AbortController().signal;
        const metrics = await adminGetDashboardMetrics(signal);

        expect(metrics).toEqual({
            totalUsers: 37,
            activeUsers: 29,
            totalCompanies: 2,
            linkedMonitors: 4,
            usersByStatus: [
                { name: "Active", count: 29 },
                { name: "Locked", count: 7 },
                { name: "Deleted", count: 1 },
            ],
            usersByPlan: [
                { name: "Free", count: 18 },
                { name: "Basic", count: 12 },
                { name: "Premium", count: 7 },
            ],
        });
        expect(Object.keys(metrics).sort()).toEqual(
            [
                "activeUsers",
                "linkedMonitors",
                "totalCompanies",
                "totalUsers",
                "usersByPlan",
                "usersByStatus",
            ].sort()
        );
        expect(apiRequest).toHaveBeenCalledTimes(8);
        expect(
            apiRequest.mock.calls.every(
                ([, options]) => options.signal === signal
            )
        ).toBe(true);
    });

    it("preserves exact user mutation paths and payloads", async () => {
        apiRequest.mockResolvedValue({});

        await adminUpdateUserStatus("user/a", { status: "Locked" });
        await adminUpdateUserRole("user/a", { role: "SuperAdmin" });
        await adminUpdateUserSubscription("user/a", {
            subscriptionPlan: "Premium",
        });

        expect(apiRequest.mock.calls).toEqual([
            [
                "/api/admin/users/user/a/status",
                {
                    method: "PATCH",
                    body: JSON.stringify({ status: "Locked" }),
                },
            ],
            [
                "/api/admin/users/user/a/role",
                {
                    method: "PATCH",
                    body: JSON.stringify({ role: "SuperAdmin" }),
                },
            ],
            [
                "/api/admin/users/user/a/subscription",
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        subscriptionPlan: "Premium",
                    }),
                },
            ],
        ]);
    });

    it("preserves exact company monitor paths, methods, and payloads", async () => {
        apiRequest.mockResolvedValue({});

        await adminAddCompanyMonitor("company/a", {
            email: "monitor@factory.test",
        });
        await adminReplaceCompanyMonitor("company/a", "monitor/b", {
            email: "replacement@factory.test",
        });
        await adminRemoveCompanyMonitor("company/a", "monitor/b");

        expect(apiRequest.mock.calls).toEqual([
            [
                "/api/admin/companies/company/a/monitors",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email: "monitor@factory.test",
                    }),
                },
            ],
            [
                "/api/admin/companies/company/a/monitors/monitor/b",
                {
                    method: "PUT",
                    body: JSON.stringify({
                        email: "replacement@factory.test",
                    }),
                },
            ],
            [
                "/api/admin/companies/company/a/monitors/monitor/b",
                { method: "DELETE" },
            ],
        ]);
    });
});
