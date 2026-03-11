"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { RobotData } from "@/lib/mock-data";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/mock-data";
import {
  Thermometer,
  Gauge,
  Timer,
  ArrowRight,
  Circle,
  Plus,
  Pencil,
  Trash2,
  Lock,
  ExternalLink,
} from "lucide-react";

interface RobotPanelProps {
  robots: RobotData[];
  selectedRobotId: string | null;
  onSelectRobot: (id: string) => void;
  onAddRobot?: () => void;
  onEditRobot?: (robot: RobotData) => void;
  onDeleteRobot?: (id: string) => void;
  /** -1 = unlimited */
  robotLimit?: number;
  atLimit?: boolean;
}

export function RobotPanel({ robots, selectedRobotId, onSelectRobot, onAddRobot, onEditRobot, onDeleteRobot, robotLimit = -1, atLimit = false }: RobotPanelProps) {
  const selectedRobot = robots.find((r) => r.id === selectedRobotId);

  return (
    <aside className="flex h-full w-72 flex-col border-l border-[#E2E8F0] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
            Robot Status
          </h2>
          {robotLimit !== -1 && (
            <p className="mt-0.5 text-[10px] text-[#94A3B8]">
              {robots.length} / {robotLimit} robots
            </p>
          )}
        </div>
        {onAddRobot && (
          <button
            onClick={atLimit ? undefined : onAddRobot}
            disabled={atLimit}
            title={atLimit ? `Limit of ${robotLimit} robots reached — upgrade to add more` : "Add robot"}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-white transition-colors",
              atLimit
                ? "cursor-not-allowed bg-[#94A3B8]"
                : "bg-[#FD3E06] hover:bg-[#FD3E06]/90"
            )}
          >
            {atLimit ? <Lock className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            Add
          </button>
        )}
      </div>

      {/* Upgrade banner when at limit */}
      {atLimit && (
        <div className="mx-3 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-[11px] font-semibold text-amber-700">
                Giới hạn {robotLimit} robot
              </p>
              <p className="mt-0.5 text-[10px] text-amber-600">
                Nâng cấp lên Enterprise để không giới hạn.
              </p>
              <a
                href="/pricing"
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#FD3E06] hover:underline"
              >
                Xem gói nâng cấp
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Robot List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {robots.map((robot) => (
            <div
              key={robot.id}
              onClick={() => onSelectRobot(robot.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectRobot(robot.id); }}
              className={cn(
                "w-full cursor-pointer rounded-lg border p-3 text-left transition-all duration-200",
                selectedRobotId === robot.id
                  ? "border-[#FD3E06]/40 bg-[#FD3E06]/5 shadow-[0_0_15px_rgba(253,62,6,0.08)]"
                  : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle
                    className="h-2.5 w-2.5"
                    fill={STATUS_COLORS[robot.status]}
                    stroke={STATUS_COLORS[robot.status]}
                  />
                  <span className="text-xs font-mono font-medium text-[#0F172A]">
                    {robot.id}
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  style={{
                    color: STATUS_COLORS[robot.status],
                    backgroundColor: `${STATUS_COLORS[robot.status]}15`,
                  }}
                >
                  {STATUS_LABELS[robot.status]}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B]">{robot.name}</p>

              {/* Edit / Delete actions */}
              {selectedRobotId === robot.id && (onEditRobot || onDeleteRobot) && (
                <div className="mt-2 flex items-center gap-1 border-t border-[#E2E8F0] pt-2">
                  {onEditRobot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRobot(robot);
                      }}
                      className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-[#3B82F6] transition-colors hover:bg-[#3B82F6]/10"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                  {onDeleteRobot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRobot(robot.id);
                      }}
                      className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-[#EF4444] transition-colors hover:bg-[#EF4444]/10"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Selected robot detail */}
        {selectedRobot && (
          <div className="mt-4 rounded-lg border border-[#FD3E06]/20 bg-[#FD3E06]/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0F172A]">{selectedRobot.name}</h3>
              <ArrowRight className="h-4 w-4 text-[#FD3E06]" />
            </div>

            <div className="space-y-3">
              <DetailRow
                icon={Thermometer}
                label="Temperature"
                value={`${selectedRobot.temperature}°C`}
                warning={selectedRobot.temperature > 60}
              />
              <DetailRow
                icon={Gauge}
                label="Load"
                value={`${selectedRobot.load}%`}
                warning={selectedRobot.load > 90}
              />
              <DetailRow
                icon={Timer}
                label="Cycle Time"
                value={`${selectedRobot.cycleTime}s`}
              />
            </div>

            {/* Load bar */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[10px] text-[#64748B]">
                <span>Load Capacity</span>
                <span>{selectedRobot.load}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${selectedRobot.load}%`,
                    backgroundColor:
                      selectedRobot.load > 90
                        ? "#ef4444"
                        : selectedRobot.load > 70
                          ? "#eab308"
                          : "#22c55e",
                  }}
                />
              </div>
            </div>

            {/* Temperature gauge */}
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] text-[#64748B]">
                <span>Temperature</span>
                <span>{selectedRobot.temperature}°C</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((selectedRobot.temperature / 100) * 100, 100)}%`,
                    backgroundColor:
                      selectedRobot.temperature > 60
                        ? "#ef4444"
                        : selectedRobot.temperature > 45
                          ? "#eab308"
                          : "#22c55e",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  warning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", warning ? "text-[#EF4444]" : "text-[#94A3B8]")} />
        <span className="text-xs text-[#64748B]">{label}</span>
      </div>
      <span
        className={cn(
          "font-mono text-xs font-medium",
          warning ? "text-[#EF4444]" : "text-[#0F172A]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
