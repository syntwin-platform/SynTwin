"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Factory,
  Bot,
  AlertTriangle,
  BarChart3,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Factory, label: "Factory View", href: "/dashboard" },
  { icon: Bot, label: "Robot Management", href: "/dashboard/robots" },
  { icon: AlertTriangle, label: "Alerts", href: "/dashboard/alerts" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-16 flex-col items-center border-r border-[#1E293B] bg-[#0F172A] py-4 lg:w-56 lg:items-stretch">
      {/* Logo */}
      <Link href="/dashboard" className="mb-8 flex items-center justify-center gap-2 px-4 transition-opacity hover:opacity-80">
        <Image src="/images/syntwin-logo.png" alt="SynTwin" width={36} height={36} className="shrink-0" />
        <span className="hidden text-sm font-bold tracking-wider text-[#FD3E06] lg:block">
          SynTwin
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                active
                  ? "bg-[#FD3E06]/10 text-[#FD3E06]"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-[#CBD5E1]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-[#FD3E06]" : "text-[#475569] group-hover:text-[#94A3B8]"
                )}
              />
              <span className="hidden lg:block">{item.label}</span>
              {active && (
                <div className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-[#FD3E06] lg:block" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="mt-auto border-t border-[#1E293B] px-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
          <span className="hidden text-xs text-[#94A3B8] lg:block">System Online</span>
        </div>
      </div>
    </aside>
  );
}
