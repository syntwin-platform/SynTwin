import { apiRequest } from "@/lib/api/client";

// ────────────────────────────────────────────────────────────
// Robots — Types
// ────────────────────────────────────────────────────────────

export interface TcpPose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

export interface Robot {
  id: string;
  userId: string;
  companyId: string;
  currentUserRole: string;
  robotName: string;
  model: string;
  connectionType: string;
  status: string;
  lastSeenAt: string | null;
  ipAddress: string | null;
  port: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateRobotResponse {
  robot: Robot;
  deviceSecret: string;
}

export interface RobotLatestState {
  robotId: string;
  isOnline: boolean;
  status: string;
  tcpPose: TcpPose | null;
  jointAngles: number[];
  temperature: number | null;
  collisionWarning: boolean | null;
  lastSeenAt: string | null;
  timestamp: string | null;
  source: string;
}

export interface ResetDeviceSecretResponse {
  robotId: string;
  deviceSecret: string;
  updatedAt: string;
}

export interface CreateRobotInput {
  companyId: string;
  robotName: string;
  model: string;
  connectionType?: string;
  ipAddress?: string | null;
  port?: number | null;
}

export interface UpdateRobotInput {
  robotName: string;
  model: string;
  connectionType?: string;
  ipAddress?: string | null;
  port?: number | null;
}

// ────────────────────────────────────────────────────────────
// RobotCommands — Types
// ────────────────────────────────────────────────────────────

export interface RobotCommand {
  id: string;
  robotId: string;
  commandType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any | null;
  status: string;
  createdAt: string;
}

export interface CreateRobotCommandInput {
  commandType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

// ────────────────────────────────────────────────────────────
// RobotPrograms — Types
// ────────────────────────────────────────────────────────────

export interface RobotProgramStep {
  id: string;
  orderIndex: number;
  stepType: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  createdAt: string;
}

export interface RobotProgram {
  id: string;
  robotId: string;
  name: string;
  status: string;
  source: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string | null;
  steps: RobotProgramStep[];
}

export interface RobotProgramStepInput {
  orderIndex: number;
  stepType: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export interface CreateRobotProgramInput {
  name: string;
  status?: string;
  source?: string;
  steps: RobotProgramStepInput[];
}

export interface UpdateRobotProgramInput {
  name: string;
  status?: string;
  steps: RobotProgramStepInput[];
}

// ────────────────────────────────────────────────────────────
// Robots — API Functions
// ────────────────────────────────────────────────────────────

export function listRobots(companyId?: string): Promise<Robot[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : "";
  return apiRequest<Robot[]>(`/api/robots${query}`);
}

export function getRobotById(id: string): Promise<Robot> {
  return apiRequest<Robot>(`/api/robots/${id}`);
}

export function createRobot(input: CreateRobotInput): Promise<CreateRobotResponse> {
  return apiRequest<CreateRobotResponse>("/api/robots", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateRobot(id: string, input: UpdateRobotInput): Promise<Robot> {
  return apiRequest<Robot>(`/api/robots/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteRobot(id: string): Promise<void> {
  return apiRequest<void>(`/api/robots/${id}`, {
    method: "DELETE",
  });
}

export function getRobotLatestState(id: string): Promise<RobotLatestState> {
  return apiRequest<RobotLatestState>(`/api/robots/${id}/state/latest`);
}

export function resetRobotDeviceSecret(id: string): Promise<ResetDeviceSecretResponse> {
  return apiRequest<ResetDeviceSecretResponse>(`/api/robots/${id}/device-secret/reset`, {
    method: "POST",
  });
}

// ────────────────────────────────────────────────────────────
// RobotCommands — API Functions
// ────────────────────────────────────────────────────────────

export function createRobotCommand(
  robotId: string,
  input: CreateRobotCommandInput
): Promise<RobotCommand> {
  return apiRequest<RobotCommand>(`/api/robots/${robotId}/commands`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listRobotCommands(robotId: string): Promise<RobotCommand[]> {
  return apiRequest<RobotCommand[]>(`/api/robots/${robotId}/commands`);
}

// ────────────────────────────────────────────────────────────
// RobotPrograms — API Functions
// ────────────────────────────────────────────────────────────

export function listRobotPrograms(robotId: string): Promise<RobotProgram[]> {
  return apiRequest<RobotProgram[]>(`/api/robots/${robotId}/programs`);
}

export function getRobotProgramById(
  robotId: string,
  programId: string
): Promise<RobotProgram> {
  return apiRequest<RobotProgram>(`/api/robots/${robotId}/programs/${programId}`);
}

export function createRobotProgram(
  robotId: string,
  input: CreateRobotProgramInput
): Promise<RobotProgram> {
  return apiRequest<RobotProgram>(`/api/robots/${robotId}/programs`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateRobotProgram(
  robotId: string,
  programId: string,
  input: UpdateRobotProgramInput
): Promise<RobotProgram> {
  return apiRequest<RobotProgram>(`/api/robots/${robotId}/programs/${programId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function deleteRobotProgram(robotId: string, programId: string): Promise<void> {
  return apiRequest<void>(`/api/robots/${robotId}/programs/${programId}`, {
    method: "DELETE",
  });
}

export function publishRobotProgram(
  robotId: string,
  programId: string
): Promise<RobotProgram> {
  return apiRequest<RobotProgram>(
    `/api/robots/${robotId}/programs/${programId}/publish`,
    { method: "POST" }
  );
}
