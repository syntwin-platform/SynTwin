"use client";

import {
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AccessLoading } from "@/components/auth/AccessLoading";
import {
    evaluateRouteAccess,
    getDefaultDestination,
    isAdmin,
    isPaidCustomer,
    type AccessDecision,
} from "@/lib/access-policy";
import { restoreSession } from "@/lib/api/auth";
import { redirectExpiredSession } from "@/lib/auth-redirect";
import { useSession } from "@/hooks/useSession";

interface AccessBoundaryProps {
    children: ReactNode;
    mode?: "policy" | "authenticated" | "paid" | "admin";
}

function subscribeToHydration(): () => void {
    return () => {};
}

export function AccessBoundary({
    children,
    mode = "policy",
}: AccessBoundaryProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const session = useSession();
    const isHydrated = useSyncExternalStore(
        subscribeToHydration,
        () => true,
        () => false
    );
    const [validatedAccessToken, setValidatedAccessToken] =
        useState<string | null>(null);

    const destination = useMemo(() => {
        const query = searchParams.toString();
        return query ? `${pathname}?${query}` : pathname;
    }, [pathname, searchParams]);

    const decision = useMemo<AccessDecision>(() => {
        if (mode === "authenticated") {
            return session
                ? { allowed: true }
                : {
                      allowed: false,
                      redirectTo: `/login?next=${encodeURIComponent(
                          destination
                      )}`,
                  };
        }

        if (mode === "paid") {
            if (isPaidCustomer(session) || isAdmin(session)) {
                return { allowed: true };
            }

            return session
                ? {
                      allowed: false,
                      redirectTo: getDefaultDestination(session),
                  }
                : {
                      allowed: false,
                      redirectTo: `/login?next=${encodeURIComponent(
                          destination
                      )}`,
                  };
        }

        if (mode === "admin") {
            if (isAdmin(session)) {
                return { allowed: true };
            }

            return session
                ? {
                      allowed: false,
                      redirectTo: getDefaultDestination(session),
                  }
                : {
                      allowed: false,
                      redirectTo: `/login?next=${encodeURIComponent(
                          destination
                      )}`,
                  };
        }

        return evaluateRouteAccess(destination, session);
    }, [destination, mode, session]);

    const needsValidation =
        Boolean(session?.accessToken) &&
        validatedAccessToken !== session?.accessToken;

    useEffect(() => {
        if (
            !isHydrated ||
            !session?.accessToken ||
            !needsValidation
        ) {
            return;
        }

        let cancelled = false;

        void restoreSession()
            .then((restoredSession) => {
                if (!cancelled) {
                    setValidatedAccessToken(
                        restoredSession.accessToken
                    );
                }
            })
            .catch(() => {
                if (!cancelled) {
                    redirectExpiredSession(destination);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [
        destination,
        isHydrated,
        needsValidation,
        session?.accessToken,
    ]);

    useEffect(() => {
        if (
            isHydrated &&
            !needsValidation &&
            !decision.allowed
        ) {
            router.replace(decision.redirectTo);
        }
    }, [decision, isHydrated, needsValidation, router]);

    if (
        !isHydrated ||
        needsValidation ||
        !decision.allowed
    ) {
        return <AccessLoading />;
    }

    return <>{children}</>;
}
