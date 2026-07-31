import { clearSession } from "@/lib/auth";
import { getSafeDestination } from "@/lib/safe-destination";

let redirectingTo: string | null = null;

export function getCurrentSafeDestination(): string {
    if (typeof window === "undefined") {
        return "/";
    }

    return getSafeDestination(
        `${window.location.pathname}${window.location.search}`,
        "/"
    );
}

export function createLoginDestination(
    requestedDestination?: string | null
): string {
    const destination = getSafeDestination(
        requestedDestination,
        getCurrentSafeDestination()
    );

    return destination === "/"
        ? "/login"
        : `/login?next=${encodeURIComponent(destination)}`;
}

export function redirectExpiredSession(
    requestedDestination?: string | null
): void {
    clearSession();

    if (
        typeof window === "undefined" ||
        window.location.pathname === "/login"
    ) {
        return;
    }

    const loginDestination = createLoginDestination(
        requestedDestination
    );

    if (redirectingTo === loginDestination) {
        return;
    }

    redirectingTo = loginDestination;
    window.location.replace(loginDestination);
}

export function resetAuthRedirectCoordinator(): void {
    redirectingTo = null;
}
