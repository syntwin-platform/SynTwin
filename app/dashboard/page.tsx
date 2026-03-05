"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
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
  const [robots, setRobots] = useState<RobotData[]>(initialRobots);
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>("RA-001");
  const [alerts, setAlerts] = useState<AlertMessage[]>(() => {
    // Seed with a few initial alerts
    return [
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
    ];
  });

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

      // Generate a random alert from a random robot
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

  const handleAddRobot = useCallback(() => {
    setEditingRobot(null);
    setFormOpen(true);
  }, []);

  const handleEditRobot = useCallback((robot: RobotData) => {
    setEditingRobot(robot);
    setFormOpen(true);
  }, []);

  const handleSaveRobot = useCallback((data: RobotData) => {
    setRobots((prev) => {
      const idx = prev.findIndex((r) => r.id === data.id);
      if (idx >= 0) {
        // Update existing
        const next = [...prev];
        next[idx] = { ...next[idx], name: data.name, position: data.position };
        return next;
      }
      // Add new
      return [...prev, data];
    });
    setSelectedRobotId(data.id);
  }, []);

  const handleDeleteRobot = useCallback(
    (id: string) => {
      setRobots((prev) => prev.filter((r) => r.id !== id));
      setAlerts((prev) => prev.filter((a) => a.robotId !== id));
      if (selectedRobotId === id) {
        setSelectedRobotId(null);
      }
    },
    [selectedRobotId]
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center + Bottom */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* 3D Scene */}
            <div className="flex-1 p-3">
              <FactoryScene
                robots={robots}
                selectedRobotId={selectedRobotId}
                onSelectRobot={handleSelectRobot}
              />
            </div>

            {/* Alert Panels: Global + Robot-specific */}
            <div className="h-44 shrink-0 flex">
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

          {/* Right Panel */}
          <RobotPanel
            robots={robots}
            selectedRobotId={selectedRobotId}
            onSelectRobot={handleSelectRobot}
            onAddRobot={handleAddRobot}
            onEditRobot={handleEditRobot}
            onDeleteRobot={handleDeleteRobot}
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
