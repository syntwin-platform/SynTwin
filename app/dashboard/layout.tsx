import { Suspense } from "react";
import { AccessBoundary } from "@/components/auth/AccessBoundary";
import { AccessLoading } from "@/components/auth/AccessLoading";

export const metadata = {
    title: "SynTwin — Vận hành nhà máy",
};

export default function DashboardLayout({
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
