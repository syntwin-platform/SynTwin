"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { CompanySwitcher } from "@/components/CompanySwitcher";
import { logoutUser } from "@/lib/api/auth";
import type { Session } from "@/lib/auth";

interface DashboardHeaderProps {
    session?: Session;
}

export function DashboardHeader({ session }: DashboardHeaderProps) {
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout(): Promise<void> {
        if (loggingOut) return;
        setLoggingOut(true);
        await logoutUser();
    }

    return (
        <header className="flex min-h-16 min-w-0 items-center border-b border-line bg-surface px-3 sm:px-5">
            <div className="min-w-0 flex-1">
                <CompanySwitcher />
            </div>
            {session && (
                <div className="ml-3 flex shrink-0 items-center gap-2 border-l border-line pl-3">
                    {session.isAdmin && (
                        <Link
                            href="/admin/dashboard"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand transition hover:bg-brand/10"
                        >
                            <ShieldCheck className="size-3.5" />
                            <span>Khu vực Admin</span>
                        </Link>
                    )}

                    <div className="hidden text-right md:block">
                        <p className="max-w-44 truncate text-xs font-semibold text-ink">
                            {session.name || session.email}
                        </p>
                        <p className="mt-0.5 font-telemetry text-[10px] uppercase tracking-[.12em] text-subtle">
                            {session.isAdmin ? "SuperAdmin" : `Gói ${session.subscriptionPlan}`}
                        </p>
                    </div>
                    <Link
                        href="/dashboard/user"
                        aria-label="Mở tài khoản"
                        className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-canvas text-steel hover:border-brand/40 hover:text-brand"
                    >
                        <UserRound className="size-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={loggingOut}
                        aria-label="Đăng xuất"
                        className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-surface text-subtle hover:border-danger/30 hover:text-danger disabled:cursor-wait disabled:opacity-50"
                    >
                        <LogOut className="size-4" />
                    </button>
                </div>
            )}
        </header>
    );
}
