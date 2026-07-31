"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AlertTriangle,
    BarChart3,
    Bot,
    Download,
    LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/dashboard/robots", icon: Bot, label: "Robot" },
    { href: "/dashboard/alerts", icon: AlertTriangle, label: "Cảnh báo" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Phân tích" },
    { href: "/dashboard/downloads", icon: Download, label: "Tải" },
] as const;

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
            aria-label="Điều hướng di động"
        >
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
                        className={cn(
                            "flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium",
                            active ? "text-brand" : "text-subtle"
                        )}
                    >
                        <item.icon className="size-[18px]" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
