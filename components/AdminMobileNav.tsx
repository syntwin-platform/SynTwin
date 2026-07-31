"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/components/navigation/admin-nav";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 grid h-16 grid-cols-3 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden" aria-label="Điều hướng quản trị di động">
            {adminNavItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                    <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center justify-center gap-1 text-[10px] font-medium", active ? "text-brand" : "text-subtle")}>
                        <item.icon className="size-[18px]" />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
