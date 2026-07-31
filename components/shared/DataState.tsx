import type { ReactNode } from "react";
import {
    AlertTriangle,
    Database,
    LoaderCircle,
    RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataStateProps {
    state: "loading" | "empty" | "error" | "unavailable";
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    action?: ReactNode;
    className?: string;
}

const defaults = {
    loading: {
        title: "Đang tải dữ liệu",
        description: "SynTwin đang đồng bộ trạng thái mới nhất.",
        icon: LoaderCircle,
    },
    empty: {
        title: "Chưa có dữ liệu",
        description: "Chưa có bản ghi phù hợp với phạm vi đang chọn.",
        icon: Database,
    },
    error: {
        title: "Không thể tải dữ liệu",
        description: "Kết nối hiện chưa ổn định. Vui lòng thử lại.",
        icon: AlertTriangle,
    },
    unavailable: {
        title: "Nguồn dữ liệu chưa sẵn sàng",
        description: "Backend hiện chưa cung cấp chỉ số này.",
        icon: Database,
    },
};

export function DataState({
    state,
    title,
    description,
    actionLabel = "Thử lại",
    onAction,
    action,
    className,
}: DataStateProps) {
    const preset = defaults[state];
    const Icon = preset.icon;

    return (
        <div
            className={cn(
                "flex min-h-44 flex-col items-center justify-center border border-dashed border-line bg-canvas px-6 py-8 text-center",
                className
            )}
            role={state === "error" ? "alert" : "status"}
        >
            <Icon
                className={cn(
                    "mb-3 size-5 text-subtle",
                    state === "loading" && "animate-spin",
                    state === "error" && "text-danger"
                )}
                aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-ink">
                {title ?? preset.title}
            </h3>
            <p className="mt-1 max-w-md text-sm leading-5 text-subtle">
                {description ?? preset.description}
            </p>
            {action ??
                (onAction && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAction}
                        className="mt-4"
                    >
                        <RotateCcw aria-hidden="true" />
                        {actionLabel}
                    </Button>
                ))}
        </div>
    );
}
