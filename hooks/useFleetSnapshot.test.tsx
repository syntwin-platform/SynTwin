import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Robot, RobotLatestState } from "@/lib/api/robots";

const api = vi.hoisted(() => ({
    listRobots: vi.fn(),
    getRobotLatestState: vi.fn(),
}));

vi.mock("@/lib/api/robots", () => api);

import { useFleetSnapshot } from "./useFleetSnapshot";

describe("useFleetSnapshot", () => {
    beforeEach(() => {
        api.listRobots.mockReset();
        api.getRobotLatestState.mockReset();
    });

    it("không gọi API khi chưa có công ty", async () => {
        const { result } = renderHook(() => useFleetSnapshot(null));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.items).toEqual([]);
        expect(api.listRobots).not.toHaveBeenCalled();
    });

    it("biểu diễn công ty không có robot bằng danh sách rỗng", async () => {
        api.listRobots.mockResolvedValue([]);
        const { result } = renderHook(() => useFleetSnapshot("company-a"));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBe("");
    });

    it("chỉ giữ dữ liệu cũ khi làm mới cùng một công ty", async () => {
        const robot = createRobot("robot-a", "company-a");
        api.listRobots.mockResolvedValue([robot]);
        api.getRobotLatestState
            .mockResolvedValueOnce(createState(robot.id))
            .mockRejectedValueOnce(new Error("Telemetry timeout"));

        const { result } = renderHook(() =>
            useFleetSnapshot("company-a")
        );
        await waitFor(() =>
            expect(result.current.items[0]?.freshness).toBe("current")
        );

        await act(async () => {
            await result.current.refresh();
        });

        expect(result.current.items[0]).toMatchObject({
            robot: { id: "robot-a" },
            freshness: "stale",
            error: "Telemetry timeout",
        });
        expect(result.current.stale).toBe(true);
    });

    it("không để dữ liệu công ty cũ rò sang công ty mới khi inventory lỗi", async () => {
        const robot = createRobot("robot-a", "company-a");
        api.listRobots
            .mockResolvedValueOnce([robot])
            .mockRejectedValueOnce(new Error("Company B unavailable"));
        api.getRobotLatestState.mockResolvedValue(createState(robot.id));

        const { result, rerender } = renderHook(
            ({ companyId }) => useFleetSnapshot(companyId),
            { initialProps: { companyId: "company-a" as string | null } }
        );
        await waitFor(() => expect(result.current.items).toHaveLength(1));

        rerender({ companyId: "company-b" });
        expect(result.current.items).toEqual([]);
        await waitFor(() =>
            expect(result.current.error).toBe("Company B unavailable")
        );
        expect(result.current.items).toEqual([]);
        expect(result.current.stale).toBe(false);
    });

    it("bỏ qua phản hồi trễ sau khi đổi công ty", async () => {
        let resolveCompanyA: ((robots: Robot[]) => void) | undefined;
        api.listRobots.mockImplementation((companyId: string) => {
            if (companyId === "company-a") {
                return new Promise<Robot[]>((resolve) => {
                    resolveCompanyA = resolve;
                });
            }
            return Promise.resolve([
                createRobot("robot-b", "company-b"),
            ]);
        });
        api.getRobotLatestState.mockImplementation((robotId: string) =>
            Promise.resolve(createState(robotId))
        );

        const { result, rerender } = renderHook(
            ({ companyId }) => useFleetSnapshot(companyId),
            { initialProps: { companyId: "company-a" as string | null } }
        );
        await waitFor(() =>
            expect(api.listRobots).toHaveBeenCalledWith("company-a")
        );
        rerender({ companyId: "company-b" });
        await waitFor(() =>
            expect(result.current.items[0]?.robot.id).toBe("robot-b")
        );

        await act(async () => {
            resolveCompanyA?.([createRobot("robot-a", "company-a")]);
            await Promise.resolve();
        });
        expect(result.current.items[0]?.robot.id).toBe("robot-b");
    });
});

function createRobot(id: string, companyId: string): Robot {
    return {
        id,
        companyId,
        userId: "user-01",
        currentUserRole: "Owner",
        robotName: id.toUpperCase(),
        model: "SynArm A6",
        connectionType: "MQTT",
        status: "Online",
        lastSeenAt: "2026-07-31T08:00:00.000Z",
        ipAddress: null,
        port: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-07-31T08:00:00.000Z",
    };
}

function createState(robotId: string): RobotLatestState {
    return {
        robotId,
        isOnline: true,
        status: "Running",
        tcpPose: null,
        jointAngles: [],
        temperature: 55,
        collisionWarning: false,
        lastSeenAt: "2026-07-31T08:00:00.000Z",
        timestamp: "2026-07-31T08:00:00.000Z",
        source: "fixture",
    };
}
