"use client";

import React from "react";
import { LogOut, Search, ShieldAlert } from "lucide-react";
import type { Session } from "@/lib/auth";

interface AdminHeaderProps {
  session: Session;
  onLogout: () => void;
}

export function AdminHeader({ session, onLogout }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-bold text-[#0F172A] hidden sm:block">Admin Console</h1>
        <div className="relative max-w-sm hidden md:flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search users, factories..." 
              className="pl-9 pr-4 py-1.5 text-sm bg-[#F1F5F9] border-none rounded-md w-64 focus:ring-1 focus:ring-[#FD3E06] outline-none transition-all placeholder:text-[#94A3B8] text-[#0F172A]"
            />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-[#0F172A]">
            {session.name}
          </span>
          <span className="text-xs text-[#FD3E06] font-medium flex items-center gap-1 uppercase tracking-wider">
            <ShieldAlert size={10} /> Admin
          </span>
        </div>
        <div className="h-8 w-px bg-[#E2E8F0]" />
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#FD3E06]"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
