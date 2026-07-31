import { apiRequest } from "@/lib/api/client";
import type { TcpPose } from "@/lib/api/robots";

export interface TelemetryHistoryPoint {
    timestamp: string;
    jointAngles: number[];
    tcpPose: TcpPose | null;
    sequenceNumber: number | null;
    latencyMilliseconds: number | null;
    temperature: number | null;
    collisionWarning: boolean | null;
    status: string | null;
    source: string;
}

export type TelemetryHistoryField =
    | "joint1"
    | "joint2"
    | "joint3"
    | "joint4"
    | "joint5"
    | "joint6"
    | "tcp_x"
    | "tcp_y"
    | "tcp_z"
    | "tcp_rx"
    | "tcp_ry"
    | "tcp_rz"
    | "sequence_number"
    | "latency_ms"
    | "temperature"
    | "collision_warning"
    | "status_code";

export interface TelemetryHistoryQuery {
    from?: string; to?: string; intervalSeconds?: number; limit?: number;
    runtimeSessionId?: string; fields?: readonly TelemetryHistoryField[];
}

export function buildTelemetryHistoryPath(robotId:string, query:TelemetryHistoryQuery={}):string {
    if (query.limit !== undefined && (query.limit < 1 || query.limit > 10_000)) {
        throw new Error("Giới hạn lịch sử phải nằm trong khoảng 1 đến 10000.");
    }
    if (query.from && query.to) {
        const from = Date.parse(query.from);
        const to = Date.parse(query.to);
        if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
            throw new Error("Khoảng thời gian lịch sử không hợp lệ.");
        }
        if (to - from > 7 * 24 * 60 * 60 * 1000) {
            throw new Error("Khoảng thời gian lịch sử không được vượt quá 7 ngày.");
        }
    }
    const params=new URLSearchParams();
    if(query.from)params.set("from",query.from); if(query.to)params.set("to",query.to);
    if(query.intervalSeconds!==undefined)params.set("intervalSeconds",String(query.intervalSeconds));
    if(query.limit!==undefined)params.set("limit",String(query.limit));
    if(query.runtimeSessionId)params.set("runtimeSessionId",query.runtimeSessionId);
    if(query.fields?.length)params.set("fields",query.fields.join(","));
    const suffix=params.size?`?${params.toString()}`:"";
    return `/api/robots/${encodeURIComponent(robotId)}/telemetry/history${suffix}`;
}

export async function getRobotTelemetryHistory(robotId:string, query:TelemetryHistoryQuery={}):Promise<TelemetryHistoryPoint[]>{
    return apiRequest(buildTelemetryHistoryPath(robotId, query));
}
