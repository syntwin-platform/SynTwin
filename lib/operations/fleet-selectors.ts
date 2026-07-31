import type { Robot, RobotLatestState } from "@/lib/api/robots";

export type FleetFreshness = "current" | "stale" | "unavailable";

export interface FleetRobotSnapshot {
    robot: Robot;
    state: RobotLatestState | null;
    freshness: FleetFreshness;
    observedAt: string | null;
    error: string | null;
}

interface MergeFleetStateInput {
    robots: Robot[];
    settledStates: PromiseSettledResult<RobotLatestState>[];
    previousByRobotId: Map<string, FleetRobotSnapshot>;
    observedAt: string;
}

function errorMessage(reason: unknown): string {
    return reason instanceof Error
        ? reason.message
        : "Không thể đọc trạng thái robot.";
}

export function mergeFleetState({
    robots,
    settledStates,
    previousByRobotId,
    observedAt,
}: MergeFleetStateInput) {
    let failureCount = 0;
    const snapshots = robots.map((robot, index): FleetRobotSnapshot => {
        const result = settledStates[index];
        if (result?.status === "fulfilled") {
            return {
                robot,
                state: result.value,
                freshness: "current",
                observedAt,
                error: null,
            };
        }

        failureCount += 1;
        const previous = previousByRobotId.get(robot.id);
        return previous?.state
            ? {
                  robot,
                  state: previous.state,
                  freshness: "stale",
                  observedAt: previous.observedAt,
                  error: errorMessage(result?.reason),
              }
            : {
                  robot,
                  state: null,
                  freshness: "unavailable",
                  observedAt: null,
                  error: errorMessage(result?.reason),
              };
    });

    return {
        snapshots,
        failureCount,
        allFailed: robots.length > 0 && failureCount === robots.length,
    };
}

export function selectFleetSummary(items: FleetRobotSnapshot[]) {
    const current = items.filter(
        (item) => item.freshness === "current" && item.state
    );
    const temperatures = current
        .map((item) => item.state?.temperature)
        .filter((value): value is number => typeof value === "number");

    return {
        total: items.length,
        online: current.filter((item) => item.state?.isOnline).length,
        offline: current.filter((item) => !item.state?.isOnline).length,
        attention: current.filter(
            (item) =>
                item.state?.collisionWarning ||
                /warning|error|fault/i.test(item.state?.status ?? "")
        ).length,
        unknown: items.length - current.length,
        collisionWarnings: current.filter(
            (item) => item.state?.collisionWarning
        ).length,
        averageTemperatureCelsius: temperatures.length
            ? Number(
                  (
                      temperatures.reduce(
                          (sum, temperature) => sum + temperature,
                          0
                      ) / temperatures.length
                  ).toFixed(1)
              )
            : null,
    };
}
