import type { Page } from "@playwright/test";
import type {
    BackendSubscriptionPlan,
    BackendUser,
    BackendUserRole,
    Session,
} from "@/lib/auth";

export type SessionKind =
    | "none"
    | "free"
    | "basic"
    | "premium"
    | "admin";

const FIXED_EXPIRES_AT = "2099-01-01T00:00:00.000Z";

const identities: Record<
    Exclude<SessionKind, "none">,
    {
        id: string;
        email: string;
        fullName: string;
        role: BackendUserRole;
        subscriptionPlan: BackendSubscriptionPlan;
        maxRobots: number;
    }
> = {
    free: {
        id: "fixture-free-user",
        email: "free.fixture@syntwin.test",
        fullName: "Người dùng Free",
        role: "User",
        subscriptionPlan: "Free",
        maxRobots: 1,
    },
    basic: {
        id: "fixture-basic-user",
        email: "basic.fixture@syntwin.test",
        fullName: "Quản lý Basic",
        role: "User",
        subscriptionPlan: "Basic",
        maxRobots: 3,
    },
    premium: {
        id: "fixture-premium-user",
        email: "premium.fixture@syntwin.test",
        fullName: "Quản lý Premium",
        role: "User",
        subscriptionPlan: "Premium",
        maxRobots: 30,
    },
    admin: {
        id: "fixture-super-admin",
        email: "admin.fixture@syntwin.test",
        fullName: "Quản trị SynTwin",
        role: "SuperAdmin",
        subscriptionPlan: "Premium",
        maxRobots: 30,
    },
};

export function createBackendUser(
    kind: Exclude<SessionKind, "none">
): BackendUser {
    const identity = identities[kind];

    return {
        id: identity.id,
        email: identity.email,
        fullName: identity.fullName,
        role: identity.role,
        status: "Active",
        subscriptionPlan: identity.subscriptionPlan,
        canView3D: kind !== "free",
        canSendCommand: kind !== "free",
        maxRobots: identity.maxRobots,
        timezone: "Asia/Ho_Chi_Minh",
        avatarUrl: null,
    };
}

export function createSession(
    kind: Exclude<SessionKind, "none">
): Session {
    const user = createBackendUser(kind);

    return {
        userId: user.id,
        email: user.email,
        name: user.fullName ?? user.email,
        plan:
            user.subscriptionPlan === "Premium"
                ? "enterprise"
                : user.subscriptionPlan === "Basic"
                  ? "basic"
                  : "unpaid",
        subscriptionPlan: user.subscriptionPlan,
        role: user.role,
        status: user.status,
        isAdmin: user.role === "SuperAdmin",
        canView3D: user.canView3D,
        canSendCommand: user.canSendCommand,
        maxRobots: user.maxRobots,
        timezone: user.timezone,
        avatarUrl: user.avatarUrl,
        accessToken: `fixture-access-${kind}`,
        refreshToken: `fixture-refresh-${kind}`,
        expiresAt: FIXED_EXPIRES_AT,
    };
}

export async function installSession(
    page: Page,
    kind: SessionKind
): Promise<void> {
    const session = kind === "none" ? null : createSession(kind);

    await page.addInitScript((fixtureSession) => {
        if (fixtureSession) {
            window.localStorage.setItem(
                "syntwin_session",
                JSON.stringify(fixtureSession)
            );
        } else {
            window.localStorage.removeItem("syntwin_session");
        }
    }, session);
}
