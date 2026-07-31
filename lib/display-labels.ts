export type MetricTone =
    | "default"
    | "brand"
    | "success"
    | "warning"
    | "danger";

const ROBOT_STATUS_LABELS: Record<string, string> = {
    running: "Đang chạy",
    executing: "Đang thực thi",
    busy: "Đang xử lý",
    idle: "Sẵn sàng",
    ready: "Sẵn sàng",
    standby: "Chờ",
    online: "Trực tuyến",
    connected: "Đã kết nối",
    offline: "Ngoại tuyến",
    disconnected: "Mất kết nối",
    error: "Lỗi",
    fault: "Lỗi",
    failed: "Thất bại",
    warning: "Cảnh báo",
    warn: "Cảnh báo",
    degraded: "Suy giảm",
    paused: "Tạm dừng",
    stopped: "Đã dừng",
    registered: "Đã đăng ký",
    unknown: "Chưa xác định",
};

const COMMAND_STATUS_LABELS: Record<string, string> = {
    completed: "Hoàn tất",
    succeeded: "Thành công",
    success: "Thành công",
    failed: "Thất bại",
    error: "Lỗi",
    rejected: "Bị từ chối",
    pending: "Đang chờ",
    queued: "Đang xếp hàng",
    processing: "Đang xử lý",
    running: "Đang thực thi",
    cancelled: "Đã hủy",
    canceled: "Đã hủy",
};

const COMMAND_TYPE_LABELS: Record<string, string> = {
    start: "Khởi động",
    stop: "Dừng",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    reset: "Đặt lại",
    home: "Về vị trí gốc",
};

export function formatRobotStatus(status: string | null | undefined): string {
    const normalized = status?.trim();
    if (!normalized) return "Chưa xác định";
    return ROBOT_STATUS_LABELS[normalized.toLocaleLowerCase("en")] ?? normalized;
}

export function formatCommandStatus(status: string): string {
    const normalized = status.trim();
    return (
        COMMAND_STATUS_LABELS[normalized.toLocaleLowerCase("en")] ??
        normalized
    );
}

export function formatCommandType(commandType: string): string {
    const normalized = commandType.trim();
    return (
        COMMAND_TYPE_LABELS[normalized.toLocaleLowerCase("en")] ??
        normalized
    );
}

export function formatCollisionWarning(
    value: boolean | null | undefined
): { label: string; tone: MetricTone } {
    if (value === true) {
        return { label: "Có", tone: "danger" };
    }
    if (value === false) {
        return { label: "Không", tone: "success" };
    }
    return { label: "Chưa xác định", tone: "default" };
}

export function formatRobotLimit(maxRobots: number): string {
    if (maxRobots < 0) return "Không giới hạn robot";
    if (maxRobots === 0) return "Không bao gồm robot";
    return `Tối đa ${maxRobots} robot`;
}
