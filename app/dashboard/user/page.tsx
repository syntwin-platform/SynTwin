"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getSession, clearSession, type Session } from "@/lib/auth";
import { initialRobots } from "@/lib/mock-data";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Factory, 
  Bot, 
  Activity, 
  Settings, 
  Bell, 
  Moon,
  Key,
  LogOut,
  CreditCard
} from "lucide-react";

export default function UserProfilePage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const s = getSession();
        if (!s) {
            router.replace("/login");
            return;
        }
        if (s.isAdmin) {
            router.replace("/admin/dashboard");
            return;
        }
        setSession(s);
    }, [router]);

    function handleLogout() {
        clearSession();
        router.push("/login");
    }

    if (!session) return null;

    // Derived mock stats
    const activeRobots = initialRobots.filter((r) => r.status === "running").length;
    const totalRobots = initialRobots.length;

    return (
        <div className="flex bg-[#F1F5F9] w-screen h-[100dvh] overflow-hidden">
            {/* ── DESKTOP: Sidebar (hidden on mobile) ── */}
            <div className="hidden sm:flex">
                <Sidebar />
            </div>

            {/* ── MAIN ── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} onLogout={handleLogout} />
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6">
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-[#0F172A]">User Profile</h1>
                        <p className="mt-1 text-sm text-[#64748B]">Manage your account details and system preferences</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* ── LEFT COLUMN (Profile Info) ── */}
                        <div className="space-y-6 md:col-span-1">
                            {/* Profile Card */}
                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                                <div className="flex flex-col items-center pb-6 border-b border-[#E2E8F0]">
                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#E2E8F0] text-3xl font-bold text-[#0F172A]">
                                        {session.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-lg font-bold text-[#0F172A]">{session.name}</h2>
                                    <p className="text-sm font-medium text-[#64748B] capitalize">{session.plan} Plan</p>
                                </div>
                                <div className="mt-6 space-y-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-[#94A3B8]" />
                                        <span className="text-[#334155]">{session.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="h-4 w-4 text-[#94A3B8]" />
                                        <span className="text-[#334155]">Role: Administrator</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>

                            {/* Subscription Card */}
                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-[#64748B]" />
                                    <h3 className="font-semibold text-[#0F172A]">Subscription</h3>
                                </div>
                                <p className="mb-1 text-sm text-[#64748B]">Current Plan</p>
                                <p className="mb-4 text-lg font-bold text-[#0F172A] capitalize">{session.plan}</p>
                                <button className="w-full rounded-lg bg-[#0F172A] py-2 text-sm font-medium text-white hover:bg-[#334155] transition-colors">
                                    Manage Billing
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN (Factory & Settings) ── */}
                        <div className="space-y-6 md:col-span-2">
                            {/* Virtual Factory Overview */}
                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Factory className="h-5 w-5 text-[#0F172A]" />
                                        <h3 className="font-semibold text-[#0F172A]">Virtual Factory Overview</h3>
                                    </div>
                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                        Online
                                    </span>
                                </div>
                                
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                        <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                                            <Bot className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Total Robots</span>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F172A]">{totalRobots}</p>
                                    </div>
                                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                        <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                                            <Activity className="h-4 w-4 text-green-500" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Active Status</span>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F172A]">{activeRobots} / {totalRobots}</p>
                                    </div>
                                    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                        <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                                            <Settings className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Environment</span>
                                        </div>
                                        <p className="text-2xl font-bold text-[#0F172A]">Production</p>
                                    </div>
                                </div>
                            </div>

                            {/* System Preferences */}
                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                                <h3 className="mb-4 font-semibold text-[#0F172A]">System Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F1F5F9]">
                                                <Bell className="h-4 w-4 text-[#64748B]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#0F172A]">Notifications</p>
                                                <p className="text-xs text-[#64748B]">Manage push and email alerts</p>
                                            </div>
                                        </div>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F1F5F9]">
                                                <Moon className="h-4 w-4 text-[#64748B]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#0F172A]">Appearance</p>
                                                <p className="text-xs text-[#64748B]">Toggle light or dark theme</p>
                                            </div>
                                        </div>
                                        <span className="rounded-md bg-[#E2E8F0] px-2 py-1 text-xs font-medium text-[#334155]">Light Match</span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F1F5F9]">
                                                <Key className="h-4 w-4 text-[#64748B]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-[#0F172A]">API Keys & Access</p>
                                                <p className="text-xs text-[#64748B]">Manage your developer tokens</p>
                                            </div>
                                        </div>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View Keys</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE: Bottom Navigation ── */}
            <MobileBottomNav />
        </div>
    );
}
