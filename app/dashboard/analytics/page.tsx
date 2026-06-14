"use client";

import {
  useMemo,
  useState,
  type ComponentType,
} from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Bot,
  Building2,
  Clock,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import type { BackendSubscriptionPlan } from "@/lib/auth";
import { useCompany } from "@/lib/company-context";
import { initialRobots } from "@/lib/mock-data";

interface RobotAnalytics {
  id: string;
  name: string;
  totalHours: number;
  uptimePercent: number;
  averageTemperature: number;
  totalCycles: number;
  averageCycleTime: number;
  errorCount: number;
  peakLoad: number;
  hourlyActivity: number[];
  weeklyUptime: number[];
}

const DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const HOURS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}h`
);

const ROBOT_COLORS = [
  "#FD3E06",
  "#3B82F6",
  "#22C55E",
];

const ANALYTICS_SEEDS = [
  {
    totalHours: 312,
    uptimePercent: 98.2,
    averageTemperature: 44,
    totalCycles: 12847,
    averageCycleTime: 2.4,
    errorCount: 2,
    peakLoad: 92,
    hourlyActivity: [
      12, 10, 11, 14, 18, 25,
      61, 73, 82, 88, 91, 79,
      42, 84, 90, 94, 87, 81,
      70, 66, 58, 52, 43, 22,
    ],
    weeklyUptime: [
      7.8, 8.2, 7.5, 8, 8.1, 4.2, 0.5,
    ],
  },
  {
    totalHours: 275,
    uptimePercent: 94.7,
    averageTemperature: 37,
    totalCycles: 9312,
    averageCycleTime: 3.1,
    errorCount: 5,
    peakLoad: 45,
    hourlyActivity: [
      8, 9, 10, 11, 16, 21,
      55, 68, 74, 81, 78, 72,
      35, 70, 76, 80, 72, 69,
      61, 55, 47, 38, 29, 18,
    ],
    weeklyUptime: [
      7.2, 7.8, 6.9, 7.5, 7.9, 3.8, 0.2,
    ],
  },
  {
    totalHours: 401,
    uptimePercent: 99.1,
    averageTemperature: 52,
    totalCycles: 18405,
    averageCycleTime: 1.8,
    errorCount: 1,
    peakLoad: 97,
    hourlyActivity: [
      17, 15, 14, 18, 22, 31,
      70, 82, 91, 95, 97, 88,
      48, 89, 94, 98, 93, 87,
      78, 72, 67, 59, 49, 28,
    ],
    weeklyUptime: [
      8, 8.3, 8.1, 8.2, 8, 5.1, 1,
    ],
  },
];

function createAnalyticsData(
  robotLimit: number
): RobotAnalytics[] {
  const robots =
    robotLimit < 0
      ? initialRobots
      : initialRobots.slice(
          0,
          Math.max(0, robotLimit)
        );

  return robots.map((robot, index) => {
    const seed =
      ANALYTICS_SEEDS[
        index % ANALYTICS_SEEDS.length
      ];

    return {
      id: robot.id,
      name: robot.name,
      ...seed,
    };
  });
}

export default function AnalyticsPage() {
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
          <AnalyticsWorkspace
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

function AnalyticsWorkspace({
  companyName,
  subscriptionPlan,
  robotLimit,
}: {
  companyName: string;
  subscriptionPlan: BackendSubscriptionPlan;
  robotLimit: number;
}) {
  const analyticsData = useMemo(
    () => createAnalyticsData(robotLimit),
    [robotLimit]
  );

  const [selectedRobotId, setSelectedRobotId] =
    useState(
      () => analyticsData[0]?.id ?? ""
    );

  const selectedRobot =
    analyticsData.find(
      (robot) => robot.id === selectedRobotId
    ) ?? analyticsData[0];

  if (!selectedRobot) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <Bot className="mx-auto h-8 w-8 text-[#94A3B8]" />
          <h1 className="mt-3 text-base font-semibold text-[#0F172A]">
            No robot analytics available
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {companyName} does not currently contain any
            robots.
          </p>
        </div>
      </main>
    );
  }

  const selectedIndex = analyticsData.findIndex(
    (robot) => robot.id === selectedRobot.id
  );
  const selectedColor =
    ROBOT_COLORS[selectedIndex] ?? "#FD3E06";

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Robot performance for {companyName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#FD3E06]/10 px-3 py-1.5 text-xs font-semibold text-[#FD3E06]">
            {subscriptionPlan}
          </span>

          {analyticsData.map((robot, index) => {
            const color =
              ROBOT_COLORS[index] ?? "#FD3E06";
            const isSelected =
              selectedRobot.id === robot.id;

            return (
              <button
                type="button"
                key={robot.id}
                onClick={() =>
                  setSelectedRobotId(robot.id)
                }
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                style={{
                  borderColor: isSelected
                    ? color
                    : "#E2E8F0",
                  backgroundColor: isSelected
                    ? `${color}10`
                    : "white",
                  color: isSelected
                    ? color
                    : "#64748B",
                }}
              >
                <Bot className="h-3.5 w-3.5" />
                {robot.id}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Total Operating Hours"
          value={`${selectedRobot.totalHours}h`}
          description="Since deployment"
          icon={Clock}
          color={selectedColor}
        />
        <MetricCard
          label="Uptime"
          value={`${selectedRobot.uptimePercent}%`}
          description="Last 30 days"
          icon={Activity}
          color={selectedColor}
        />
        <MetricCard
          label="Total Cycles"
          value={selectedRobot.totalCycles.toLocaleString()}
          description={`Average ${selectedRobot.averageCycleTime}s/cycle`}
          icon={TrendingUp}
          color={selectedColor}
        />
        <MetricCard
          label="Error Count"
          value={selectedRobot.errorCount}
          description="Last 30 days"
          icon={Zap}
          color={selectedColor}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Activity Frequency
              </h2>
              <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                Load percentage by hour
              </p>
            </div>
            <BarChart3 className="h-4 w-4 text-[#94A3B8]" />
          </div>

          <Sparkline
            data={selectedRobot.hourlyActivity}
            color={selectedColor}
          />

          <div className="mt-1 flex justify-between">
            {[0, 6, 12, 18, 23].map((hour) => (
              <span
                key={hour}
                className="text-[9px] text-[#94A3B8]"
              >
                {HOURS[hour]}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Weekly Uptime
              </h2>
              <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                Operating hours per day
              </p>
            </div>
            <Activity className="h-4 w-4 text-[#94A3B8]" />
          </div>

          <BarGroup
            values={selectedRobot.weeklyUptime}
            maximum={10}
            color={selectedColor}
          />
        </section>

        <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold text-[#0F172A]">
            Fleet Comparison
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {analyticsData.map((robot, index) => {
              const color =
                ROBOT_COLORS[index] ?? "#FD3E06";

              return (
                <div key={robot.id}>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: color,
                      }}
                    />
                    <span className="font-mono text-xs font-semibold text-[#334155]">
                      {robot.id}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {robot.name}
                    </span>
                  </div>

                  <ComparisonRow
                    label="Uptime"
                    value={robot.uptimePercent}
                    suffix="%"
                    color={color}
                  />
                  <ComparisonRow
                    label="Average Temp"
                    value={robot.averageTemperature}
                    suffix={"\u00B0C"}
                    color={color}
                  />
                  <ComparisonRow
                    label="Peak Load"
                    value={robot.peakLoad}
                    suffix="%"
                    color={color}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <ComparisonMetric
                      value={robot.totalCycles.toLocaleString()}
                      label="Total Cycles"
                    />
                    <ComparisonMetric
                      value={robot.errorCount}
                      label="Errors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[#64748B]">
          {label}
        </p>
        <Icon
          className="h-4 w-4"
          style={{ color }}
        />
      </div>

      <p className="mt-2 text-2xl font-bold text-[#0F172A]">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-[#94A3B8]">
        {description}
      </p>
    </div>
  );
}

function Sparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const width = 200;
  const height = 80;
  const maximum = Math.max(...data, 1);
  const minimum = Math.min(...data);
  const range = maximum - minimum || 1;

  const points = data
    .map((value, index) => {
      const x =
        (index / Math.max(data.length - 1, 1)) *
        width;
      const y =
        height -
        ((value - minimum) / range) *
          (height - 6) -
        3;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-20 w-full"
      aria-label="Hourly robot activity chart"
    >
      <polyline
        points={`${points} ${width},${height} 0,${height}`}
        fill={color}
        opacity="0.12"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarGroup({
  values,
  maximum,
  color,
}: {
  values: number[];
  maximum: number;
  color: string;
}) {
  return (
    <div className="flex h-40 items-end gap-2">
      {values.map((value, index) => (
        <div
          key={DAYS[index]}
          className="group relative flex flex-1 flex-col items-center"
        >
          <div
            className="w-full rounded-t-sm"
            style={{
              height: `${(value / maximum) * 100}%`,
              backgroundColor: color,
              opacity: 0.85,
            }}
          />

          <span className="mt-1.5 text-[8px] text-[#94A3B8]">
            {DAYS[index]}
          </span>

          <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-[#0F172A] px-2 py-1 text-[10px] text-white group-hover:block">
            {value}h
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonRow({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: number;
  suffix: string;
  color: string;
}) {
  return (
    <div className="mb-2">
      <div className="mb-0.5 flex justify-between text-[10px]">
        <span className="text-[#64748B]">
          {label}
        </span>
        <span className="font-mono font-semibold text-[#0F172A]">
          {value}
          {suffix}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-[#F1F5F9]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, value)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ComparisonMetric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-[#F8FAFC] p-2">
      <p className="font-mono text-sm font-bold text-[#0F172A]">
        {value}
      </p>
      <p className="text-[9px] text-[#94A3B8]">
        {label}
      </p>
    </div>
  );
}