import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveDataTableProps {
    children: ReactNode;
    mobileFallback?: ReactNode;
    label: string;
    className?: string;
}

export function ResponsiveDataTable({
    children,
    mobileFallback,
    label,
    className,
}: ResponsiveDataTableProps) {
    return (
        <section className={cn("border border-line bg-surface", className)}>
            <h2 className="sr-only">{label}</h2>
            {mobileFallback && (
                <div className="divide-y divide-line md:hidden">
                    {mobileFallback}
                </div>
            )}
            <div
                className={cn(
                    "overflow-x-auto",
                    mobileFallback && "hidden md:block"
                )}
            >
                {children}
            </div>
        </section>
    );
}
