"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  Building2
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin/dashboard" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Building2, label: "Companies", href: "/admin/companies" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-16 flex-col items-center border-r border-[#1E293B] bg-[#0F172A] py-4 lg:w-56 lg:items-stretch">
      {/* Logo */}
      <Link href="/admin/dashboard" className="mb-8 flex flex-col items-center justify-center gap-1 px-4 transition-opacity hover:opacity-80 lg:flex-row">
        <Image src="/images/syntwin-logo.png" alt="SynTwin" width={36} height={36} className="shrink-0" />
        <div className="hidden lg:flex lg:flex-col lg:items-start">
            <span className="text-sm font-bold tracking-wider text-[#FD3E06]">
              SynTwin
            </span>
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-widest flex items-center gap-1">
              <ShieldCheck size={10} className="text-[#FD3E06]"/> Admin
            </span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
           // simple active logic
          const active = pathname.startsWith(item.href);
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
          <span className="hidden text-xs text-[#94A3B8] lg:block">Platform Online</span>
        </div>
      </div>
    </aside>
  );
}
