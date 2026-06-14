"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Wrench,
  XCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import type { BackendSubscriptionPlan } from "@/lib/auth";
import { useCompany } from "@/lib/company-context";
import {
  initialRobots,
  type RobotData,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ExtendedRobot extends RobotData {
  task: string;
  criticalityLevel:
    | "low"
    | "medium"
    | "high"
    | "critical";
  needsMaintenance: boolean;
  safetyLevel: "safe" | "caution" | "danger";
  operatingHours: number;
}

interface SortState {
  key: keyof ExtendedRobot;
  direction: "asc" | "desc";
}

const TASKS = [
  "Welding - Door Panel",
  "Pick & Place - Line A",
  "Assembly - Frame B",
  "Painting - Hood",
  "Quality Check - Station 3",
];

const CRITICALITY_CONFIG = {
  low: {
    label: "Low",
    color: "text-[#22C55E]",
    background: "bg-[#22C55E]/10",
  },
  medium: {
    label: "Medium",
    color: "text-[#B89000]",
    background: "bg-[#FACC15]/10",
  },
  high: {
    label: "High",
    color: "text-[#F97316]",
    background: "bg-[#F97316]/10",
  },
  critical: {
    label: "Critical",
    color: "text-[#EF4444]",
    background: "bg-[#EF4444]/10",
  },
};

const STATUS_CONFIG = {
  running: {
    label: "Running",
    color: "text-[#22C55E]",
    dot: "#22C55E",
  },
  idle: {
    label: "Idle",
    color: "text-[#B89000]",
    dot: "#FACC15",
  },
  error: {
    label: "Error",
    color: "text-[#EF4444]",
    dot: "#EF4444",
  },
};

const SAFETY_CONFIG = {
  safe: {
    label: "Safe",
    icon: ShieldCheck,
    color: "text-[#22C55E]",
  },
  caution: {
    label: "Caution",
    icon: ShieldAlert,
    color: "text-[#B89000]",
  },
  danger: {
    label: "Danger",
    icon: ShieldAlert,
    color: "text-[#EF4444]",
  },
};

const TABLE_COLUMNS: Array<{
  key: keyof ExtendedRobot;
  label: string;
}> = [
  { key: "id", label: "Robot ID" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "task", label: "Current Task" },
  {
    key: "criticalityLevel",
    label: "Criticality",
  },
  {
    key: "needsMaintenance",
    label: "Maintenance",
  },
  {
    key: "temperature",
    label: "Temp (\u00B0C)",
  },
  { key: "load", label: "Load %" },
  { key: "safetyLevel", label: "Safety" },
  {
    key: "operatingHours",
    label: "Op. Hours",
  },
];

function getCriticality(
  temperature: number
): ExtendedRobot["criticalityLevel"] {
  if (temperature > 70) return "critical";
  if (temperature > 55) return "high";
  if (temperature > 42) return "medium";
  return "low";
}

function getSafetyLevel(
  temperature: number
): ExtendedRobot["safetyLevel"] {
  if (temperature > 70) return "danger";
  if (temperature > 55) return "caution";
  return "safe";
}

function createRobots(
  robotLimit: number
): ExtendedRobot[] {
  const availableRobots =
    robotLimit < 0
      ? initialRobots
      : initialRobots.slice(
          0,
          Math.max(0, robotLimit)
        );

  return availableRobots.map((robot, index) => ({
    ...robot,
    position: [...robot.position] as [
      number,
      number,
      number,
    ],
    task:
      robot.status === "idle"
        ? "Idle"
        : TASKS[index % TASKS.length],
    criticalityLevel: getCriticality(
      robot.temperature
    ),
    needsMaintenance:
      robot.temperature > 50 || robot.load > 85,
    safetyLevel: getSafetyLevel(robot.temperature),
    operatingHours: Math.floor(
      200 + index * 87 + robot.load * 3
    ),
  }));
}

export default function RobotManagementPage() {
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
          <RobotManagementWorkspace
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

function RobotManagementWorkspace({
  companyName,
  subscriptionPlan,
  robotLimit,
}: {
  companyName: string;
  subscriptionPlan: BackendSubscriptionPlan;
  robotLimit: number;
}) {
  const [robots, setRobots] =
    useState<ExtendedRobot[]>(
      () => createRobots(robotLimit)
    );
  const [sort, setSort] = useState<SortState>({
    key: "id",
    direction: "asc",
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRobots((currentRobots) =>
        currentRobots.map((robot) => {
          const temperature = Math.floor(
            robot.temperature +
              (Math.random() - 0.5) * 4
          );
          const load = Math.min(
            100,
            Math.max(
              0,
              robot.load +
                (Math.random() - 0.5) * 10
            )
          );

          return {
            ...robot,
            temperature,
            load,
            criticalityLevel:
              getCriticality(temperature),
            needsMaintenance:
              temperature > 50 || load > 85,
            safetyLevel:
              getSafetyLevel(temperature),
          };
        })
      );
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  function toggleSort(key: keyof ExtendedRobot) {
    setSort((currentSort) => ({
      key,
      direction:
        currentSort.key === key &&
        currentSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }

  const sortedRobots = useMemo(() => {
    return [...robots].sort((first, second) => {
      const firstValue = first[sort.key];
      const secondValue = second[sort.key];

      const comparison =
        typeof firstValue === "number" &&
        typeof secondValue === "number"
          ? firstValue - secondValue
          : String(firstValue).localeCompare(
              String(secondValue)
            );

      return sort.direction === "asc"
        ? comparison
        : -comparison;
    });
  }, [robots, sort]);

  const activeCount = robots.filter(
    (robot) => robot.status === "running"
  ).length;
  const idleCount = robots.filter(
    (robot) => robot.status === "idle"
  ).length;
  const errorCount = robots.filter(
    (robot) => robot.status === "error"
  ).length;
  const maintenanceCount = robots.filter(
    (robot) => robot.needsMaintenance
  ).length;

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">
            Robot Management
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Realtime robot status for {companyName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#FD3E06]/10 px-3 py-1 text-xs font-semibold text-[#FD3E06]">
            {subscriptionPlan}
          </span>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#64748B] shadow-sm">
            {robots.length}
            {robotLimit !== -1
              ? ` / ${robotLimit}`
              : ""}
            {" robots"}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="Active"
          value={activeCount}
          icon={Activity}
          color="#22C55E"
        />
        <SummaryCard
          label="Idle"
          value={idleCount}
          icon={Clock}
          color="#FACC15"
        />
        <SummaryCard
          label="Error"
          value={errorCount}
          icon={XCircle}
          color="#EF4444"
        />
        <SummaryCard
          label="Needs Maintenance"
          value={maintenanceCount}
          icon={Wrench}
          color="#F97316"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">
            Robot Fleet
          </h2>

          <span className="text-xs text-[#94A3B8]">
            Live - updates every 4s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {TABLE_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    onClick={() =>
                      toggleSort(column.key)
                    }
                    className="cursor-pointer whitespace-nowrap px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#64748B] hover:text-[#0F172A]"
                  >
                    <span className="flex items-center gap-1">
                      {column.label}

                      {sort.key === column.key ? (
                        sort.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-[#FD3E06]" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-[#FD3E06]" />
                        )
                      ) : (
                        <ChevronUp className="h-3 w-3 opacity-20" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedRobots.map((robot, index) => {
                const status =
                  STATUS_CONFIG[robot.status];
                const criticality =
                  CRITICALITY_CONFIG[
                    robot.criticalityLevel
                  ];
                const safety =
                  SAFETY_CONFIG[robot.safetyLevel];
                const SafetyIcon = safety.icon;

                return (
                  <tr
                    key={robot.id}
                    className={cn(
                      "border-b border-[#F1F5F9] transition-colors hover:bg-orange-50/30",
                      index % 2 === 0
                        ? "bg-white"
                        : "bg-[#F8FAFC]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-[#0F172A]">
                        {robot.id}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs text-[#334155]">
                        {robot.name}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              status.dot,
                          }}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            status.color
                          )}
                        >
                          {status.label}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="whitespace-nowrap text-xs text-[#64748B]">
                        {robot.task}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          criticality.color,
                          criticality.background
                        )}
                      >
                        {criticality.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {robot.needsMaintenance ? (
                        <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold text-[#F97316]">
                          <Wrench className="h-3 w-3" />
                          Required
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-[#22C55E]">
                          <CheckCircle2 className="h-3 w-3" />
                          OK
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Thermometer
                          className={cn(
                            "h-3.5 w-3.5",
                            robot.temperature > 60
                              ? "text-[#EF4444]"
                              : "text-[#94A3B8]"
                          )}
                        />

                        <span
                          className={cn(
                            "font-mono text-xs font-medium",
                            robot.temperature > 60
                              ? "text-[#EF4444]"
                              : robot.temperature > 45
                                ? "text-[#B89000]"
                                : "text-[#0F172A]"
                          )}
                        >
                          {robot.temperature}
                          {"\u00B0C"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-[#F1F5F9]">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${robot.load}%`,
                              backgroundColor:
                                robot.load > 90
                                  ? "#EF4444"
                                  : robot.load > 70
                                    ? "#FACC15"
                                    : "#22C55E",
                            }}
                          />
                        </div>

                        <span className="font-mono text-xs text-[#334155]">
                          {Math.round(robot.load)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-[10px] font-semibold",
                          safety.color
                        )}
                      >
                        <SafetyIcon className="h-3.5 w-3.5" />
                        {safety.label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-[#64748B]">
                        {robot.operatingHours}h
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: ComponentType<{
    className?: string;
    style?: CSSProperties;
  }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#64748B]">
            {label}
          </p>

          <p
            className="mt-1 text-3xl font-bold"
            style={{ color }}
          >
            {value}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${color}15`,
          }}
        >
          <Icon
            className="h-5 w-5"
            style={{ color }}
          />
        </div>
      </div>
    </div>
  );
}