"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { getSession, clearSession, type Session } from "@/lib/auth";
import { AlertTriangle, Info, XCircle, ChevronRight, X, Clock, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "@/components/MobileBottomNav";

/* ─── Log data ─────────────────────────────────────────────────── */
interface LogEntry {
    id: string;
    robotId: string;
    robotName: string;
    timestamp: string;
    type: "info" | "warning" | "error";
    message: string;
    details?: string;
    errorCode?: string;
    affectedJoint?: string;
    resolution?: string;
}

const ERROR_IMAGES = [
    {
        errorCode: "E-OVERHEAT",
        label: "Overheating — Joint 3",
        svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" fill="#0B0F17"/>
      <!-- Robot arm base -->
      <rect x="85" y="130" width="30" height="15" rx="3" fill="#1E293B"/>
      <!-- Link 1 -->
      <rect x="93" y="95" width="14" height="38" rx="4" fill="#334155"/>
      <!-- Joint 1 -->
      <circle cx="100" cy="95" r="8" fill="#475569"/>
      <!-- Link 2 -->
      <rect x="93" y="60" width="14" height="38" rx="4" fill="#334155"/>
      <!-- Joint 2 overheating (highlighted red) -->
      <circle cx="100" cy="60" r="9" fill="#EF4444"/>
      <circle cx="100" cy="60" r="6" fill="#FCA5A5"/>
      <!-- Heat waves -->
      <path d="M88 48 Q84 44 88 40 Q92 36 88 32" stroke="#EF4444" stroke-width="1.5" fill="none" opacity="0.8"/>
      <path d="M100 46 Q96 42 100 38 Q104 34 100 30" stroke="#FCA5A5" stroke-width="1.5" fill="none" opacity="0.9"/>
      <path d="M112 48 Q116 44 112 40 Q108 36 112 32" stroke="#EF4444" stroke-width="1.5" fill="none" opacity="0.8"/>
      <!-- Link 3 -->
      <rect x="93" y="28" width="14" height="35" rx="4" fill="#334155"/>
      <!-- End effector -->
      <polygon points="100,18 94,28 106,28" fill="#64748B"/>
      <!-- Warning label -->
      <rect x="115" y="52" width="65" height="18" rx="3" fill="#EF4444" opacity="0.9"/>
      <text x="147" y="64" text-anchor="middle" fill="white" font-size="9" font-family="monospace">OVERHEAT 87°C</text>
      <!-- Temperature bar -->
      <rect x="18" y="30" width="10" height="100" rx="5" fill="#1E293B"/>
      <rect x="18" y="63" width="10" height="67" rx="5" fill="#EF4444" opacity="0.8"/>
      <text x="23" y="25" text-anchor="middle" fill="#94A3B8" font-size="8" font-family="monospace">°C</text>
      <text x="23" y="142" text-anchor="middle" fill="#94A3B8" font-size="7" font-family="monospace">0</text>
      <text x="23" y="34" text-anchor="middle" fill="#EF4444" font-size="7" font-family="monospace">100</text>
    </svg>`,
    },
    {
        errorCode: "E-TIMEOUT",
        label: "Communication Timeout",
        svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" fill="#0B0F17"/>
      <!-- Robot -->
      <rect x="75" y="125" width="50" height="15" rx="3" fill="#1E293B"/>
      <rect x="88" y="95" width="24" height="32" rx="4" fill="#334155"/>
      <circle cx="100" cy="95" r="9" fill="#475569"/>
      <rect x="88" y="60" width="24" height="37" rx="4" fill="#334155"/>
      <circle cx="100" cy="60" r="9" fill="#475569"/>
      <rect x="88" y="28" width="24" height="34" rx="4" fill="#334155"/>
      <polygon points="100,16 92,28 108,28" fill="#64748B"/>
      <!-- WiFi symbol broken -->
      <circle cx="155" cy="45" r="22" fill="#1E293B" opacity="0.9"/>
      <path d="M145 52 Q155 42 165 52" stroke="#EF4444" stroke-width="2" fill="none"/>
      <path d="M141 57 Q155 43 169 57" stroke="#EF4444" stroke-width="2" fill="none" opacity="0.5"/>
      <circle cx="155" cy="58" r="3" fill="#EF4444"/>
      <!-- X through wifi -->
      <line x1="148" y1="38" x2="162" y2="52" stroke="#EF4444" stroke-width="1.5" opacity="0.7"/>
      <!-- Communication lines (dotted, red) -->
      <line x1="100" y1="80" x2="148" y2="55" stroke="#EF4444" stroke-width="1" stroke-dasharray="3,3"/>
      <!-- Error badge -->
      <rect x="10" y="55" width="70" height="18" rx="3" fill="#1E293B" stroke="#EF4444" stroke-width="1"/>
      <text x="45" y="67" text-anchor="middle" fill="#EF4444" font-size="9" font-family="monospace">TIMEOUT: 5000ms</text>
      <text x="45" y="85" text-anchor="middle" fill="#94A3B8" font-size="8" font-family="monospace">Node: CTRL-02</text>
    </svg>`,
    },
    {
        errorCode: "E-OVERLOAD",
        label: "Joint Overload — Axis 4",
        svg: `<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="160" fill="#0B0F17"/>
      <!-- Robot arm with load -->
      <rect x="82" y="128" width="36" height="14" rx="3" fill="#1E293B"/>
      <rect x="91" y="100" width="18" height="30" rx="4" fill="#334155"/>
      <circle cx="100" cy="100" r="8" fill="#475569"/>
      <!-- Angled arm 2 -->
      <rect x="91" y="70" width="18" height="32" rx="4" fill="#334155" transform="rotate(-20, 100, 86)"/>
      <!-- Overloaded joint (pulsing orange) -->
      <circle cx="114" cy="70" r="10" fill="#F97316"/>
      <circle cx="114" cy="70" r="6" fill="#FED7AA"/>
      <!-- Stress arrows -->
      <line x1="114" y1="58" x2="114" y2="48" stroke="#F97316" stroke-width="2" marker-end="url(#ar)"/>
      <line x1="126" y1="70" x2="136" y2="70" stroke="#F97316" stroke-width="2"/>
      <!-- Weight/load block -->
      <rect x="116" y="48" width="60" height="30" rx="4" fill="#1E293B" stroke="#F97316" stroke-width="1.5"/>
      <text x="146" y="60" text-anchor="middle" fill="#F97316" font-size="9" font-family="monospace">LOAD: 98%</text>
      <text x="146" y="72" text-anchor="middle" fill="#94A3B8" font-size="8" font-family="monospace">MAX: 85%</text>
      <!-- Crack line on joint -->
      <path d="M108 65 L112 74 L116 68" stroke="#EF4444" stroke-width="1.5" fill="none"/>
      <!-- Warning -->
      <rect x="10" y="110" width="75" height="28" rx="4" fill="#F97316" opacity="0.9"/>
      <text x="47" y="122" text-anchor="middle" fill="white" font-size="8" font-family="monospace">AXIS 4 OVERLOAD</text>
      <text x="47" y="133" text-anchor="middle" fill="white" font-size="8" font-family="monospace">STOP IMMEDIATE</text>
    </svg>`,
    },
];

const ROBOT_LOGS: LogEntry[] = [
    // RA-001 (6-axis) — 5 normal + 1 error
    { id: "l1", robotId: "RA-001", robotName: "Robot Arm Alpha", timestamp: "21:14:53", type: "info", message: "System startup — all joints initialized", details: "6-axis arm initialized successfully. Firmware v3.2.1." },
    { id: "l2", robotId: "RA-001", robotName: "Robot Arm Alpha", timestamp: "21:15:01", type: "info", message: "Production cycle started — Welding Door Panel", details: "Job ID: WLD-4472. Estimated cycle time: 2.4s." },
    { id: "l3", robotId: "RA-001", robotName: "Robot Arm Alpha", timestamp: "21:15:44", type: "info", message: "Joint 3 temperature nominal — 42°C", details: "Operating within normal range (max 80°C)." },
    { id: "l4", robotId: "RA-001", robotName: "Robot Arm Alpha", timestamp: "21:16:12", type: "warning", message: "Load approaching threshold — 82%", details: "Load is within warning zone. Reducing speed by 5%." },
    { id: "l5", robotId: "RA-001", robotName: "Robot Arm Alpha", timestamp: "21:16:50", type: "info", message: "Cycle completed successfully — 127 cycles", details: "Total uptime: 312h. Last maintenance: 2026-01-12." },
    { id: "l6", robotId: "RA-001", robotName: "Robot Arm Alpha", timestamp: "21:17:02", type: "error", message: "Joint 3 overheating — temperature critical: 87°C", details: "Joint 3 temperature exceeded critical threshold of 80°C. Emergency stop triggered. Robot halted.", errorCode: "E-OVERHEAT", affectedJoint: "Joint 3 (Axis 3)", resolution: "Allow cooling for 10 minutes. Check lubrication. Inspect cooling fan." },
    // RA-002
    { id: "l7", robotId: "RA-002", robotName: "Robot Arm Beta", timestamp: "21:10:05", type: "info", message: "Entering idle state — queue empty", details: "No pending jobs. Standing by." },
    { id: "l8", robotId: "RA-002", robotName: "Robot Arm Beta", timestamp: "21:12:30", type: "error", message: "Communication timeout — node CTRL-02", details: "No response from controller node CTRL-02 after 5000ms. Check network connection.", errorCode: "E-TIMEOUT", affectedJoint: "Controller Node 02", resolution: "Check Ethernet cable. Restart CTRL-02. Verify IP config." },
    // RA-003
    { id: "l9", robotId: "RA-003", robotName: "Robot Arm Gamma", timestamp: "21:08:44", type: "info", message: "Production cycle started — Assembly Frame B", details: "Job ID: ASM-0921. Axis 4 primary." },
    { id: "l10", robotId: "RA-003", robotName: "Robot Arm Gamma", timestamp: "21:09:30", type: "error", message: "Axis 4 overload — 98% load, emergency stop", details: "Axis 4 exceeded maximum load (85%). Emergency stop triggered. Possible obstruction on line.", errorCode: "E-OVERLOAD", affectedJoint: "Axis 4", resolution: "Clear obstruction. Reduce payload. Recalibrate Axis 4." },
];

const TYPE_CONFIG = {
    info: { icon: Info, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/30", label: "Info" },
    warning: { icon: AlertTriangle, color: "text-[#FACC15]", bg: "bg-[#FACC15]/10", border: "border-[#FACC15]/30", label: "Warning" },
    error: { icon: XCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/30", label: "Error" },
};

export default function AlertsPage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [selected, setSelected] = useState<LogEntry | null>(null);
    const [filter, setFilter] = useState<"all" | "error" | "warning">("all");

    useEffect(() => {
        const s = getSession();
        if (!s || s.plan === "unpaid") { router.replace("/login"); return; }
        setSession(s);
    }, [router]);

    function handleLogout() { clearSession(); router.push("/login"); }

    const filtered = ROBOT_LOGS.filter(
        (l) => filter === "all" || l.type === filter
    );

    const errorImg = selected?.errorCode
        ? ERROR_IMAGES.find((e) => e.errorCode === selected.errorCode)
        : null;

    if (!session) return null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9]">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} onLogout={handleLogout} />
                <div className="flex flex-1 overflow-hidden">

                    {/* Log list */}
                    <div className={cn("flex flex-col overflow-hidden transition-all", selected ? "w-[420px] shrink-0" : "flex-1")}>
                        {/* Header */}
                        <div className="border-b border-[#E2E8F0] bg-white px-5 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-base font-bold text-[#0F172A]">Alerts & Event Log</h1>
                                    <p className="mt-0.5 text-xs text-[#64748B]">All robot error and event records</p>
                                </div>
                                <div className="flex gap-1.5">
                                    {(["all", "error", "warning"] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={cn(
                                                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                                                filter === f
                                                    ? "bg-[#FD3E06] text-white"
                                                    : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                                            )}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Entries */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Group by robot */}
                            {["RA-001", "RA-002", "RA-003"].map((robotId) => {
                                const entries = filtered.filter((l) => l.robotId === robotId);
                                if (entries.length === 0) return null;
                                return (
                                    <div key={robotId}>
                                        <div className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2 flex items-center gap-2">
                                            <Bot className="h-3.5 w-3.5 text-[#94A3B8]" />
                                            <span className="font-mono text-[11px] font-semibold text-[#334155]">{robotId}</span>
                                            <span className="text-[10px] text-[#94A3B8]">— {entries[0].robotName}</span>
                                            <span className="ml-auto rounded-full bg-[#EF4444]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#EF4444]">
                                                {entries.filter((e) => e.type === "error").length} error{entries.filter((e) => e.type === "error").length !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        {entries.map((log) => {
                                            const tc = TYPE_CONFIG[log.type];
                                            const Icon = tc.icon;
                                            const isSelected = selected?.id === log.id;
                                            return (
                                                <button
                                                    key={log.id}
                                                    onClick={() => setSelected(isSelected ? null : log)}
                                                    className={cn(
                                                        "w-full border-b border-[#F1F5F9] px-5 py-3 text-left transition-all hover:bg-[#FD3E06]/3",
                                                        isSelected ? "bg-[#FD3E06]/5 border-l-2 border-l-[#FD3E06]" : ""
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", tc.bg)}>
                                                            <Icon className={cn("h-3.5 w-3.5", tc.color)} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("text-[10px] font-bold uppercase tracking-wider", tc.color)}>{tc.label}</span>
                                                                {log.errorCode && (
                                                                    <span className="rounded bg-[#EF4444]/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#EF4444]">{log.errorCode}</span>
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 text-xs font-medium text-[#0F172A] leading-snug">{log.message}</p>
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-1 text-[10px] text-[#94A3B8]">
                                                            <Clock className="h-3 w-3" />
                                                            {log.timestamp}
                                                            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isSelected ? "rotate-90 text-[#FD3E06]" : "")} />
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detail panel */}
                    {selected && (() => {
                        const tc = TYPE_CONFIG[selected.type];
                        const Icon = tc.icon;
                        return (
                            <div className="flex flex-1 flex-col overflow-hidden border-l border-[#E2E8F0] bg-white">
                                {/* Detail header */}
                                <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", tc.bg)}>
                                                <Icon className={cn("h-4 w-4", tc.color)} />
                                            </div>
                                            <span className={cn("text-xs font-bold uppercase tracking-wider", tc.color)}>{tc.label}</span>
                                            {selected.errorCode && (
                                                <span className="rounded bg-[#EF4444]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#EF4444]">{selected.errorCode}</span>
                                            )}
                                        </div>
                                        <h2 className="mt-2 text-sm font-bold text-[#0F172A] leading-snug">{selected.message}</h2>
                                        <p className="mt-1 text-[11px] text-[#94A3B8]">{selected.robotId} — {selected.robotName} — {selected.timestamp}</p>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#334155]">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                                    {/* Error image simulation */}
                                    {errorImg && (
                                        <div>
                                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
                                                Fault Simulation — {errorImg.label}
                                            </p>
                                            <div
                                                className="flex items-center justify-center rounded-xl border border-[#1E293B] overflow-hidden"
                                                style={{ height: 200 }}
                                                dangerouslySetInnerHTML={{ __html: errorImg.svg }}
                                            />
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className={cn("rounded-xl border p-4", tc.border, tc.bg)}>
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-2">Event Details</p>
                                        <p className="text-sm text-[#334155] leading-relaxed">{selected.details}</p>
                                    </div>

                                    {/* Error-specific info */}
                                    {selected.type === "error" && (
                                        <div className="space-y-3">
                                            {selected.affectedJoint && (
                                                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B] mb-1">Affected Component</p>
                                                    <p className="font-mono text-sm font-bold text-[#EF4444]">{selected.affectedJoint}</p>
                                                </div>
                                            )}
                                            {selected.resolution && (
                                                <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#22C55E] mb-2">Recommended Resolution</p>
                                                    <ul className="space-y-1">
                                                        {selected.resolution.split(". ").map((step, i) => step.trim() && (
                                                            <li key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                                                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[9px] font-bold text-[#22C55E]">{i + 1}</span>
                                                                {step.trim().replace(/\.$/, "")}.
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
