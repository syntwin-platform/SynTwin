import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
    className?: string;
    compact?: boolean;
    href?: string;
}

export function BrandMark({
    className,
    compact = false,
    href = "/",
}: BrandMarkProps) {
    const content = (
        <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface">
                <Image
                    src="/images/syntwin-logo.svg"
                    alt=""
                    width={25}
                    height={25}
                    priority
                />
            </span>
            {!compact && (
                <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-semibold tracking-tight text-ink">
                        SynTwin
                    </span>
                    <span className="truncate text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">
                        Vận hành công nghiệp
                    </span>
                </span>
            )}
        </>
    );

    return (
        <Link
            href={href}
            className={cn(
                "inline-flex min-h-11 items-center gap-2.5 rounded-md focus-visible:outline-none",
                className
            )}
            aria-label="SynTwin"
        >
            {content}
        </Link>
    );
}
