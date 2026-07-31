import { Suspense } from "react";

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-subtle">
                    Đang tải bảng giá…
                </main>
            }
        >
            {children}
        </Suspense>
    );
}
