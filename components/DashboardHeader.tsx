"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    Cpu,
    Crown,
    HardDrive,
    LogOut,
    Search,
    Signal,
} from "lucide-react";
import { CompanySwitcher } from "@/components/CompanySwitcher";
import { logoutUser } from "@/lib/api/auth";
import type { Session } from "@/lib/auth";

interface DashboardHeaderProps {
    session?: Session;
}

const PLAN_BADGE: Record<
    string,
    { label: string; color: string }
> = {
    basic: {
        label: "Pilot",
        color: "#3B82F6",
    },
    enterprise: {
        label: "Enterprise",
        color: "#FD3E06",
    },
    unpaid: {
        label: "No Plan",
        color: "#94A3B8",
    },
};

export function DashboardHeader({
    session,
}: DashboardHeaderProps) {
    const router = useRouter();
    const [loggingOut, setLoggingOut] =
        useState(false);

    const initials = session?.name
        ? session.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "OP";

    const planBadge = session
        ? PLAN_BADGE[session.plan]
        : null;

    async function handleLogout(): Promise<void> {
        if (loggingOut) return;

        setLoggingOut(true);
        await logoutUser();
        router.replace("/login");
        router.refresh();
    }

    return (
        <header className="flex h-14 min-w-0 items-center border-b border-[#E2E8F0] bg-white px-3 sm:px-4 lg:px-6">
            <Link
                href="/dashboard"
                className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
            >
                <Image
                    src="/images/syntwin-logo.png"
                    alt="SynTwin"
                    width={24}
                    height={24}
                />

                <h1 className="hidden text-sm font-semibold tracking-wide text-[#0F172A] lg:block">
                    SynTwin Factory
                </h1>

                <span className="hidden rounded-full border border-[#FD3E06]/30 bg-[#FD3E06]/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#FD3E06] xl:inline-flex">
                    Live
                </span>
            </Link>

            <div className="mx-2 flex min-w-0 flex-1 justify-center sm:mx-4">
                <CompanySwitcher />
            </div>

            <div className="hidden shrink-0 items-center gap-5 2xl:flex">
                <Metric
                    icon={Cpu}
                    label="CPU"
                    value="34%"
                />
                <Metric
                    icon={HardDrive}
                    label="Memory"
                    value="6.2 GB"
                />
                <Metric
                    icon={Signal}
                    label="Latency"
                    value="12 ms"
                />
            </div>

            <div className="ml-2 flex shrink-0 items-center gap-1 sm:gap-2 2xl:ml-6">
                <button
                    type="button"
                    aria-label="Search"
                    className="hidden rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155] md:inline-flex"
                >
                    <Search className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative hidden rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155] sm:inline-flex"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
                </button>

                {session ? (
                    <div className="flex items-center gap-1 border-l border-[#E2E8F0] pl-2 sm:gap-2 sm:pl-3">
                        {planBadge && (
                            <span
                                className="hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold xl:flex"
                                style={{
                                    color:
                                        planBadge.color,
                                    backgroundColor: `${planBadge.color}15`,
                                }}
                            >
                                <Crown className="h-2.5 w-2.5" />
                                {planBadge.label}
                            </span>
                        )}

                        <Link
                            href={
                                session.isAdmin
                                    ? "/admin/dashboard"
                                    : "/dashboard/user"
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
                            style={{
                                backgroundColor:
                                    planBadge?.color ??
                                    "#FD3E06",
                            }}
                            title="Go to profile"
                        >
                            {initials}
                        </Link>

                        <button
                            type="button"
                            onClick={() =>
                                void handleLogout()
                            }
                            disabled={loggingOut}
                            title="Logout"
                            aria-label="Logout"
                            className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#EF4444] disabled:cursor-wait disabled:opacity-50"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FD3E06] text-xs font-bold text-white">
                        OP
                    </div>
                )}
            </div>
        </header>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                {label}
            </span>
            <span className="text-xs font-semibold text-[#334155]">
                {value}
            </span>
        </div>
    );
}