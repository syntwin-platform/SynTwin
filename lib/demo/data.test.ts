import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_DATA, DEMO_REFERENCE_TIME } from "./data";
import {
    selectDemoFleetSummary,
    selectDemoRobotComparison,
} from "./selectors";

describe("deterministic demo domain", () => {
    it("uses one fixed reference time and stable identifiers", () => {
        expect(DEMO_REFERENCE_TIME).toBe("2026-07-31T08:00:00.000Z");
        expect(DEMO_DATA.referenceTime).toBe(DEMO_REFERENCE_TIME);

        const ids = [
            DEMO_DATA.factory.id,
            ...DEMO_DATA.robots.map((robot) => robot.id),
            ...DEMO_DATA.alerts.map((alert) => alert.id),
            ...DEMO_DATA.events.map((event) => event.id),
        ];

        expect(ids.every((id) => id.startsWith("demo-"))).toBe(true);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("contains complete, finite showroom data without hidden live values", () => {
        expect(DEMO_DATA.robots.length).toBeGreaterThanOrEqual(3);
        expect(DEMO_DATA.telemetry.length).toBeGreaterThanOrEqual(8);
        expect(DEMO_DATA.alerts.length).toBeGreaterThan(0);
        expect(DEMO_DATA.events.length).toBeGreaterThan(0);

        for (const point of DEMO_DATA.telemetry) {
            expect(Number.isFinite(point.temperatureCelsius)).toBe(true);
            expect(Number.isFinite(point.loadPercent)).toBe(true);
            expect(Number.isFinite(point.throughputPerHour)).toBe(true);
            expect(point.timestamp).toMatch(/^2026-/);
        }
    });

    it("derives fleet and comparison summaries from the fixed fixture", () => {
        const summary = selectDemoFleetSummary(DEMO_DATA);
        const comparison = selectDemoRobotComparison(DEMO_DATA);

        expect(summary.total).toBe(DEMO_DATA.robots.length);
        expect(
            summary.online + summary.offline + summary.attention
        ).toBe(summary.total);
        expect(comparison).toHaveLength(DEMO_DATA.robots.length);
        expect(
            comparison.every(
                (robot) =>
                    typeof robot.temperatureCelsius === "number" &&
                    typeof robot.loadPercent === "number"
            )
        ).toBe(true);
    });

    it("does not use runtime entropy in the demo fixture", () => {
        const source = readFileSync(
            resolve(import.meta.dirname, "data.ts"),
            "utf8"
        );

        expect(source).not.toMatch(
            /\b(?:Date\.now|Math\.random|crypto\.randomUUID)\b/
        );
        expect(source).not.toMatch(/new Date\s*\(\s*\)/);
    });
});
