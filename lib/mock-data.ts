export type RobotStatus = "running" | "idle" | "error";

export interface RobotData {
  id: string;
  name: string;
  status: RobotStatus;
  temperature: number;
  load: number;
  cycleTime: number;
  position: [number, number, number];
}

export interface AlertMessage {
  id: string;
  robotId: string;
  timestamp: Date;
  type: "info" | "warning" | "error";
  message: string;
}

export const STATUS_COLORS: Record<RobotStatus, string> = {
  running: "#22c55e",
  idle: "#eab308",
  error: "#ef4444",
};

export const STATUS_LABELS: Record<RobotStatus, string> = {
  running: "Running",
  idle: "Idle",
  error: "Error",
};

export const initialRobots: RobotData[] = [
  {
    id: "RA-001",
    name: "Robot Arm Alpha",
    status: "running",
    temperature: 42,
    load: 78,
    cycleTime: 2.4,
    position: [-4, 0, 0],
  },
  {
    id: "RA-002",
    name: "Robot Arm Beta",
    status: "idle",
    temperature: 36,
    load: 0,
    cycleTime: 0,
    position: [0, 0, 0],
  },
  {
    id: "RA-003",
    name: "Robot Arm Gamma",
    status: "running",
    temperature: 55,
    load: 92,
    cycleTime: 1.8,
    position: [4, 0, 0],
  },
];

const alertTemplates = [
  { type: "error" as const, message: "Robot {id} overheating — temperature critical" },
  { type: "info" as const, message: "Robot {id} resumed operation" },
  { type: "warning" as const, message: "Robot {id} load exceeding 90%" },
  { type: "info" as const, message: "Robot {id} cycle completed successfully" },
  { type: "warning" as const, message: "Robot {id} entering idle state" },
  { type: "error" as const, message: "Robot {id} communication timeout" },
  { type: "info" as const, message: "Robot {id} firmware update applied" },
  { type: "warning" as const, message: "Conveyor belt speed reduced near Robot {id}" },
];

export function generateAlert(robotId: string): AlertMessage {
  const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
  return {
    id: crypto.randomUUID(),
    robotId,
    timestamp: new Date(),
    type: template.type,
    message: template.message.replace("{id}", robotId),
  };
}

export function randomStatus(): RobotStatus {
  const statuses: RobotStatus[] = ["running", "running", "running", "idle", "idle", "error"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export function randomTemp(status: RobotStatus): number {
  if (status === "error") return Math.floor(70 + Math.random() * 20);
  if (status === "running") return Math.floor(35 + Math.random() * 25);
  return Math.floor(20 + Math.random() * 10);
}

export function randomLoad(status: RobotStatus): number {
  if (status === "error") return Math.floor(85 + Math.random() * 15);
  if (status === "running") return Math.floor(40 + Math.random() * 55);
  return 0;
}

export function randomCycleTime(status: RobotStatus): number {
  if (status === "running") return +(1 + Math.random() * 3).toFixed(1);
  return 0;
}
