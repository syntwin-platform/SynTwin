"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { AlertMessage } from "@/lib/mock-data";
import { AlertTriangle, Info, XCircle, ChevronDown } from "lucide-react";

interface AlertPanelProps {
  alerts: AlertMessage[];
  title?: string;
  selectedRobotId?: string | null;
}

const typeConfig = {
  info: { icon: Info, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  warning: { icon: AlertTriangle, color: "text-[#FACC15]", bg: "bg-[#FACC15]/10" },
  error: { icon: XCircle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
};

export function AlertPanel({ alerts, title = "Event Log", selectedRobotId }: AlertPanelProps) {
  const filteredAlerts = selectedRobotId
    ? alerts.filter((a) => a.robotId === selectedRobotId)
    : alerts;
  return (
    <div className="flex h-full flex-col border-t border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            {title}
          </h2>
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-mono text-[#64748B]">
            {filteredAlerts.length}
          </span>
        </div>
        <button className="flex items-center gap-1 text-[10px] text-[#94A3B8] transition-colors hover:text-[#64748B]">
          Latest
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Scrollable log */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2">
        {filteredAlerts.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[#94A3B8]">No events for this robot</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredAlerts.map((alert) => {
            const config = typeConfig[alert.type];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className="flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-[#F8FAFC]"
              >
                <div className={cn("mt-0.5 rounded p-1", config.bg)}>
                  <Icon className={cn("h-3 w-3", config.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[#334155]">{alert.message}</p>
                  <p className="mt-0.5 text-[10px] text-[#94A3B8]">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
