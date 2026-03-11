"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RobotPanel } from "@/components/RobotPanel";
import { AlertPanel } from "@/components/AlertPanel";
import { RobotFormDialog } from "@/components/RobotFormDialog";
import {
  initialRobots,
  generateAlert,
  randomStatus,
  randomTemp,
  randomLoad,
  randomCycleTime,
  type RobotData,
  type AlertMessage,
} from "@/lib/mock-data";
import { getSession, clearSession, PLANS, type Session } from "@/lib/auth";

// Dynamic import for FactoryScene to avoid SSR issues with Three.js
const FactoryScene = dynamic(
  () => import("@/components/FactoryScene").then((mod) => mod.FactoryScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#0B0F17]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FD3E06] border-t-transparent" />
          <span className="text-xs text-[#94A3B8]">Loading 3D Scene…</span>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  // Resizable alert panel
  const [alertHeight, setAlertHeight] = useState(176);
  const dragRef = React.useRef(false)

  // Auth guard
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    if (s.plan === "unpaid") {
      router.replace("/pricing");
      return;
    }
    setSession(s);
  }, [router]);

  // Seed robots — basic plan users start with exactly the initialRobots (3)
  const [robots, setRobots] = useState<RobotData[]>(initialRobots);
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>("RA-001");
  const [alerts, setAlerts] = useState<AlertMessage[]>(() => [
    {
      id: "init-1",
      robotId: "RA-001",
      timestamp: new Date(Date.now() - 30000),
      type: "info",
      message: "System initialized — all robots online",
    },
    {
      id: "init-2",
      robotId: "RA-001",
      timestamp: new Date(Date.now() - 20000),
      type: "info",
      message: "Robot RA-001 started production cycle",
    },
    {
      id: "init-3",
      robotId: "RA-002",
      timestamp: new Date(Date.now() - 10000),
      type: "warning",
      message: "Robot RA-002 entering idle state",
    },
  ]);

  // Fake real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRobots((prev) =>
        prev.map((robot) => {
          const newStatus = randomStatus();
          return {
            ...robot,
            status: newStatus,
            temperature: randomTemp(newStatus),
            load: randomLoad(newStatus),
            cycleTime: randomCycleTime(newStatus),
          };
        })
      );

      setRobots((prev) => {
        const robotIds = prev.map((r) => r.id);
        if (robotIds.length === 0) return prev;
        const randomRobotId = robotIds[Math.floor(Math.random() * robotIds.length)];
        const newAlert = generateAlert(randomRobotId);
        setAlerts((prevAlerts) => [newAlert, ...prevAlerts].slice(0, 50));
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectRobot = useCallback((id: string) => {
    setSelectedRobotId(id);
  }, []);

  // --- CRUD state ---
  const [formOpen, setFormOpen] = useState(false);
  const [editingRobot, setEditingRobot] = useState<RobotData | null>(null);

  // Derive robot limit from session plan
  const robotLimit = session ? PLANS[session.plan].robotLimit : 0;
  const atLimit = robotLimit !== -1 && robots.length >= robotLimit;

  const handleAddRobot = useCallback(() => {
    setEditingRobot(null);
    setFormOpen(true);
  }, []);

  const handleEditRobot = useCallback((robot: RobotData) => {
    setEditingRobot(robot);
    setFormOpen(true);
  }, []);

  const handleSaveRobot = useCallback(
    (data: RobotData) => {
      setRobots((prev) => {
        const idx = prev.findIndex((r) => r.id === data.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], name: data.name, position: data.position };
          return next;
        }
        // Enforce limit for new robots
        if (robotLimit !== -1 && prev.length >= robotLimit) return prev;
        return [...prev, data];
      });
      setSelectedRobotId(data.id);
    },
    [robotLimit]
  );

  const handleDeleteRobot = useCallback(
    (id: string) => {
      setRobots((prev) => prev.filter((r) => r.id !== id));
      setAlerts((prev) => prev.filter((a) => a.robotId !== id));
      if (selectedRobotId === id) setSelectedRobotId(null);
    },
    [selectedRobotId]
  );

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden sm:flex">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader session={session} onLogout={handleLogout} />

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center + Bottom */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 3D Scene */}
            <div className="flex-1 min-h-0 p-3">
              <FactoryScene
                robots={robots}
                selectedRobotId={selectedRobotId}
                onSelectRobot={handleSelectRobot}
              />
            </div>

            {/* Alert Panels — resizable via drag handle */}
            <div
              style={{ height: alertHeight }}
              className="shrink-0 flex flex-col"
            >
              {/* Drag Handle */}
              <div
                className="group flex h-2.5 w-full cursor-ns-resize items-center justify-center border-t border-[#E2E8F0] bg-white hover:bg-[#FD3E06]/5 transition-colors select-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  dragRef.current = true;
                  const startY = e.clientY;
                  const startH = alertHeight;
                  const onMove = (mv: MouseEvent) => {
                    if (!dragRef.current) return;
                    const delta = startY - mv.clientY;
                    const maxH = Math.floor(window.innerHeight * 0.6);
                    setAlertHeight(Math.min(maxH, Math.max(120, startH + delta)));
                  };
                  const onUp = () => {
                    dragRef.current = false;
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
              >
                <div className="h-0.5 w-10 rounded-full bg-[#CBD5E1] group-hover:bg-[#FD3E06]/50 transition-colors" />
              </div>

              {/* Panels row */}
              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 border-r border-[#E2E8F0]">
                  <AlertPanel alerts={alerts} title="All Events" />
                </div>
                <div className="flex-1">
                  <AlertPanel
                    alerts={alerts}
                    title={selectedRobotId ? `Event Log — ${selectedRobotId}` : "Event Log"}
                    selectedRobotId={selectedRobotId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
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
      </div>

      {/* Robot Add/Edit Dialog */}
      <RobotFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveRobot}
        onDelete={handleDeleteRobot}
        robot={editingRobot}
        existingIds={robots.map((r) => r.id)}
      />
    </div>
  );
}
