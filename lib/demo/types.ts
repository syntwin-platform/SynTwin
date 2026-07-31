export interface DemoRobot {
    id: string;
    name: string;
    status: "Đang chạy" | "Sẵn sàng" | "Cảnh báo" | "Ngoại tuyến";
    temperature: number;
    load: number;
    cycleSeconds: number;
    lastSeen: string;
}

export interface DemoPoint {
    time: string;
    throughput: number;
    temperature: number;
    load: number;
}

export interface DemoTelemetryPoint {
    robotId: string;
    timestamp: string;
    temperatureCelsius: number;
    loadPercent: number;
    throughputPerHour: number;
}

export interface DemoAlert {
    id: string;
    robotId: string;
    severity: "Thông tin" | "Cảnh báo" | "Quan trọng";
    message: string;
    timestamp: string;
}

export interface DemoEvent {
    id: string;
    robotId: string;
    type: string;
    message: string;
    timestamp: string;
}

export interface DemoData {
    referenceTime: string;
    factory: {
        id: string;
        name: string;
        shift: string;
    };
    robots: DemoRobot[];
    telemetry: DemoTelemetryPoint[];
    alerts: DemoAlert[];
    events: DemoEvent[];
}
