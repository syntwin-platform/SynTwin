import { beforeEach, describe, expect, it, vi } from "vitest";
import { setSession, type Session } from "@/lib/auth";

const redirectExpiredSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-redirect", () => ({
    redirectExpiredSession,
}));

import { apiRequest } from "@/lib/api/client";

const fixtureSession: Session = {
    userId: "unit-user",
    email: "unit@syntwin.test",
    name: "Unit User",
    plan: "basic",
    subscriptionPlan: "Basic",
    role: "User",
    status: "Active",
    isAdmin: false,
    canView3D: false,
    canSendCommand: true,
    maxRobots: 3,
    timezone: "Asia/Ho_Chi_Minh",
    accessToken: "expired-access",
    refreshToken: "expired-refresh",
    expiresAt: "2026-01-01T00:00:00.000Z",
};

describe("API authentication recovery", () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        const values = new Map<string, string>();
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => values.get(key) ?? null,
            setItem: (key: string, value: string) => {
                values.set(key, value);
            },
            removeItem: (key: string) => {
                values.delete(key);
            },
            clear: () => values.clear(),
        });
        redirectExpiredSession.mockReset();
    });

    it("coordinates one refresh for concurrent 401 responses", async () => {
        setSession(fixtureSession);
        const fetchMock = vi.fn(
            async (input: string | URL | Request) => {
                const url = String(input);

                if (url.endsWith("/api/auth/refresh")) {
                    return new Response(
                        JSON.stringify({ message: "Expired" }),
                        {
                            status: 401,
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    );
                }

                return new Response(
                    JSON.stringify({ message: "Unauthorized" }),
                    {
                        status: 401,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
            }
        );
        vi.stubGlobal("fetch", fetchMock);

        const results = await Promise.allSettled([
            apiRequest("/api/robots"),
            apiRequest("/api/companies"),
        ]);

        expect(results.every((result) => result.status === "rejected"))
            .toBe(true);
        expect(
            fetchMock.mock.calls.filter(([input]) =>
                String(input).endsWith("/api/auth/refresh")
            )
        ).toHaveLength(1);
        expect(redirectExpiredSession).toHaveBeenCalledTimes(1);
    });

    it("redirects without a network call when the token is missing", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        await expect(apiRequest("/api/robots")).rejects.toMatchObject({
            status: 401,
        });
        expect(fetchMock).not.toHaveBeenCalled();
        expect(redirectExpiredSession).toHaveBeenCalledTimes(1);
    });
});
