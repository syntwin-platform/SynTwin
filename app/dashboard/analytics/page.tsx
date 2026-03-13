"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getSession, clearSession, type Session } from "@/lib/auth";
import { initialRobots } from "@/lib/mock-data";
import { Activity, Clock, TrendingUp, Zap, BarChart3, Bot } from "lucide-react";
import { MobileBottomNav } from "@/components/MobileBottomNav";

/* ─── Mock analytics data per robot ──────────────────────────── */
interface RobotAnalytics {
    id: string;
    name: string;
    totalHours: number;
    uptimePercent: number;
    avgTemp: number;
    totalCycles: number;
    avgCycleTime: number; // seconds
    errorCount: number;
    peakLoad: number;
    hourlyActivity: number[]; // 24 values (0-100)
    weeklyUptime: number[]; // 7 values (hours per day)
}

const analyticsData: RobotAnalytics[] = initialRobots.map((r, i) => ({
    id: r.id,
    name: r.name,
    totalHours: [312, 275, 401][i],
    uptimePercent: [98.2, 94.7, 99.1][i],
    avgTemp: [44, 37, 52][i],
    totalCycles: [12847, 9312, 18405][i],
    avgCycleTime: [2.4, 0, 1.8][i],
    errorCount: [2, 5, 1][i],
    peakLoad: [92, 45, 97][i],
    hourlyActivity: Array.from({ length: 24 }, (_, h) => {
        // Night low, day high, lunch dip
        if (h < 6) return Math.floor(10 + Math.random() * 20);
        if (h < 8) return Math.floor(60 + Math.random() * 30);
        if (h >= 8 && h <= 11) return Math.floor(75 + Math.random() * 25);
        if (h === 12) return Math.floor(30 + Math.random() * 20);
        if (h >= 13 && h <= 17) return Math.floor(80 + Math.random() * 20);
        if (h >= 18 && h <= 22) return Math.floor(50 + Math.random() * 30);
        return Math.floor(10 + Math.random() * 15);
    }),
    weeklyUptime: [
        [7.8, 8.2, 7.5, 8.0, 8.1, 4.2, 0.5],
        [7.2, 7.8, 6.9, 7.5, 7.9, 3.8, 0.2],
        [8.0, 8.3, 8.1, 8.2, 8.0, 5.1, 1.0],
    ][i],
}));

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}h`);

const ROBOT_COLORS = ["#FD3E06", "#3B82F6", "#22C55E"];

function BarGroup({ values, max, color, labels }: { values: number[]; max: number; color: string; labels: string[] }) {
    return (
        <div className="flex h-40 items-end gap-1">
            {values.map((v, i) => (
                <div key={i} className="group relative flex flex-1 flex-col items-center">
                    <div
                        className="w-full rounded-t-sm transition-all duration-500"
                        style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.85 }}
                    />
                    <span className="mt-1.5 text-[8px] text-[#94A3B8]">{labels[i]}</span>
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-[#0F172A] px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap">
                        {v}{typeof v === "number" && v < 10 ? "h" : "%"}
                    </div>
                </div>
            ))}
        </div>
    );
}

function Sparkline({ data, color, height = 50 }: { data: number[]; color: string; height?: number }) {
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 200, h = height;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`).join(" ");
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline
                points={`0,${h} ${pts} ${w},${h}`}
                fill={color}
                opacity="0.12"
            />
        </svg>
    );
}

export default function AnalyticsPage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [selectedRobot, setSelectedRobot] = useState<string>("RA-001");

    useEffect(() => {
        const s = getSession();
        if (!s || s.plan === "unpaid") { router.replace("/login"); return; }
        setSession(s);
    }, [router]);

    function handleLogout() { clearSession(); router.push("/login"); }

    const robot = analyticsData.find((r) => r.id === selectedRobot)!;
    const robotIndex = analyticsData.findIndex((r) => r.id === selectedRobot);
    const color = ROBOT_COLORS[robotIndex] ?? "#FD3E06";

    if (!session) return null;

    return (
        <div className="flex bg-[#F1F5F9] w-screen h-[100dvh] overflow-hidden">
            {/* ── DESKTOP: Sidebar (hidden on mobile) ── */}
            <div className="hidden sm:flex">
                <Sidebar />
            </div>

            {/* ── MAIN ── */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} onLogout={handleLogout} />
                <div className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-6">

                    {/* Header */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-[#0F172A]">Analytics</h1>
                            <p className="mt-1 text-sm text-[#64748B]">Robot performance, uptime, and activity analysis</p>
                        </div>
                        {/* Robot selector */}
                        <div className="flex gap-2">
                            {analyticsData.map((r, i) => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedRobot(r.id)}
                                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
                                    style={{
                                        borderColor: selectedRobot === r.id ? ROBOT_COLORS[i] : "#E2E8F0",
                                        backgroundColor: selectedRobot === r.id ? `${ROBOT_COLORS[i]}10` : "white",
                                        color: selectedRobot === r.id ? ROBOT_COLORS[i] : "#64748B",
                                    }}
                                >
                                    <Bot className="h-3.5 w-3.5" />
                                    {r.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { label: "Total Operating Hours", value: `${robot.totalHours}h`, icon: Clock, sub: "Since deployment" },
                            { label: "Uptime", value: `${robot.uptimePercent}%`, icon: Activity, sub: "Last 30 days" },
                            { label: "Total Cycles", value: robot.totalCycles.toLocaleString(), icon: TrendingUp, sub: `Avg ${robot.avgCycleTime}s/cycle` },
                            { label: "Error Count", value: robot.errorCount, icon: Zap, sub: "Last 30 days" },
                        ].map(({ label, value, icon: Icon, sub }) => (
                            <div key={label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-medium uppercase tracking-widest text-[#64748B]">{label}</p>
                                    <Icon className="h-4 w-4" style={{ color }} />
                                </div>
                                <p className="mt-2 text-2xl font-bold text-[#0F172A]">{value}</p>
                                <p className="mt-1 text-[10px] text-[#94A3B8]">{sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Hourly Activity */}
                        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#0F172A]">Activity Frequency (24h)</h2>
                                    <p className="mt-0.5 text-[11px] text-[#94A3B8]">Load % by hour of day</p>
                                </div>
                                <BarChart3 className="h-4 w-4 text-[#94A3B8]" />
                            </div>
                            <Sparkline data={robot.hourlyActivity} color={color} height={80} />
                            <div className="mt-1 flex justify-between">
                                {[0, 6, 12, 18, 23].map((h) => (
                                    <span key={h} className="text-[9px] text-[#94A3B8]">{HOURS[h]}</span>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Uptime */}
                        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#0F172A]">Weekly Uptime (hours/day)</h2>
                                    <p className="mt-0.5 text-[11px] text-[#94A3B8]">Operating hours per day this week</p>
                                </div>
                                <Activity className="h-4 w-4 text-[#94A3B8]" />
                            </div>
                            <BarGroup values={robot.weeklyUptime} max={10} color={color} labels={DAYS} />
                        </div>

                        {/* All robots comparison */}
                        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm lg:col-span-2">
                            <div className="mb-5 flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-[#0F172A]">Fleet Comparison</h2>
                                <span className="text-[11px] text-[#94A3B8]">— All robots side by side</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {analyticsData.map((r, i) => (
                                    <div key={r.id}>
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ROBOT_COLORS[i] }} />
                                            <span className="font-mono text-xs font-semibold text-[#334155]">{r.id}</span>
                                            <span className="text-[10px] text-[#94A3B8]">{r.name}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                { label: "Uptime", value: r.uptimePercent, suffix: "%" },
                                                { label: "Avg Temp", value: r.avgTemp, suffix: "°C" },
                                                { label: "Peak Load", value: r.peakLoad, suffix: "%" },
                                            ].map(({ label, value, suffix }) => (
                                                <div key={label}>
                                                    <div className="mb-0.5 flex justify-between text-[10px]">
                                                        <span className="text-[#64748B]">{label}</span>
                                                        <span className="font-mono font-semibold text-[#0F172A]">{value}{suffix}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-[#F1F5F9]">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${Math.min(100, value)}%`, backgroundColor: ROBOT_COLORS[i] }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                                            <div className="rounded-lg bg-[#F8FAFC] p-2">
                                                <p className="font-mono text-sm font-bold text-[#0F172A]">{r.totalCycles.toLocaleString()}</p>
                                                <p className="text-[9px] text-[#94A3B8]">Total Cycles</p>
                                            </div>
                                            <div className="rounded-lg bg-[#F8FAFC] p-2">
                                                <p className="font-mono text-sm font-bold text-[#0F172A]">{r.errorCount}</p>
                                                <p className="text-[9px] text-[#94A3B8]">Errors</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
