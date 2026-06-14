"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { AlertPanel } from "@/components/AlertPanel";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { RobotFormDialog } from "@/components/RobotFormDialog";
import { RobotPanel } from "@/components/RobotPanel";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import type { BackendSubscriptionPlan } from "@/lib/auth";
import { useCompany } from "@/lib/company-context";
import {
  generateAlert,
  initialRobots,
  randomCycleTime,
  randomLoad,
  randomStatus,
  randomTemp,
  type AlertMessage,
  type RobotData,
} from "@/lib/mock-data";

const FactoryScene = dynamic(
  () =>
    import("@/components/FactoryScene").then(
      (module) => module.FactoryScene
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#0B0F17]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FD3E06] border-t-transparent" />
          <span className="text-xs text-[#94A3B8]">
            Loading 3D scene...
          </span>
        </div>
      </div>
    ),
  }
);

function createInitialRobots(
  robotLimit: number
): RobotData[] {
  const robots =
    robotLimit < 0
      ? initialRobots
      : initialRobots.slice(
          0,
          Math.max(0, robotLimit)
        );

  return robots.map((robot) => ({
    ...robot,
    position: [...robot.position] as [
      number,
      number,
      number,
    ],
  }));
}

function createInitialAlerts(
  robots: RobotData[]
): AlertMessage[] {
  const robotIds = new Set(
    robots.map((robot) => robot.id)
  );
  const now = Date.now();

  return [
    {
      id: "init-1",
      robotId: "RA-001",
      timestamp: new Date(now - 30000),
      type: "info" as const,
      message: "System initialized - all robots online",
    },
    {
      id: "init-2",
      robotId: "RA-001",
      timestamp: new Date(now - 20000),
      type: "info" as const,
      message: "Robot RA-001 started production cycle",
    },
    {
      id: "init-3",
      robotId: "RA-002",
      timestamp: new Date(now - 10000),
      type: "warning" as const,
      message: "Robot RA-002 entering idle state",
    },
  ].filter((alert) => robotIds.has(alert.robotId));
}

export default function DashboardPage() {
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

        <main className="flex-1 overflow-hidden">
          {isLoadingCompanies ? (
            <CompanyLoadingState />
          ) : selectedCompany ? (
            <FactoryWorkspace
              key={selectedCompany.id}
              companyName={selectedCompany.name}
              subscriptionPlan={
                selectedCompany.subscriptionPlan
              }
              robotLimit={selectedCompany.maxRobots}
              canView3D={selectedCompany.canView3D}
            />
          ) : (
            <NoCompanyState
              error={companyError}
              onRetry={() => void refreshCompanies()}
            />
          )}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

function CompanyLoadingState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
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
    <div className="flex h-full items-center justify-center p-6">
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
            Manage Companies
          </Link>
        </div>
      </div>
    </div>
  );
}

function FactoryWorkspace({
  companyName,
  subscriptionPlan,
  robotLimit,
  canView3D,
}: {
  companyName: string;
  subscriptionPlan: BackendSubscriptionPlan;
  robotLimit: number;
  canView3D: boolean;
}) {
  const [robots, setRobots] = useState<RobotData[]>(
    () => createInitialRobots(robotLimit)
  );
  const [selectedRobotId, setSelectedRobotId] =
    useState<string | null>(
      () => createInitialRobots(robotLimit)[0]?.id ?? null
    );
  const [alerts, setAlerts] =
    useState<AlertMessage[]>(
      () =>
        createInitialAlerts(
          createInitialRobots(robotLimit)
        )
    );
  const [alertHeight, setAlertHeight] = useState(176);
  const [isRobotListExpanded, setIsRobotListExpanded] =
    useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRobot, setEditingRobot] =
    useState<RobotData | null>(null);

  const dragRef = useRef(false);
  const robotIdsRef = useRef(
    robots.map((robot) => robot.id)
  );

  useEffect(() => {
    robotIdsRef.current = robots.map(
      (robot) => robot.id
    );
  }, [robots]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRobots((currentRobots) =>
        currentRobots.map((robot) => {
          const status = randomStatus();

          return {
            ...robot,
            status,
            temperature: randomTemp(status),
            load: randomLoad(status),
            cycleTime: randomCycleTime(status),
          };
        })
      );

      const robotIds = robotIdsRef.current;

      if (robotIds.length > 0) {
        const robotId =
          robotIds[
            Math.floor(Math.random() * robotIds.length)
          ];

        setAlerts((currentAlerts) =>
          [
            generateAlert(robotId),
            ...currentAlerts,
          ].slice(0, 50)
        );
      }
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const atLimit =
    robotLimit !== -1 &&
    robots.length >= robotLimit;

  const handleSelectRobot = useCallback(
    (robotId: string) => {
      setSelectedRobotId(robotId);
    },
    []
  );

  const handleAddRobot = useCallback(() => {
    setEditingRobot(null);
    setFormOpen(true);
  }, []);

  const handleEditRobot = useCallback(
    (robot: RobotData) => {
      setEditingRobot(robot);
      setFormOpen(true);
    },
    []
  );

  const handleSaveRobot = useCallback(
    (data: RobotData) => {
      setRobots((currentRobots) => {
        const existingIndex =
          currentRobots.findIndex(
            (robot) => robot.id === data.id
          );

        if (existingIndex >= 0) {
          const nextRobots = [...currentRobots];

          nextRobots[existingIndex] = {
            ...nextRobots[existingIndex],
            name: data.name,
            position: data.position,
          };

          return nextRobots;
        }

        if (
          robotLimit !== -1 &&
          currentRobots.length >= robotLimit
        ) {
          return currentRobots;
        }

        return [...currentRobots, data];
      });

      setSelectedRobotId(data.id);
    },
    [robotLimit]
  );

  const handleDeleteRobot = useCallback(
    (robotId: string) => {
      setRobots((currentRobots) =>
        currentRobots.filter(
          (robot) => robot.id !== robotId
        )
      );

      setAlerts((currentAlerts) =>
        currentAlerts.filter(
          (alert) => alert.robotId !== robotId
        )
      );

      setSelectedRobotId((currentRobotId) =>
        currentRobotId === robotId
          ? null
          : currentRobotId
      );
    },
    []
  );

  const scene = canView3D ? (
    <FactoryScene
      robots={robots}
      selectedRobotId={selectedRobotId}
      onSelectRobot={handleSelectRobot}
    />
  ) : (
    <ThreeDUnavailableState
      companyName={companyName}
      subscriptionPlan={subscriptionPlan}
    />
  );

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto sm:hidden">
        <div className="min-h-[300px] flex-1 p-2">
          {scene}
        </div>

        <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-3 pb-2 pt-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() =>
              setIsRobotListExpanded(
                (expanded) => !expanded
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                setIsRobotListExpanded(
                  (expanded) => !expanded
                );
              }
            }}
            className="mb-2 flex cursor-pointer items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">
                Robots{" "}
                {robotLimit !== -1 &&
                  `(${robots.length}/${robotLimit})`}
              </span>

              {isRobotListExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#94A3B8]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#94A3B8]" />
              )}
            </div>

            {!atLimit && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleAddRobot();
                }}
                className="rounded-md bg-[#FD3E06] px-2 py-1 text-[10px] font-semibold text-white"
              >
                + Add
              </button>
            )}
          </div>

          {isRobotListExpanded && (
            <div className="grid grid-cols-1 gap-2">
              {robots.map((robot) => (
                <button
                  type="button"
                  key={robot.id}
                  onClick={() =>
                    handleSelectRobot(robot.id)
                  }
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                    selectedRobotId === robot.id
                      ? "border-[#FD3E06]/40 bg-[#FD3E06]/5"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          robot.status === "running"
                            ? "#22C55E"
                            : robot.status === "idle"
                              ? "#FACC15"
                              : "#EF4444",
                      }}
                    />
                    <span className="font-mono text-xs font-semibold text-[#0F172A]">
                      {robot.id}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {robot.name}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#64748B]">
                    {robot.temperature}
                    {"\u00B0C"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-64 shrink-0 border-t border-[#E2E8F0] bg-white">
          <AlertPanel
            alerts={alerts}
            title={
              selectedRobotId
                ? `Event Log - ${selectedRobotId}`
                : "All Events"
            }
            selectedRobotId={selectedRobotId}
          />
        </div>

        <div className="h-16 shrink-0" />
      </div>

      <div className="hidden h-full overflow-hidden sm:flex">
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 p-3">
            {scene}
          </div>

          <div
            style={{ height: alertHeight }}
            className="flex shrink-0 flex-col"
          >
            <div
              className="group flex h-2.5 cursor-ns-resize select-none items-center justify-center border-t border-[#E2E8F0] bg-white"
              onMouseDown={(event) => {
                event.preventDefault();
                dragRef.current = true;

                const startY = event.clientY;
                const startHeight = alertHeight;

                const handleMouseMove = (
                  moveEvent: MouseEvent
                ) => {
                  if (!dragRef.current) return;

                  const maximumHeight = Math.floor(
                    window.innerHeight * 0.6
                  );

                  setAlertHeight(
                    Math.min(
                      maximumHeight,
                      Math.max(
                        120,
                        startHeight +
                          startY -
                          moveEvent.clientY
                      )
                    )
                  );
                };

                const handleMouseUp = () => {
                  dragRef.current = false;
                  window.removeEventListener(
                    "mousemove",
                    handleMouseMove
                  );
                  window.removeEventListener(
                    "mouseup",
                    handleMouseUp
                  );
                };

                window.addEventListener(
                  "mousemove",
                  handleMouseMove
                );
                window.addEventListener(
                  "mouseup",
                  handleMouseUp
                );
              }}
            >
              <div className="h-0.5 w-10 rounded-full bg-[#CBD5E1]" />
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 border-r border-[#E2E8F0]">
                <AlertPanel
                  alerts={alerts}
                  title="All Events"
                />
              </div>

              <div className="flex-1">
                <AlertPanel
                  alerts={alerts}
                  title={
                    selectedRobotId
                      ? `Event Log - ${selectedRobotId}`
                      : "Event Log"
                  }
                  selectedRobotId={selectedRobotId}
                />
              </div>
            </div>
          </div>
        </div>

        <RobotPanel
          robots={robots}
          selectedRobotId={selectedRobotId}
          onSelectRobot={handleSelectRobot}
          onAddRobot={handleAddRobot}
          onEditRobot={handleEditRobot}
          onDeleteRobot={handleDeleteRobot}
          robotLimit={robotLimit}
          atLimit={atLimit}
        />
      </div>

      <RobotFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveRobot}
        onDelete={handleDeleteRobot}
        robot={editingRobot}
        existingIds={robots.map(
          (robot) => robot.id
        )}
      />
    </>
  );
}

function ThreeDUnavailableState({
  companyName,
  subscriptionPlan,
}: {
  companyName: string;
  subscriptionPlan: BackendSubscriptionPlan;
}) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#0B0F17] p-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
          <LockKeyhole className="h-6 w-6 text-[#FD3E06]" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-white">
          3D Digital Twin is unavailable
        </h2>

        <p className="mt-2 text-xs leading-5 text-[#94A3B8]">
          {companyName} is using the {subscriptionPlan} plan.
          Robot monitoring remains available, but 3D visualization
          requires a Company plan with 3D access.
        </p>

        <Link
          href="/pricing"
          className="mt-4 inline-flex rounded-lg bg-[#FD3E06] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E73705]"
        >
          View plans
        </Link>
      </div>
    </div>
  );
}