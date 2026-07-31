import { Suspense } from "react";
import { AccessBoundary } from "@/components/auth/AccessBoundary";
import { AccessLoading } from "@/components/auth/AccessLoading";

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<AccessLoading />}>
            <AccessBoundary>{children}</AccessBoundary>
        </Suspense>
    );
}
