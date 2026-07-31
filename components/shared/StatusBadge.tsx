import type { ReactNode } from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

interface StatusBadgeProps {
    children: ReactNode;
    tone?: StatusTone;
    className?: string;
}

const toneClasses: Record<StatusTone, string> = {
    neutral: "border-line bg-muted text-steel [&_svg]:fill-subtle [&_svg]:text-subtle",
    info: "border-blue-200 bg-blue-50 text-blue-700 [&_svg]:fill-info [&_svg]:text-info",
    success:
        "border-green-200 bg-green-50 text-green-700 [&_svg]:fill-success [&_svg]:text-success",
    warning:
        "border-amber-200 bg-amber-50 text-amber-800 [&_svg]:fill-warning [&_svg]:text-warning",
    danger:
        "border-red-200 bg-red-50 text-red-700 [&_svg]:fill-danger [&_svg]:text-danger",
};

export function StatusBadge({
    children,
    tone = "neutral",
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
                toneClasses[tone],
                className
            )}
        >
            <Circle className="size-2" aria-hidden="true" />
            {children}
        </span>
    );
}
