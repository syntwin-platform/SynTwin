"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AlertTriangle,
    BarChart3,
    Bot,
    Building2,
    Download,
    LayoutDashboard,
    UserRound,
} from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: LayoutDashboard, label: "Tổng quan", href: "/dashboard" },
    { icon: Bot, label: "Robot", href: "/dashboard/robots" },
    { icon: AlertTriangle, label: "Cảnh báo", href: "/dashboard/alerts" },
    { icon: BarChart3, label: "Phân tích", href: "/dashboard/analytics" },
    { icon: Building2, label: "Công ty", href: "/dashboard/company" },
    { icon: Download, label: "Tải phần mềm", href: "/dashboard/downloads" },
    { icon: UserRound, label: "Tài khoản", href: "/dashboard/user" },
] as const;

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-full w-16 flex-col border-r border-line bg-surface py-4 lg:w-60">
            <BrandMark
                href="/dashboard"
                compact
                className="mx-auto mb-7 lg:hidden"
            />
            <BrandMark
                href="/dashboard"
                className="mb-7 hidden px-4 lg:inline-flex"
            />
            <p className="mb-2 hidden px-5 font-telemetry text-[10px] font-semibold uppercase tracking-[.16em] text-subtle lg:block">
                Điều hướng vận hành
            </p>
            <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Điều hướng chính">
                {navItems.map((item) => {
                    const active =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            title={item.label}
                            className={cn(
                                "group relative flex min-h-11 items-center justify-center gap-3 rounded-md px-3 text-sm font-medium transition-colors lg:justify-start",
                                active
                                    ? "bg-brand-soft text-brand"
                                    : "text-steel hover:bg-canvas hover:text-ink"
                            )}
                        >
                            {active && (
                                <span className="absolute inset-y-2 left-0 w-0.5 bg-brand" />
                            )}
                            <item.icon className="size-[18px] shrink-0" />
                            <span className="hidden lg:block">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="mx-3 hidden border-t border-line pt-4 lg:block">
                <p className="text-xs leading-5 text-subtle">
                    Dữ liệu hiển thị theo công ty đang chọn và quyền của tài khoản.
                </p>
            </div>
        </aside>
    );
}
