import { describe, expect, it } from "vitest";
import type { Robot, RobotLatestState } from "@/lib/api/robots";
import {
    mergeFleetState,
    selectFleetSummary,
    type FleetRobotSnapshot,
} from "./fleet-selectors";

const OBSERVED_AT = "2026-07-31T08:01:00.000Z";

const robots: Robot[] = [
    createRobot("robot-a", "RA-001"),
    createRobot("robot-b", "RA-002"),
];

const stateA = createState("robot-a", {
    isOnline: true,
    status: "Running",
    temperature: 61.8,
    collisionWarning: false,
});

const stateB = createState("robot-b", {
    isOnline: false,
    status: "Offline",
    temperature: 42.1,
    collisionWarning: true,
});

describe("fleet selectors", () => {
    it("keeps fulfilled states current and preserves a failed robot's last good state as stale", () => {
        const previous = new Map<string, FleetRobotSnapshot>([
            [
                "robot-b",
                {
                    robot: robots[1],
                    state: stateB,
                    freshness: "current",
                    observedAt: "2026-07-31T08:00:00.000Z",
                    error: null,
                },
            ],
        ]);

        const result = mergeFleetState({
            robots,
            settledStates: [
                { status: "fulfilled", value: stateA },
                {
                    status: "rejected",
                    reason: new Error("Telemetry timeout"),
                },
            ],
            previousByRobotId: previous,
            observedAt: OBSERVED_AT,
        });

        expect(result.failureCount).toBe(1);
        expect(result.allFailed).toBe(false);
        expect(result.snapshots[0]).toMatchObject({
            robot: { id: "robot-a" },
            state: stateA,
            freshness: "current",
            observedAt: OBSERVED_AT,
            error: null,
        });
        expect(result.snapshots[1]).toMatchObject({
            robot: { id: "robot-b" },
            state: stateB,
            freshness: "stale",
            observedAt: "2026-07-31T08:00:00.000Z",
            error: "Telemetry timeout",
        });
    });

    it("represents a first-load failure as unavailable instead of zero", () => {
        const result = mergeFleetState({
            robots,
            settledStates: robots.map(() => ({
                status: "rejected" as const,
                reason: new Error("Gateway unavailable"),
            })),
            previousByRobotId: new Map(),
            observedAt: OBSERVED_AT,
        });

        expect(result.allFailed).toBe(true);
        expect(result.snapshots).toHaveLength(2);
        expect(
            result.snapshots.every(
                (snapshot) =>
                    snapshot.state === null &&
                    snapshot.freshness === "unavailable"
            )
        ).toBe(true);

        const summary = selectFleetSummary(result.snapshots);
        expect(summary.averageTemperatureCelsius).toBeNull();
        expect(summary.online).toBe(0);
        expect(summary.unknown).toBe(2);
    });

    it("derives only current facts and excludes stale values from live totals", () => {
        const snapshots: FleetRobotSnapshot[] = [
            {
                robot: robots[0],
                state: stateA,
                freshness: "current",
                observedAt: OBSERVED_AT,
                error: null,
            },
            {
                robot: robots[1],
                state: stateB,
                freshness: "stale",
                observedAt: "2026-07-31T08:00:00.000Z",
                error: "Telemetry timeout",
            },
        ];

        expect(selectFleetSummary(snapshots)).toEqual({
            total: 2,
            online: 1,
            offline: 0,
            attention: 0,
            unknown: 1,
            collisionWarnings: 0,
            averageTemperatureCelsius: 61.8,
        });
    });

    it("drops snapshots that do not belong to the newly selected company", () => {
        const previous = new Map<string, FleetRobotSnapshot>([
            [
                "robot-from-old-company",
                {
                    robot: createRobot(
                        "robot-from-old-company",
                        "OLD-001"
                    ),
                    state: createState("robot-from-old-company"),
                    freshness: "current",
                    observedAt: OBSERVED_AT,
                    error: null,
                },
            ],
        ]);

        const result = mergeFleetState({
            robots: [robots[0]],
            settledStates: [
                { status: "fulfilled", value: stateA },
            ],
            previousByRobotId: previous,
            observedAt: OBSERVED_AT,
        });

        expect(result.snapshots.map(({ robot }) => robot.id)).toEqual([
            "robot-a",
        ]);
    });
});

function createRobot(id: string, robotName: string): Robot {
    return {
        id,
        userId: "user-01",
        companyId: "company-01",
        currentUserRole: "Owner",
        robotName,
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

function createState(
    robotId: string,
    overrides: Partial<RobotLatestState> = {}
): RobotLatestState {
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
        ...overrides,
    };
}
