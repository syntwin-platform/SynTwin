import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCellProps {
    label: string;
    value: ReactNode;
    unit?: string;
    detail?: string;
    trend?: "up" | "down" | "neutral";
    tone?: "default" | "brand" | "success" | "warning" | "danger";
    className?: string;
}

const toneClasses = {
    default: "text-ink",
    brand: "text-brand",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
};

export function MetricCell({
    label,
    value,
    unit,
    detail,
    trend = "neutral",
    tone = "default",
    className,
}: MetricCellProps) {
    const TrendIcon =
        trend === "up"
            ? ArrowUpRight
            : trend === "down"
              ? ArrowDownRight
              : Minus;

    return (
        <div
            className={cn(
                "min-w-0 border-l-2 border-line bg-surface px-4 py-3",
                tone === "brand" && "border-l-brand",
                tone === "success" && "border-l-success",
                tone === "warning" && "border-l-warning",
                tone === "danger" && "border-l-danger",
                className
            )}
        >
            <p className="text-xs font-medium text-subtle">{label}</p>
            <div className="mt-1 flex min-w-0 items-baseline gap-1.5">
                <span
                    className={cn(
                        "font-telemetry truncate text-2xl font-semibold tracking-tight",
                        toneClasses[tone]
                    )}
                >
                    {value}
                </span>
                {unit && (
                    <span className="font-telemetry text-xs text-subtle">
                        {unit}
                    </span>
                )}
            </div>
            {detail && (
                <p className="mt-1 flex items-center gap-1 text-xs text-subtle">
                    <TrendIcon className="size-3.5" aria-hidden="true" />
                    <span>{detail}</span>
                </p>
            )}
        </div>
    );
}
