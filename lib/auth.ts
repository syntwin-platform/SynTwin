// ─── Plan definitions ──────────────────────────────────────────────────────

export type PlanId = "unpaid" | "basic" | "enterprise";

export interface Plan {
    id: PlanId;
    name: string;
    robotLimit: number; // -1 = unlimited
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

// ─── Preset accounts ───────────────────────────────────────────────────────

export interface Account {
    email: string;
    password: string;
    name: string;
    plan: PlanId;
    isAdmin?: boolean;
}

export const ACCOUNTS: Account[] = [
    {
        email: "admin@syntwin.io",
        password: "adminpassword",
        name: "Admin User",
        plan: "enterprise",
        isAdmin: true,
    },
    {
        email: "operator@syntwin.io",
        password: "password",
        name: "Operator",
        plan: "enterprise",
    },
    {
        email: "newuser@syntwin.io",
        password: "password",
        name: "New User",
        plan: "unpaid",
    },
    {
        email: "basic@syntwin.io",
        password: "password",
        name: "Basic User",
        plan: "basic",
    },
    {
        email: "enterprise@syntwin.io",
        password: "password",
        name: "Enterprise User",
        plan: "enterprise",
    },
];

// ─── In-memory dynamic account registry (for register) ─────────────────────
// Merges with ACCOUNTS at runtime; stored in localStorage as "syntwin_accounts"

export function getAllAccounts(): Account[] {
    if (typeof window === "undefined") return ACCOUNTS;
    try {
        const raw = localStorage.getItem("syntwin_accounts");
        const extra: Account[] = raw ? JSON.parse(raw) : [];
        // Merge: extra accounts override preset ones by email
        const map = new Map<string, Account>(ACCOUNTS.map((a) => [a.email, a]));
        extra.forEach((a) => map.set(a.email, a));
        return Array.from(map.values());
    } catch {
        return ACCOUNTS;
    }
}

export function registerAccount(account: Account): void {
    if (typeof window === "undefined") return;
    try {
        const raw = localStorage.getItem("syntwin_accounts");
        const extra: Account[] = raw ? JSON.parse(raw) : [];
        const idx = extra.findIndex((a) => a.email === account.email);
        if (idx >= 0) extra[idx] = account;
        else extra.push(account);
        localStorage.setItem("syntwin_accounts", JSON.stringify(extra));
    } catch { }
}

// ─── Session helpers ────────────────────────────────────────────────────────

export interface Session {
    email: string;
    name: string;
    plan: PlanId;
    isAdmin?: boolean;
}

const SESSION_KEY = "syntwin_session";

export function getSession(): Session | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
        return null;
    }
}

export function setSession(session: Session): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
}

export function login(
    email: string,
    password: string
): { ok: true; session: Session } | { ok: false; error: string } {
    const accounts = getAllAccounts();
    const account = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    if (!account) return { ok: false, error: "No account found with that email." };
    if (account.password !== password)
        return { ok: false, error: "Incorrect password." };
    const session: Session = {
        email: account.email,
        name: account.name,
        plan: account.plan,
        isAdmin: account.isAdmin,
    };
    setSession(session);
    return { ok: true, session };
}
