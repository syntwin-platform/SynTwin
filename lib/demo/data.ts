import type {
    DemoData,
    DemoPoint,
    DemoRobot,
} from "@/lib/demo/types";

export const DEMO_REFERENCE_TIME = "2026-07-31T08:00:00.000Z";
export const DEMO_TIMESTAMP = DEMO_REFERENCE_TIME;

export const demoRobots: DemoRobot[] = [
    { id: "demo-ra-001", name: "RA-001", status: "Đang chạy", temperature: 61.8, load: 72, cycleSeconds: 18.4, lastSeen: DEMO_TIMESTAMP },
    { id: "demo-ra-002", name: "RA-002", status: "Sẵn sàng", temperature: 54.2, load: 44, cycleSeconds: 21.1, lastSeen: DEMO_TIMESTAMP },
    { id: "demo-ra-003", name: "RA-003", status: "Cảnh báo", temperature: 68.4, load: 86, cycleSeconds: 20.6, lastSeen: DEMO_TIMESTAMP },
    { id: "demo-ra-004", name: "RA-004", status: "Ngoại tuyến", temperature: 0, load: 0, cycleSeconds: 0, lastSeen: "2026-07-31T07:42:00.000Z" },
];

export const demoTrend: DemoPoint[] = [
    { time: "07:10", throughput: 42, temperature: 55, load: 58 },
    { time: "07:20", throughput: 45, temperature: 57, load: 62 },
    { time: "07:30", throughput: 43, temperature: 56, load: 60 },
    { time: "07:40", throughput: 48, temperature: 60, load: 68 },
    { time: "07:50", throughput: 51, temperature: 63, load: 74 },
    { time: "08:00", throughput: 49, temperature: 62, load: 71 },
];

export const DEMO_DATA: DemoData = {
    referenceTime: DEMO_REFERENCE_TIME,
    factory: {
        id: "demo-factory-01",
        name: "Nhà máy minh họa SynTwin",
        shift: "Ca sáng",
    },
    robots: demoRobots,
    telemetry: [
        { robotId: "demo-ra-001", timestamp: "2026-07-31T07:30:00.000Z", temperatureCelsius: 57.2, loadPercent: 63, throughputPerHour: 43 },
        { robotId: "demo-ra-002", timestamp: "2026-07-31T07:30:00.000Z", temperatureCelsius: 51.4, loadPercent: 39, throughputPerHour: 39 },
        { robotId: "demo-ra-003", timestamp: "2026-07-31T07:30:00.000Z", temperatureCelsius: 64.8, loadPercent: 79, throughputPerHour: 41 },
        { robotId: "demo-ra-004", timestamp: "2026-07-31T07:30:00.000Z", temperatureCelsius: 45.1, loadPercent: 18, throughputPerHour: 12 },
        { robotId: "demo-ra-001", timestamp: DEMO_REFERENCE_TIME, temperatureCelsius: 61.8, loadPercent: 72, throughputPerHour: 49 },
        { robotId: "demo-ra-002", timestamp: DEMO_REFERENCE_TIME, temperatureCelsius: 54.2, loadPercent: 44, throughputPerHour: 46 },
        { robotId: "demo-ra-003", timestamp: DEMO_REFERENCE_TIME, temperatureCelsius: 68.4, loadPercent: 86, throughputPerHour: 44 },
        { robotId: "demo-ra-004", timestamp: DEMO_REFERENCE_TIME, temperatureCelsius: 45.1, loadPercent: 0, throughputPerHour: 0 },
    ],
    alerts: [
        { id: "demo-alert-01", robotId: "demo-ra-003", severity: "Cảnh báo", message: "Nhiệt độ mô phỏng vượt ngưỡng theo dõi.", timestamp: "2026-07-31T07:58:00.000Z" },
        { id: "demo-alert-02", robotId: "demo-ra-004", severity: "Quan trọng", message: "Robot chuyển sang ngoại tuyến trong kịch bản.", timestamp: "2026-07-31T07:42:00.000Z" },
    ],
    events: [
        { id: "demo-event-01", robotId: "demo-ra-002", type: "Chu kỳ", message: "RA-002 hoàn tất chu kỳ mô phỏng.", timestamp: "2026-07-31T07:46:00.000Z" },
        { id: "demo-event-02", robotId: "demo-ra-001", type: "Trạng thái", message: "RA-001 tiếp tục hoạt động ổn định.", timestamp: "2026-07-31T07:39:00.000Z" },
    ],
};

export const demoEvents = [
    ...DEMO_DATA.alerts.map((alert) => ({
        id: alert.id,
        time: alert.timestamp.slice(11, 16),
        severity: alert.severity,
        message: alert.message,
    })),
    ...DEMO_DATA.events.map((event) => ({
        id: event.id,
        time: event.timestamp.slice(11, 16),
        severity: event.type,
        message: event.message,
    })),
];
