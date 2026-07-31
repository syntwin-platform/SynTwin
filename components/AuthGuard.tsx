import { Suspense, type ReactNode } from "react";
import { AccessBoundary } from "@/components/auth/AccessBoundary";
import { AccessLoading } from "@/components/auth/AccessLoading";

interface AuthGuardProps {
    children: ReactNode;
    requireAdmin?: boolean;
    requirePaid?: boolean;
}

export function AuthGuard({
    children,
    requireAdmin = false,
    requirePaid = true,
}: AuthGuardProps) {
    return (
        <Suspense fallback={<AccessLoading />}>
            <AccessBoundary
                mode={
                    requireAdmin
                        ? "admin"
                        : requirePaid
                          ? "paid"
                          : "authenticated"
                }
            >
                {children}
            </AccessBoundary>
        </Suspense>
    );
}
