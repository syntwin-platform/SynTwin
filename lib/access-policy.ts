import type { Session } from "@/lib/auth";
import {
    getEligiblePricingDestination,
    getSafeDestination,
} from "@/lib/safe-destination";

export type AccessSession = Pick<
    Session,
    "role" | "subscriptionPlan"
>;

export type AccessDecision =
    | { allowed: true }
    | { allowed: false; redirectTo: string };

export function isAdmin(
    session: AccessSession | null | undefined
): boolean {
    return session?.role === "SuperAdmin";
}

export function isFreeCustomer(
    session: AccessSession | null | undefined
): boolean {
    return (
        session?.role === "User" &&
        session.subscriptionPlan === "Free"
    );
}

export function isPaidCustomer(
    session: AccessSession | null | undefined
): boolean {
    return (
        session?.role === "User" &&
        (session.subscriptionPlan === "Basic" ||
            session.subscriptionPlan === "Premium")
    );
}

export function getDefaultDestination(
    session: AccessSession | null | undefined
): string {
    if (isAdmin(session)) {
        return "/admin/dashboard";
    }

    if (isFreeCustomer(session)) {
        return "/dashboard/demo";
    }

    if (isPaidCustomer(session)) {
        return "/dashboard";
    }

    return "/login";
}

export function evaluateRouteAccess(
    pathnameWithSearch: string,
    session: AccessSession | null | undefined
): AccessDecision {
    const pathname = pathnameWithSearch.split("?")[0];

    if (pathname === "/pricing") {
        return { allowed: true };
    }

    if (pathname === "/login" || pathname === "/register") {
        return session
            ? {
                  allowed: false,
                  redirectTo: getDefaultDestination(session),
              }
            : { allowed: true };
    }

    if (pathname === "/dashboard/demo") {
        if (!session) {
            return redirectToLogin(pathnameWithSearch);
        }

        return isFreeCustomer(session)
            ? { allowed: true }
            : {
                  allowed: false,
                  redirectTo: getDefaultDestination(session),
              };
    }

    if (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/")
    ) {
        if (!session) {
            return redirectToLogin(pathnameWithSearch);
        }

        return isPaidCustomer(session)
            ? { allowed: true }
            : {
                  allowed: false,
                  redirectTo: getDefaultDestination(session),
              };
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        if (!session) {
            return redirectToLogin(pathnameWithSearch);
        }

        return isAdmin(session)
            ? { allowed: true }
            : {
                  allowed: false,
                  redirectTo: getDefaultDestination(session),
              };
    }

    return { allowed: true };
}

export function getPostLoginDestination(
    session: AccessSession,
    requestedDestination: string | null | undefined
): string {
    const pricingDestination = getEligiblePricingDestination(
        requestedDestination
    );

    if (pricingDestination) {
        return pricingDestination;
    }

    const fallback = getDefaultDestination(session);
    const destination = getSafeDestination(
        requestedDestination,
        fallback
    );
    const decision = evaluateRouteAccess(destination, session);

    return decision.allowed ? destination : decision.redirectTo;
}

function redirectToLogin(
    destination: string
): AccessDecision {
    const safeDestination = getSafeDestination(destination, "/dashboard");

    return {
        allowed: false,
        redirectTo: `/login?next=${encodeURIComponent(safeDestination)}`,
    };
}
