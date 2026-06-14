"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { clearSession, type Session } from "@/lib/auth";
import { restoreSession } from "@/lib/api/auth";

interface AuthGuardProps {
    children: ReactNode;
    requireAdmin?: boolean;
}

function subscribeToClient(): () => void {
    return () => {};
}

export function AuthGuard({
    children,
    requireAdmin = false,
}: AuthGuardProps) {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);

    const isClient = useSyncExternalStore(
        subscribeToClient,
        () => true,
        () => false
    );

    useEffect(() => {
        if (!isClient) return;

        let cancelled = false;

        void restoreSession()
            .then((restoredSession) => {
                if (cancelled) return;

                if (
                    requireAdmin &&
                    restoredSession.role !== "SuperAdmin"
                ) {
                    router.replace("/dashboard");
                    return;
                }

                setSession(restoredSession);
            })
            .catch(() => {
                if (cancelled) return;

                clearSession();
                router.replace("/login");
            });

        return () => {
            cancelled = true;
        };
    }, [isClient, requireAdmin, router]);

    if (!session) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-slate-500">
                    Checking session...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
