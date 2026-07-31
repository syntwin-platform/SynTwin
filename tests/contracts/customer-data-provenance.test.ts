import {
    existsSync,
    readFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const paidRouteFiles = [
    "app/dashboard/(workspace)/alerts/page.tsx",
    "app/dashboard/(workspace)/analytics/page.tsx",
];

describe("nguồn dữ liệu của customer workspace", () => {
    it("alerts và analytics không nhập hoặc tạo dữ liệu vận hành giả", () => {
        for (const relativePath of paidRouteFiles) {
            const absolutePath = resolve(
                projectRoot,
                relativePath
            );

            expect(
                existsSync(absolutePath),
                `${relativePath} phải tồn tại`
            ).toBe(true);

            const source = readFileSync(
                absolutePath,
                "utf8"
            );

            expect(source).not.toMatch(
                /@\/lib\/mock-data|ROBOT_LOGS|ANALYTICS_SEEDS|initialRobots|Math\.random|faker/i
            );
        }
    });

    it("xóa module mock vận hành sau khi không còn consumer trả phí", () => {
        expect(
            existsSync(
                resolve(projectRoot, "lib/mock-data.ts")
            )
        ).toBe(false);
    });

    it("paid routes dùng adapter API cho inventory, latest, history và commands", () => {
        const alertSource = readFileSync(
            resolve(projectRoot, paidRouteFiles[0]),
            "utf8"
        );
        const analyticsSource = readFileSync(
            resolve(projectRoot, paidRouteFiles[1]),
            "utf8"
        );
        const fleetSource = readFileSync(
            resolve(
                projectRoot,
                "hooks/useFleetSnapshot.ts"
            ),
            "utf8"
        );

        expect(fleetSource).toContain("listRobots");
        expect(fleetSource).toContain(
            "getRobotLatestState"
        );
        expect(analyticsSource).toContain(
            "getRobotTelemetryHistory"
        );
        expect(alertSource).toContain(
            "listRobotCommands"
        );
    });
});
