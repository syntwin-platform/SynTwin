"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Search, Signal, Cpu, HardDrive, LogOut, Crown } from "lucide-react";
import type { Session } from "@/lib/auth";
import { PLANS } from "@/lib/auth";

interface DashboardHeaderProps {
  session?: Session;
  onLogout?: () => void;
}

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  basic: { label: "Pilot", color: "#3B82F6" },
  enterprise: { label: "Enterprise", color: "#FD3E06" },
  unpaid: { label: "No Plan", color: "#94A3B8" },
};

export function DashboardHeader({ session, onLogout }: DashboardHeaderProps) {
  const initials = session?.name
    ? session.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "OP";

  const planBadge = session ? PLAN_BADGE[session.plan] : null;

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-6">
      {/* Left */}
      <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
        <Image src="/images/syntwin-logo.png" alt="SynTwin" width={24} height={24} />
        <h1 className="text-sm font-semibold tracking-wide text-[#0F172A]">
          SynTwin Factory
        </h1>
        <span className="rounded-full border border-[#FD3E06]/30 bg-[#FD3E06]/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#FD3E06]">
          Live
        </span>
      </Link>

      {/* Center — system metrics */}
      <div className="hidden items-center gap-6 md:flex">
        <Metric icon={Cpu} label="CPU" value="34%" />
        <Metric icon={HardDrive} label="Memory" value="6.2 GB" />
        <Metric icon={Signal} label="Latency" value="12 ms" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155]">
          <Search className="h-4 w-4" />
        </button>
        <button className="relative rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
        </button>

        {/* Session info */}
        {session && (
          <div className="ml-1 flex items-center gap-2 border-l border-[#E2E8F0] pl-3">
            {planBadge && (
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: planBadge.color,
                  backgroundColor: `${planBadge.color}15`,
                }}
              >
                <Crown className="h-2.5 w-2.5" />
                {planBadge.label}
              </span>
            )}
            <Link href={session.isAdmin ? "/admin/dashboard" : "/dashboard/user"}>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80 cursor-pointer"
                style={{ backgroundColor: planBadge?.color ?? "#FD3E06" }}
                title="Go to Profile"
              >
                {initials}
              </div>
            </Link>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Đăng xuất"
                className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#EF4444]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Fallback if no session */}
        {!session && (
          <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FD3E06] text-xs font-bold text-white">
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 text-[#94A3B8]" />
      <span className="text-[#64748B]">{label}</span>
      <span className="font-mono text-[#0F172A]">{value}</span>
    </div>
  );
}
