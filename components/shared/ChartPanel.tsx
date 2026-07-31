import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartPanelProps {
    title: string;
    description?: string;
    meta?: ReactNode;
    summary?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function ChartPanel({
    title,
    description,
    meta,
    summary,
    children,
    className,
}: ChartPanelProps) {
    const headingId = `chart-${title
        .toLocaleLowerCase("vi")
        .replace(/[^a-z0-9]+/g, "-")}`;

    return (
        <figure
            className={cn(
                "overflow-hidden border border-line bg-surface",
                className
            )}
            aria-labelledby={headingId}
        >
            <figcaption className="flex flex-col gap-2 border-b border-line px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2
                        id={headingId}
                        className="text-sm font-semibold text-ink"
                    >
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-0.5 text-xs leading-5 text-subtle">
                            {description}
                        </p>
                    )}
                </div>
                {meta && (
                    <div className="font-telemetry text-[11px] text-subtle">
                        {meta}
                    </div>
                )}
            </figcaption>
            <div className="technical-grid p-4">{children}</div>
            {summary && (
                <div className="border-t border-line bg-canvas px-4 py-3 text-xs text-steel">
                    {summary}
                </div>
            )}
        </figure>
    );
}
