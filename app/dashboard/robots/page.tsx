"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getSession, PLANS, clearSession, type Session } from "@/lib/auth";
import { initialRobots, type RobotData } from "@/lib/mock-data";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
    Thermometer, Gauge, AlertTriangle, CheckCircle2, XCircle,
    Clock, Wrench, ShieldAlert, ShieldCheck, Activity,
    ChevronUp, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Extended robot data with extra fields ─────────────────────── */
interface ExtendedRobot extends RobotData {
    task: string;
    criticalityLevel: "low" | "medium" | "high" | "critical";
    needsMaintenance: boolean;
    safetyLevel: "safe" | "caution" | "danger";
    operatingHours: number;
    lastMaintenance: string;
}

const TASKS = [
    "Welding — Door Panel", "Pick & Place — Line A", "Assembly — Frame B",
    "Painting — Hood", "Quality Check — Station 3", "Idle",
];

const extendRobots = (robots: RobotData[]): ExtendedRobot[] =>
    robots.map((r, i) => ({
        ...r,
        task: r.status === "idle" ? "Idle" : TASKS[i % (TASKS.length - 1)],
        criticalityLevel:
            r.temperature > 70 ? "critical" :
                r.temperature > 55 ? "high" :
                    r.temperature > 42 ? "medium" : "low",
        needsMaintenance: r.temperature > 50 || r.load > 85,
        safetyLevel:
            r.temperature > 70 ? "danger" :
                r.temperature > 55 ? "caution" : "safe",
        operatingHours: Math.floor(200 + i * 87 + r.load * 3),
        lastMaintenance: `2026-0${(i % 3) + 1}-${String((i * 7 + 5) % 28 + 1).padStart(2, "0")}`,
    }));

const CRITICALITY_CONFIG = {
    low: { label: "Low", color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    medium: { label: "Medium", color: "text-[#FACC15]", bg: "bg-[#FACC15]/10" },
    high: { label: "High", color: "text-[#F97316]", bg: "bg-[#F97316]/10" },
    critical: { label: "Critical", color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
};

const STATUS_CONFIG = {
    running: { label: "Running", color: "text-[#22C55E]", dot: "#22C55E" },
    idle: { label: "Idle", color: "text-[#FACC15]", dot: "#FACC15" },
    error: { label: "Error", color: "text-[#EF4444]", dot: "#EF4444" },
};

const SAFETY_CONFIG = {
    safe: { label: "Safe", icon: ShieldCheck, color: "text-[#22C55E]" },
    caution: { label: "Caution", icon: ShieldAlert, color: "text-[#FACC15]" },
    danger: { label: "Danger", icon: ShieldAlert, color: "text-[#EF4444]" },
};

export default function RobotManagementPage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [robots, setRobots] = useState<ExtendedRobot[]>([]);
    const [sort, setSort] = useState<{ key: keyof ExtendedRobot; dir: "asc" | "desc" }>({
        key: "id", dir: "asc"
    });

    useEffect(() => {
        const s = getSession();
        if (!s || s.plan === "unpaid") { router.replace("/login"); return; }
        setSession(s);
        setRobots(extendRobots(initialRobots));

        // Live update every 4s
        const interval = setInterval(() => {
            setRobots((prev) =>
                prev.map((r) => {
                    const temp = Math.floor(r.temperature + (Math.random() - 0.5) * 4);
                    const load = Math.min(100, Math.max(0, r.load + (Math.random() - 0.5) * 10));
                    return {
                        ...r,
                        temperature: temp,
                        load,
                        criticalityLevel: temp > 70 ? "critical" : temp > 55 ? "high" : temp > 42 ? "medium" : "low",
                        needsMaintenance: temp > 50 || load > 85,
                        safetyLevel: temp > 70 ? "danger" : temp > 55 ? "caution" : "safe",
                    };
                })
            );
        }, 4000);
        return () => clearInterval(interval);
    }, [router]);

    function handleLogout() { clearSession(); router.push("/login"); }

    function toggleSort(key: keyof ExtendedRobot) {
        setSort((prev) => prev.key === key && prev.dir === "asc"
            ? { key, dir: "desc" } : { key, dir: "asc" });
    }

    const sorted = [...robots].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        const cmp = typeof av === "number" && typeof bv === "number"
            ? av - bv : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
    });

    // Summary stats
    const active = robots.filter((r) => r.status === "running").length;
    const idle = robots.filter((r) => r.status === "idle").length;
    const error = robots.filter((r) => r.status === "error").length;
    const maintenance = robots.filter((r) => r.needsMaintenance).length;

    if (!session) return null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9]">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} onLogout={handleLogout} />
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Page title */}
                    <div className="mb-6">
                        <h1 className="text-xl font-bold text-[#0F172A]">Robot Management</h1>
                        <p className="mt-1 text-sm text-[#64748B]">Realtime status of all robot arms in the factory</p>
                    </div>

                    {/* Summary cards */}
                    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { label: "Active", value: active, icon: Activity, color: "#22C55E", bg: "#22C55E" },
                            { label: "Idle", value: idle, icon: Clock, color: "#FACC15", bg: "#FACC15" },
                            { label: "Error", value: error, icon: XCircle, color: "#EF4444", bg: "#EF4444" },
                            { label: "Needs Maintenance", value: maintenance, icon: Wrench, color: "#F97316", bg: "#F97316" },
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-widest text-[#64748B]">{label}</p>
                                        <p className="mt-1 text-3xl font-bold" style={{ color }}>{value}</p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${bg}15` }}>
                                        <Icon className="h-5 w-5" style={{ color }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Robot table */}
                    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-[#0F172A]">Robot Fleet</h2>
                            <span className="text-xs text-[#94A3B8]">Live — updates every 4s</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                                        {[
                                            { key: "id", label: "Robot ID" },
                                            { key: "name", label: "Name" },
                                            { key: "status", label: "Status" },
                                            { key: "task", label: "Current Task" },
                                            { key: "criticalityLevel", label: "Criticality" },
                                            { key: "needsMaintenance", label: "Maintenance" },
                                            { key: "temperature", label: "Temp (°C)" },
                                            { key: "load", label: "Load %" },
                                            { key: "safetyLevel", label: "Safety" },
                                            { key: "operatingHours", label: "Op. Hours" },
                                        ].map(({ key, label }) => (
                                            <th
                                                key={key}
                                                onClick={() => toggleSort(key as keyof ExtendedRobot)}
                                                className="cursor-pointer whitespace-nowrap px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#64748B] hover:text-[#0F172A]"
                                            >
                                                <span className="flex items-center gap-1">
                                                    {label}
                                                    {sort.key === key
                                                        ? sort.dir === "asc"
                                                            ? <ChevronUp className="h-3 w-3 text-[#FD3E06]" />
                                                            : <ChevronDown className="h-3 w-3 text-[#FD3E06]" />
                                                        : <ChevronUp className="h-3 w-3 opacity-20" />
                                                    }
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map((robot, i) => {
                                        const sc = STATUS_CONFIG[robot.status];
                                        const cc = CRITICALITY_CONFIG[robot.criticalityLevel];
                                        const SafeIcon = SAFETY_CONFIG[robot.safetyLevel].icon;
                                        return (
                                            <tr
                                                key={robot.id}
                                                className={cn(
                                                    "border-b border-[#F1F5F9] transition-colors hover:bg-[#FD3E06]/3",
                                                    i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
                                                )}
                                            >
                                                {/* Robot ID */}
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs font-semibold text-[#0F172A]">{robot.id}</span>
                                                </td>
                                                {/* Name */}
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-[#334155]">{robot.name}</span>
                                                </td>
                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sc.dot }} />
                                                        <span className={cn("text-xs font-medium", sc.color)}>{sc.label}</span>
                                                    </span>
                                                </td>
                                                {/* Task */}
                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-[#64748B]">{robot.task}</span>
                                                </td>
                                                {/* Criticality */}
                                                <td className="px-4 py-3">
                                                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cc.color, cc.bg)}>
                                                        {cc.label}
                                                    </span>
                                                </td>
                                                {/* Maintenance */}
                                                <td className="px-4 py-3">
                                                    {robot.needsMaintenance ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#F97316]">
                                                            <Wrench className="h-3 w-3" /> Required
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] text-[#22C55E]">
                                                            <CheckCircle2 className="h-3 w-3" /> OK
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Temperature */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Thermometer className={cn("h-3.5 w-3.5", robot.temperature > 60 ? "text-[#EF4444]" : "text-[#94A3B8]")} />
                                                        <span className={cn("font-mono text-xs font-medium",
                                                            robot.temperature > 60 ? "text-[#EF4444]" : robot.temperature > 45 ? "text-[#FACC15]" : "text-[#0F172A]"
                                                        )}>
                                                            {robot.temperature}°C
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Load */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-16 rounded-full bg-[#F1F5F9]">
                                                            <div
                                                                className="h-full rounded-full transition-all"
                                                                style={{
                                                                    width: `${robot.load}%`,
                                                                    backgroundColor: robot.load > 90 ? "#EF4444" : robot.load > 70 ? "#FACC15" : "#22C55E",
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="font-mono text-xs text-[#334155]">{Math.round(robot.load)}%</span>
                                                    </div>
                                                </td>
                                                {/* Safety */}
                                                <td className="px-4 py-3">
                                                    <span className={cn("flex items-center gap-1 text-[10px] font-semibold", SAFETY_CONFIG[robot.safetyLevel].color)}>
                                                        <SafeIcon className="h-3.5 w-3.5" />
                                                        {SAFETY_CONFIG[robot.safetyLevel].label}
                                                    </span>
                                                </td>
                                                {/* Operating Hours */}
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs text-[#64748B]">{robot.operatingHours}h</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
