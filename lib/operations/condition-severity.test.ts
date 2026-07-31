import { describe, expect, it } from "vitest";
import { getRobotConditionTone } from "./condition-severity";

describe("current condition severity", () => {
    it.each(["Error", "Fault", "Failed", "Safety Fault"])(
        "classifies %s as an error",
        (status) => {
            expect(
                getRobotConditionTone({
                    status,
                    isOnline: true,
                    collisionWarning: false,
                })
            ).toBe("error");
        }
    );

    it.each(["Warning", "Warn", "Degraded"])(
        "classifies %s as a warning",
        (status) => {
            expect(
                getRobotConditionTone({
                    status,
                    isOnline: true,
                    collisionWarning: false,
                })
            ).toBe("warning");
        }
    );

    it("keeps collision as error and unavailable/offline as warning", () => {
        expect(
            getRobotConditionTone({
                status: "Running",
                isOnline: true,
                collisionWarning: true,
            })
        ).toBe("error");
        expect(getRobotConditionTone(null)).toBe("warning");
        expect(
            getRobotConditionTone({
                status: "Offline",
                isOnline: false,
                collisionWarning: false,
            })
        ).toBe("warning");
    });
});
