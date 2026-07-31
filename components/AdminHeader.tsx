"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { logoutUser } from "@/lib/api/auth";
import type { Session } from "@/lib/auth";

export function AdminHeader({ session }: { session: Session }) {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        await logoutUser();
        router.replace("/login");
        router.refresh();
    }

    return (
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-surface px-4 sm:px-5">
            <div className="flex items-center gap-2 text-steel">
                <ShieldCheck className="size-4 text-brand" />
                <span className="text-sm font-semibold text-ink">Bảng quản trị</span>
                <span className="hidden font-telemetry text-[10px] uppercase tracking-[.12em] text-subtle sm:inline">SuperAdmin</span>
            </div>
            <div className="flex items-center gap-3 border-l border-line pl-3">
                <div className="hidden text-right sm:block">
                    <p className="max-w-48 truncate text-xs font-semibold text-ink">{session.name || session.email}</p>
                    <p className="mt-0.5 text-[10px] text-subtle">{session.email}</p>
                </div>
                <button type="button" onClick={() => void handleLogout()} disabled={loggingOut} aria-label="Đăng xuất" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold text-steel hover:border-danger/30 hover:text-danger disabled:opacity-50">
                    <LogOut className="size-4" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                </button>
            </div>
        </header>
    );
}
