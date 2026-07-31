import type { DemoData, DemoRobot } from "@/lib/demo/types";

export function summarizeDemoFleet(robots: DemoRobot[]) {
    return {
        total: robots.length,
        online: robots.filter((robot) => robot.status !== "Ngoại tuyến").length,
        warnings: robots.filter((robot) => robot.status === "Cảnh báo").length,
        averageTemperature: Number(
            (
                robots
                    .filter((robot) => robot.temperature > 0)
                    .reduce((sum, robot) => sum + robot.temperature, 0) /
                    Math.max(1, robots.filter((robot) => robot.temperature > 0).length)
            ).toFixed(1)
        ),
    };
}

export function selectDemoFleetSummary(data: DemoData) {
    return {
        total: data.robots.length,
        online: data.robots.filter(
            (robot) =>
                robot.status === "Đang chạy" ||
                robot.status === "Sẵn sàng"
        ).length,
        offline: data.robots.filter(
            (robot) => robot.status === "Ngoại tuyến"
        ).length,
        attention: data.robots.filter(
            (robot) => robot.status === "Cảnh báo"
        ).length,
    };
}

export function selectDemoRobotComparison(data: DemoData) {
    return data.robots.map((robot) => {
        const latest = [...data.telemetry]
            .filter((point) => point.robotId === robot.id)
            .sort((left, right) =>
                right.timestamp.localeCompare(left.timestamp)
            )[0];

        return {
            id: robot.id,
            name: robot.name,
            status: robot.status,
            temperatureCelsius:
                latest?.temperatureCelsius ?? robot.temperature,
            loadPercent: latest?.loadPercent ?? robot.load,
            cycleSeconds: robot.cycleSeconds,
        };
    });
}
