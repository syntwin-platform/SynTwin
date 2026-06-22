import { apiRequest } from "@/lib/api/client";

// ────────────────────────────────────────────────────────────
// Device — Types
// ────────────────────────────────────────────────────────────

/**
 * Device API sử dụng xác thực bằng cặp Header:
 *  X-Robot-Id: <robotId>
 *  X-Device-Secret: <deviceSecret>
 * thay vì Bearer token.
 *
 * Dùng `authenticated: false` và truyền headers thủ công.
 */

export interface DeviceTelemetryInput {
  /** Góc các khớp robot (đơn vị: độ) */
  jointAngles?: number[];
  /** TCP pose trong không gian 3D */
  tcpPose?: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
  };
  /** Nhiệt độ thiết bị (°C) */
  temperature?: number | null;
  /** Cảnh báo va chạm */
  collisionWarning?: boolean | null;
}

export interface DevicePendingCommand {
  id: string;
  commandType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any | null;
  createdAt: string;
}

export interface DeviceCommandResultInput {
  commandId: string;
  success: boolean;
  /** Thông tin kết quả tuỳ chọn */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result?: any;
  errorMessage?: string | null;
}

export interface DeviceCommandResultResponse {
  commandId: string;
  success: boolean;
  processedAt: string;
}

// ────────────────────────────────────────────────────────────
// Device — Helper to build device auth headers
// ────────────────────────────────────────────────────────────

function deviceHeaders(robotId: string, deviceSecret: string): HeadersInit {
  return {
    "X-Robot-Id": robotId,
    "X-Device-Secret": deviceSecret,
  };
}

// ────────────────────────────────────────────────────────────
// Device — API Functions
// ────────────────────────────────────────────────────────────

/** Gửi heartbeat từ thiết bị robot. */
export function sendDeviceHeartbeat(
  robotId: string,
  deviceSecret: string
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/device/heartbeat", {
    method: "POST",
    authenticated: false,
    headers: deviceHeaders(robotId, deviceSecret),
  });
}

/** Gửi dữ liệu telemetry từ thiết bị robot. */
export function sendDeviceTelemetry(
  robotId: string,
  deviceSecret: string,
  input: DeviceTelemetryInput
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/device/telemetry", {
    method: "POST",
    authenticated: false,
    headers: deviceHeaders(robotId, deviceSecret),
    body: JSON.stringify(input),
  });
}

/** Lấy lệnh đang chờ thực thi trên thiết bị. */
export function getDevicePendingCommand(
  robotId: string,
  deviceSecret: string,
  isBusy: boolean = false
): Promise<DevicePendingCommand | null> {
  return apiRequest<DevicePendingCommand | null>(
    `/api/device/commands/pending?isBusy=${isBusy}`,
    {
      authenticated: false,
      headers: deviceHeaders(robotId, deviceSecret),
    }
  );
}

/** Báo cáo kết quả sau khi thực thi lệnh. */
export function submitDeviceCommandResult(
  robotId: string,
  deviceSecret: string,
  input: DeviceCommandResultInput
): Promise<DeviceCommandResultResponse> {
  return apiRequest<DeviceCommandResultResponse>("/api/device/commands/result", {
    method: "POST",
    authenticated: false,
    headers: deviceHeaders(robotId, deviceSecret),
    body: JSON.stringify(input),
  });
}
