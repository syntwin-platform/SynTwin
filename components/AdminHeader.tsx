"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Search, ShieldAlert } from "lucide-react";
import type { Session } from "@/lib/auth";
import { logoutUser } from "@/lib/api/auth";

interface AdminHeaderProps {
  session: Session;
}

export function AdminHeader({ session }: AdminHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    if (loggingOut) return;

    setLoggingOut(true);
    await logoutUser();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        <h1 className="hidden text-lg font-bold text-[#0F172A] sm:block">
          Admin Console
        </h1>
        <div className="relative hidden max-w-sm items-center md:flex">
          <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search users, factories..."
            className="w-64 rounded-md border-none bg-[#F1F5F9] py-1.5 pl-9 pr-4 text-sm text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-1 focus:ring-[#FD3E06]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-[#0F172A]">
            {session.name}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-[#FD3E06]">
            <ShieldAlert size={10} /> Admin
          </span>
        </div>
        <div className="h-8 w-px bg-[#E2E8F0]" />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#FD3E06] disabled:cursor-wait disabled:opacity-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
