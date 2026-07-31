import type { RobotLatestState } from "@/lib/api/robots";

export type ConditionTone = "info" | "warning" | "error";

export function getRobotConditionTone(
    state:
        | Pick<
              RobotLatestState,
              "collisionWarning" | "isOnline" | "status"
          >
        | null
): ConditionTone {
    if (!state) return "warning";
    if (state.collisionWarning === true) return "error";

    const status = state.status.trim().toLocaleLowerCase("en");
    if (/(?:^|[\s_-])(?:error|fault|failed)(?:$|[\s_-])/.test(status)) {
        return "error";
    }
    if (
        /(?:^|[\s_-])(?:warning|warn|degraded)(?:$|[\s_-])/.test(status)
    ) {
        return "warning";
    }
    return state.isOnline ? "info" : "warning";
}
