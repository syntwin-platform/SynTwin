export type PlanId = "unpaid" | "basic" | "enterprise";

export interface Plan {
    id: PlanId;
    name: string;
    robotLimit: number;
}

export const PLANS: Record<PlanId, Plan> = {
    unpaid: {
        id: "unpaid",
        name: "No Plan",
        robotLimit: 0,
    },
    basic: {
        id: "basic",
        name: "Pilot",
        robotLimit: 3,
    },
    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        robotLimit: -1,
    },
};

export type BackendSubscriptionPlan = "Free" | "Basic" | "Premium";
export type BackendUserRole = "User" | "SuperAdmin";

export interface Session {
    userId: string;
    email: string;
    name: string;
    plan: PlanId;
    subscriptionPlan: BackendSubscriptionPlan;
    role: BackendUserRole;
    status: string;
    isAdmin: boolean;
    canView3D: boolean;
    canSendCommand: boolean;
    maxRobots: number;
    timezone: string;
    avatarUrl?: string | null;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface BackendUser {
    id: string;
    email: string;
    role: BackendUserRole;
    status: string;
    subscriptionPlan: BackendSubscriptionPlan;
    canView3D: boolean;
    canSendCommand: boolean;
    maxRobots: number;
    timezone: string;
    fullName?: string | null;
    avatarUrl?: string | null;
}

export interface BackendAuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: BackendUser;
}

const SESSION_KEY = "syntwin_session";
const SESSION_CHANGED_EVENT = "syntwin-session-changed";

function mapPlan(subscriptionPlan: BackendSubscriptionPlan): PlanId {
    switch (subscriptionPlan) {
        case "Premium":
            return "enterprise";

        case "Basic":
            return "basic";

        default:
            return "unpaid";
    }
}

export function getSession(): Session | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;

        const session = JSON.parse(raw) as Partial<Session>;

        if (
            !session.userId ||
            !session.email ||
            !session.accessToken ||
            !session.refreshToken
        ) {
            return null;
        }

        return session as Session;
    } catch {
        return null;
    }
}

export function setSession(session: Session): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function subscribeToSession(
    onStoreChange: () => void
): () => void {
    if (typeof window === "undefined") {
        return () => {};
    }

    window.addEventListener("storage", onStoreChange);
    window.addEventListener(SESSION_CHANGED_EVENT, onStoreChange);

    return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(
            SESSION_CHANGED_EVENT,
            onStoreChange
        );
    };
}

export function getSessionSnapshot(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
    return getSession()?.accessToken ?? null;
}

function createSession(
    user: BackendUser,
    tokens: Pick<
        BackendAuthResponse,
        "accessToken" | "refreshToken" | "expiresAt"
    >
): Session {
    return {
        userId: user.id,
        email: user.email,
        name: user.fullName?.trim() || user.email,
        plan: mapPlan(user.subscriptionPlan),
        subscriptionPlan: user.subscriptionPlan,
        role: user.role,
        status: user.status,
        isAdmin: user.role === "SuperAdmin",
        canView3D: user.canView3D,
        canSendCommand: user.canSendCommand,
        maxRobots: user.maxRobots,
        timezone: user.timezone,
        avatarUrl: user.avatarUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
    };
}

export function storeAuthResponse(
    auth: BackendAuthResponse
): Session | null {
    if (
        !auth?.accessToken ||
        !auth.refreshToken ||
        !auth.expiresAt ||
        !auth.user?.id
    ) {
        return null;
    }

    const session = createSession(auth.user, auth);
    setSession(session);
    return session;
}

export function updateSessionUser(user: BackendUser): Session | null {
    const currentSession = getSession();

    if (!currentSession || currentSession.userId !== user.id) {
        return null;
    }

    const session = createSession(user, currentSession);
    setSession(session);
    return session;
}
