import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequest } = vi.hoisted(() => ({
    apiRequest: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
    apiRequest,
}));

import {
    buildTelemetryHistoryPath,
    getRobotTelemetryHistory,
} from "./telemetry";

describe("robot telemetry history API", () => {
    beforeEach(() => {
        apiRequest.mockReset();
        apiRequest.mockResolvedValue([]);
    });

    it("serializes every supported query parameter without losing field order", async () => {
        const options = {
            from: "2026-07-31T07:00:00.000Z",
            to: "2026-07-31T08:00:00.000Z",
            intervalSeconds: 30,
            limit: 500,
            runtimeSessionId: "shift A/01",
            fields: [
                "temperature",
                "latency_ms",
                "collision_warning",
                "tcp_x",
            ] as const,
        };

        await getRobotTelemetryHistory("robot/a 01", options);

        expect(apiRequest).toHaveBeenCalledTimes(1);
        const [path] = apiRequest.mock.calls[0] as [string];
        const url = new URL(path, "https://syntwin.test");

        expect(url.pathname).toBe(
            "/api/robots/robot%2Fa%2001/telemetry/history"
        );
        expect(Object.fromEntries(url.searchParams)).toEqual({
            from: options.from,
            to: options.to,
            intervalSeconds: "30",
            limit: "500",
            runtimeSessionId: "shift A/01",
            fields:
                "temperature,latency_ms,collision_warning,tcp_x",
        });
    });

    it("omits absent optional query parameters", () => {
        expect(buildTelemetryHistoryPath("robot-01", {})).toBe(
            "/api/robots/robot-01/telemetry/history"
        );
    });

    it("rejects ranges over seven days and limits over 10000 before requesting", async () => {
        expect(() =>
            buildTelemetryHistoryPath("robot-01", {
                from: "2026-07-01T00:00:00.000Z",
                to: "2026-07-09T00:00:00.000Z",
            })
        ).toThrow(/7 ngày/i);

        await expect(
            getRobotTelemetryHistory("robot-01", { limit: 10_001 })
        ).rejects.toThrow(/10000/);
        expect(apiRequest).not.toHaveBeenCalled();
    });
});
