"use client";

import {
  useMemo,
  useState,
  type ComponentType,
} from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bot,
  Building2,
  ChevronRight,
  Clock,
  Info,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import type { BackendSubscriptionPlan } from "@/lib/auth";
import { useCompany } from "@/lib/company-context";
import { cn } from "@/lib/utils";

type AlertType = "info" | "warning" | "error";
type AlertFilter = "all" | "warning" | "error";

interface LogEntry {
  id: string;
  robotId: string;
  robotName: string;
  timestamp: string;
  type: AlertType;
  message: string;
  details: string;
  errorCode?: string;
  affectedComponent?: string;
  resolution?: string[];
}

const ROBOT_LOGS: LogEntry[] = [
  {
    id: "log-1",
    robotId: "RA-001",
    robotName: "Robot Arm Alpha",
    timestamp: "21:14:53",
    type: "info",
    message: "System startup - all joints initialized",
    details:
      "The six-axis robot arm initialized successfully.",
  },
  {
    id: "log-2",
    robotId: "RA-001",
    robotName: "Robot Arm Alpha",
    timestamp: "21:15:44",
    type: "warning",
    message: "Load approaching threshold - 82%",
    details:
      "Robot load entered the warning range. Operating speed was reduced.",
  },
  {
    id: "log-3",
    robotId: "RA-001",
    robotName: "Robot Arm Alpha",
    timestamp: "21:17:02",
    type: "error",
    message: "Joint 3 temperature critical",
    details:
      "Joint temperature exceeded the configured safety threshold.",
    errorCode: "E-OVERHEAT",
    affectedComponent: "Joint 3",
    resolution: [
      "Allow the robot to cool for ten minutes.",
      "Inspect the cooling fan.",
      "Check joint lubrication.",
    ],
  },
  {
    id: "log-4",
    robotId: "RA-002",
    robotName: "Robot Arm Beta",
    timestamp: "21:10:05",
    type: "info",
    message: "Robot entered idle state",
    details:
      "No production jobs are currently pending.",
  },
  {
    id: "log-5",
    robotId: "RA-002",
    robotName: "Robot Arm Beta",
    timestamp: "21:12:30",
    type: "error",
    message: "Communication timeout",
    details:
      "The controller did not respond within 5000 milliseconds.",
    errorCode: "E-TIMEOUT",
    affectedComponent: "Controller Node 02",
    resolution: [
      "Check the Ethernet connection.",
      "Verify the controller IP configuration.",
      "Restart Controller Node 02.",
    ],
  },
  {
    id: "log-6",
    robotId: "RA-003",
    robotName: "Robot Arm Gamma",
    timestamp: "21:08:44",
    type: "info",
    message: "Assembly cycle started",
    details:
      "The robot started Assembly Frame B.",
  },
  {
    id: "log-7",
    robotId: "RA-003",
    robotName: "Robot Arm Gamma",
    timestamp: "21:09:30",
    type: "error",
    message: "Axis 4 overload - emergency stop",
    details:
      "Axis 4 exceeded its maximum configured load.",
    errorCode: "E-OVERLOAD",
    affectedComponent: "Axis 4",
    resolution: [
      "Clear possible production-line obstruction.",
      "Reduce the configured payload.",
      "Recalibrate Axis 4.",
    ],
  },
];

const TYPE_CONFIG: Record<
  AlertType,
  {
    icon: ComponentType<{ className?: string }>;
    color: string;
    background: string;
    border: string;
    label: string;
  }
> = {
  info: {
    icon: Info,
    color: "text-[#3B82F6]",
    background: "bg-[#3B82F6]/10",
    border: "border-[#3B82F6]/30",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-[#B89000]",
    background: "bg-[#FACC15]/10",
    border: "border-[#FACC15]/30",
    label: "Warning",
  },
  error: {
    icon: XCircle,
    color: "text-[#EF4444]",
    background: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/30",
    label: "Error",
  },
};

export default function AlertsPage() {
  const session = useSession();
  const {
    selectedCompany,
    isLoadingCompanies,
    companyError,
    refreshCompanies,
  } = useCompany();

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      <div className="hidden sm:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader session={session} />

        {isLoadingCompanies ? (
          <CompanyLoadingState />
        ) : selectedCompany ? (
          <AlertsWorkspace
            key={selectedCompany.id}
            companyName={selectedCompany.name}
            subscriptionPlan={
              selectedCompany.subscriptionPlan
            }
            robotLimit={selectedCompany.maxRobots}
          />
        ) : (
          <NoCompanyState
            error={companyError}
            onRetry={() => void refreshCompanies()}
          />
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}

function CompanyLoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex items-center gap-3 text-sm text-[#64748B]">
        <RefreshCw className="h-4 w-4 animate-spin text-[#FD3E06]" />
        Loading company workspace...
      </div>
    </div>
  );
}

function NoCompanyState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FD3E06]/10">
          <Building2 className="h-6 w-6 text-[#FD3E06]" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-[#0F172A]">
          No company workspace available
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Your account does not currently have access to an
          active Company workspace.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>

          <Link
            href="/dashboard/company"
            className="rounded-lg bg-[#FD3E06] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E73705]"
          >
            View Companies
          </Link>
        </div>
      </div>
    </div>
  );
}

function AlertsWorkspace({
  companyName,
  subscriptionPlan,
  robotLimit,
}: {
  companyName: string;
  subscriptionPlan: BackendSubscriptionPlan;
  robotLimit: number;
}) {
  const [selected, setSelected] =
    useState<LogEntry | null>(null);
  const [filter, setFilter] =
    useState<AlertFilter>("all");

  const logs = useMemo(() => {
    const allowedRobotIds =
      robotLimit < 0
        ? null
        : new Set(
            ["RA-001", "RA-002", "RA-003"].slice(
              0,
              Math.max(0, robotLimit)
            )
          );

    return ROBOT_LOGS.filter(
      (log) =>
        (!allowedRobotIds ||
          allowedRobotIds.has(log.robotId)) &&
        (filter === "all" || log.type === filter)
    );
  }, [filter, robotLimit]);

  const robotIds = useMemo(
    () => [...new Set(logs.map((log) => log.robotId))],
    [logs]
  );

  return (
    <main className="flex flex-1 flex-col overflow-hidden pb-14 sm:pb-0">
      <div className="border-b border-[#E2E8F0] bg-white px-5 py-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-base font-bold text-[#0F172A]">
              Alerts & Event Log
            </h1>
            <p className="mt-0.5 text-xs text-[#64748B]">
              Robot events for {companyName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FD3E06]/10 px-3 py-1 text-[10px] font-semibold text-[#FD3E06]">
              {subscriptionPlan}
            </span>

            {(
              [
                "all",
                "error",
                "warning",
              ] as AlertFilter[]
            ).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  setFilter(value);
                  setSelected(null);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  filter === value
                    ? "bg-[#FD3E06] text-white"
                    : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "flex flex-col overflow-hidden bg-white",
            selected
              ? "hidden w-[420px] shrink-0 md:flex"
              : "flex-1"
          )}
        >
          <div className="flex-1 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <p className="text-sm text-[#64748B]">
                  No events match the selected filter.
                </p>
              </div>
            ) : (
              robotIds.map((robotId) => {
                const entries = logs.filter(
                  (log) => log.robotId === robotId
                );

                return (
                  <section key={robotId}>
                    <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-2">
                      <Bot className="h-3.5 w-3.5 text-[#94A3B8]" />
                      <span className="font-mono text-[11px] font-semibold text-[#334155]">
                        {robotId}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        {entries[0].robotName}
                      </span>
                      <span className="ml-auto rounded-full bg-[#EF4444]/10 px-2 py-0.5 text-[10px] font-semibold text-[#EF4444]">
                        {
                          entries.filter(
                            (entry) =>
                              entry.type === "error"
                          ).length
                        }{" "}
                        errors
                      </span>
                    </div>

                    {entries.map((log) => (
                      <LogRow
                        key={log.id}
                        log={log}
                        selected={
                          selected?.id === log.id
                        }
                        onSelect={() =>
                          setSelected(log)
                        }
                      />
                    ))}
                  </section>
                );
              })
            )}
          </div>
        </div>

        {selected && (
          <AlertDetail
            log={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </main>
  );
}

function LogRow({
  log,
  selected,
  onSelect,
}: {
  log: LogEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  const config = TYPE_CONFIG[log.type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full border-b border-[#F1F5F9] px-5 py-3 text-left hover:bg-[#FD3E06]/5",
        selected &&
          "border-l-2 border-l-[#FD3E06] bg-[#FD3E06]/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
            config.background
          )}
        >
          <Icon
            className={cn(
              "h-3.5 w-3.5",
              config.color
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-bold uppercase",
                config.color
              )}
            >
              {config.label}
            </span>

            {log.errorCode && (
              <span className="rounded bg-[#EF4444]/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#EF4444]">
                {log.errorCode}
              </span>
            )}
          </div>

          <p className="mt-0.5 text-xs font-medium text-[#0F172A]">
            {log.message}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-[10px] text-[#94A3B8]">
          <Clock className="h-3 w-3" />
          {log.timestamp}
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

function AlertDetail({
  log,
  onClose,
}: {
  log: LogEntry;
  onClose: () => void;
}) {
  const config = TYPE_CONFIG[log.type];
  const Icon = config.icon;

  return (
    <aside className="flex flex-1 flex-col overflow-hidden border-l border-[#E2E8F0] bg-white">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg",
                config.background
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  config.color
                )}
              />
            </div>

            <span
              className={cn(
                "text-xs font-bold uppercase",
                config.color
              )}
            >
              {config.label}
            </span>

            {log.errorCode && (
              <span className="rounded bg-[#EF4444]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#EF4444]">
                {log.errorCode}
              </span>
            )}
          </div>

          <h2 className="mt-2 text-sm font-bold text-[#0F172A]">
            {log.message}
          </h2>

          <p className="mt-1 text-[11px] text-[#94A3B8]">
            {log.robotId} - {log.robotName} -{" "}
            {log.timestamp}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9]"
          aria-label="Close alert details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div
          className={cn(
            "rounded-xl border p-4",
            config.border,
            config.background
          )}
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
            Event details
          </p>
          <p className="text-sm leading-6 text-[#334155]">
            {log.details}
          </p>
        </div>

        {log.affectedComponent && (
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
              Affected component
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-[#EF4444]">
              {log.affectedComponent}
            </p>
          </div>
        )}

        {log.resolution && (
          <div className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#22C55E]">
              Recommended resolution
            </p>

            <ol className="space-y-2">
              {log.resolution.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-2 text-xs text-[#334155]"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/20 text-[9px] font-bold text-[#22C55E]">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </aside>
  );
}