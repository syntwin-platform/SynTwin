import { Clock3, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceContextProps {
    source: string;
    updatedAt?: string | Date | null;
    scope?: string;
    className?: string;
}

function formatUpdatedAt(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "medium",
    }).format(date);
}

export function SourceContext({
    source,
    updatedAt,
    scope,
    className,
}: SourceContextProps) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-subtle",
                className
            )}
        >
            <span className="inline-flex items-center gap-1.5">
                <Database className="size-3.5" aria-hidden="true" />
                Nguồn: {source}
            </span>
            {scope && <span>Phạm vi: {scope}</span>}
            {updatedAt && (
                <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    Cập nhật {formatUpdatedAt(updatedAt)}
                </span>
            )}
        </div>
    );
}
