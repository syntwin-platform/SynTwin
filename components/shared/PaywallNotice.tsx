import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaywallNoticeProps {
    title?: string;
    description?: string;
    compact?: boolean;
    className?: string;
}

export function PaywallNotice({
    title = "Tính năng dành cho gói trả phí",
    description = "Nâng cấp Basic hoặc Premium để sử dụng dữ liệu thật và các thao tác quản lý.",
    compact = false,
    className,
}: PaywallNoticeProps) {
    return (
        <section
            className={cn(
                "border border-orange-200 bg-orange-50/60",
                compact ? "p-4" : "p-6",
                className
            )}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand text-white">
                        <LockKeyhole className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <h2 className="text-sm font-semibold text-ink">
                            {title}
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm leading-5 text-steel">
                            {description}
                        </p>
                    </div>
                </div>
                <Button asChild size="sm">
                    <Link href="/pricing">So sánh các gói</Link>
                </Button>
            </div>
        </section>
    );
}
