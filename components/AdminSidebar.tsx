"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { adminNavItems } from "@/components/navigation/admin-nav";
import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
    const pathname = usePathname();
    return (
        <aside className="flex h-full w-16 flex-col border-r border-line bg-surface py-4 lg:w-60">
            <BrandMark href="/admin/dashboard" compact className="mx-auto mb-7 lg:hidden" />
            <BrandMark href="/admin/dashboard" className="mb-1 hidden px-4 lg:inline-flex" />
            <div className="mx-4 mb-7 hidden items-center gap-2 border-l-2 border-brand bg-brand-soft px-3 py-2 lg:flex">
                <ShieldCheck className="size-4 text-brand" />
                <span className="font-telemetry text-[10px] font-semibold uppercase tracking-[.14em] text-brand">Quản trị nền tảng</span>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-2" aria-label="Điều hướng quản trị">
                {adminNavItems.map((item) => {
                    const active = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} title={item.label} aria-current={active ? "page" : undefined} className={cn("relative flex min-h-11 items-center justify-center gap-3 rounded-md px-3 text-sm font-medium lg:justify-start", active ? "bg-brand-soft text-brand" : "text-steel hover:bg-canvas hover:text-ink")}>
                            {active && <span className="absolute inset-y-2 left-0 w-0.5 bg-brand" />}
                            <item.icon className="size-[18px]" />
                            <span className="hidden lg:block">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <p className="mx-4 hidden border-t border-line pt-4 text-xs leading-5 text-subtle lg:block">
                Dữ liệu tổng hợp từ API quản trị người dùng và công ty.
            </p>
        </aside>
    );
}
