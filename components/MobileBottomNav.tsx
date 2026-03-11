"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/dashboard", icon: "🏭", label: "Factory" },
    { href: "/dashboard/robots", icon: "🤖", label: "Robots" },
    { href: "/dashboard/alerts", icon: "⚠️", label: "Alerts" },
    { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-[#E2E8F0] bg-white sm:hidden">
            {NAV_ITEMS.map(({ href, icon, label }) => {
                const active =
                    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
                return (
                    <a
                        key={href}
                        href={href}
                        className={cn(
                            "flex flex-col items-center gap-0.5 px-3 py-1 transition-opacity",
                            active ? "opacity-100" : "opacity-50"
                        )}
                    >
                        <span className="text-lg leading-none">{icon}</span>
                        <span
                            className={cn(
                                "text-[9px] font-medium",
                                active ? "text-[#FD3E06]" : "text-[#64748B]"
                            )}
                        >
                            {label}
                        </span>
                    </a>
                );
            })}
        </nav>
    );
}
