import type { ReactNode } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Info,
    TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeedbackTone = "info" | "success" | "warning" | "error";

interface FeedbackBannerProps {
    title?: string;
    children: ReactNode;
    tone?: FeedbackTone;
    actions?: ReactNode;
    className?: string;
}

const toneClasses: Record<FeedbackTone, string> = {
    info: "border-blue-200 bg-blue-50 text-blue-900",
    success: "border-green-200 bg-green-50 text-green-900",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    error: "border-red-200 bg-red-50 text-red-900",
};

const toneIcons = {
    info: Info,
    success: CheckCircle2,
    warning: TriangleAlert,
    error: AlertCircle,
};

export function FeedbackBanner({
    title,
    children,
    tone = "info",
    actions,
    className,
}: FeedbackBannerProps) {
    const Icon = toneIcons[tone];

    return (
        <div
            className={cn(
                "flex flex-col gap-3 border px-4 py-3 sm:flex-row sm:items-start sm:justify-between",
                toneClasses[tone],
                className
            )}
            role={tone === "error" ? "alert" : "status"}
        >
            <div className="flex gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div className="text-sm leading-5">
                    {title && <p className="font-semibold">{title}</p>}
                    <div>{children}</div>
                </div>
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
        </div>
    );
}
