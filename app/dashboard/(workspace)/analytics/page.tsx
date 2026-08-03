"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ChartPanel } from "@/components/shared/ChartPanel";
import { DataState } from "@/components/shared/DataState";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { MetricCell } from "@/components/shared/MetricCell";
import { SourceContext } from "@/components/shared/SourceContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useFleetSnapshot } from "@/hooks/useFleetSnapshot";
import { useSession } from "@/hooks/useSession";
import {
    getRobotTelemetryHistory,
    type TelemetryHistoryPoint,
} from "@/lib/api/telemetry";
import { useCompany } from "@/lib/company-context";
import {
    formatCollisionWarning,
    formatRobotStatus,
} from "@/lib/display-labels";

export default function AnalyticsPage() {
    const session = useSession();
    const { selectedCompany, companyError } = useCompany();
    const fleet = useFleetSnapshot(selectedCompany?.id ?? null);
    const [requestedRobotId, setRequestedRobotId] = useState("");
    const selectedSnapshot =
        fleet.items.find((item) => item.robot.id === requestedRobotId) ??
        fleet.items[0] ??
        null;
    const [historyState, setHistoryState] = useState<{
        robotId: string;
        points: TelemetryHistoryPoint[] | null;
        error: string;
    }>({ robotId: "", points: null, error: "" });

    const [streamBuffer, setStreamBuffer] = useState<{
        robotId: string;
        points: TelemetryHistoryPoint[];
    }>({ robotId: "", points: [] });

    const activeRobotId = selectedSnapshot?.robot.id ?? null;

    useEffect(() => {
        let cancelled = false;
        if (!activeRobotId) return;

        void getRobotTelemetryHistory(activeRobotId, {
            limit: 500,
            fields: [
                "temperature",
                "latency_ms",
                "status_code",
                "collision_warning",
                "joint1",
                "joint2",
                "joint3",
                "joint4",
                "joint5",
                "joint6",
                "tcp_x",
                "tcp_y",
                "tcp_z",
                "tcp_rx",
                "tcp_ry",
                "tcp_rz",
            ],
        })
            .then((points) => {
                if (!cancelled) {
                    setHistoryState({
                        robotId: activeRobotId,
                        points,
                        error: "",
                    });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setHistoryState({
                        robotId: activeRobotId,
                        points: null,
                        error:
                            error instanceof Error
                                ? error.message
                                : "Không thể tải lịch sử đo đạc.",
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [activeRobotId]);

    // Append incoming real-time telemetry snapshots without page reloads
    useEffect(() => {
        if (!selectedSnapshot?.state || !activeRobotId) return;
        const state = selectedSnapshot.state;

        const livePoint: TelemetryHistoryPoint = {
            timestamp: state.timestamp || state.lastSeenAt || new Date().toISOString(),
            jointAngles: state.jointAngles || [],
            tcpPose: state.tcpPose,
            sequenceNumber: state.sequenceNumber ?? null,
            latencyMilliseconds: state.latencyMilliseconds ?? null,
            temperature: state.temperature ?? null,
            collisionWarning: state.collisionWarning ?? null,
            status: state.status ?? null,
            source: state.source || "LiveStream",
        };

        setStreamBuffer((prev) => {
            if (prev.robotId !== activeRobotId) {
                return { robotId: activeRobotId, points: [livePoint] };
            }
            const lastTs = prev.points.at(-1)?.timestamp;
            if (lastTs === livePoint.timestamp) {
                return prev;
            }
            const updated = [...prev.points, livePoint].slice(-100);
            return { robotId: activeRobotId, points: updated };
        });
    }, [selectedSnapshot?.state, activeRobotId]);

    if (!session) return null;

    const rawHistory =
        historyState.robotId === selectedSnapshot?.robot.id
            ? historyState.points
            : null;

    const livePoints =
        streamBuffer.robotId === selectedSnapshot?.robot.id
            ? streamBuffer.points
            : [];

    const history = (() => {
        if (livePoints.length > 0) {
            if (!rawHistory || rawHistory.length === 0) {
                return livePoints;
            }
            const existingTs = new Set(rawHistory.map((p) => p.timestamp));
            const newLive = livePoints.filter((p) => !existingTs.has(p.timestamp));
            return [...rawHistory, ...newLive];
        }
        return rawHistory;
    })();

    const validLatencies = (history ?? [])
        .map((p) => p.latencyMilliseconds)
        .filter((l): l is number => typeof l === "number" && l >= 0);
    const avgLatencyMs = validLatencies.length > 0
        ? Math.round((validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) * 10) / 10
        : null;

    const chartData = (history ?? []).map((p) => ({
        ...p,
        avgLatencyMs: avgLatencyMs ?? p.latencyMilliseconds,
    }));

    const historyError =
        historyState.robotId === selectedSnapshot?.robot.id
            ? historyState.error
            : "";
    const latestHistory = history?.at(-1) ?? null;
    const collision = formatCollisionWarning(
        selectedSnapshot?.state?.collisionWarning
    );

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
            <div className="hidden sm:block">
                <Sidebar />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} />
                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-20 sm:px-6 sm:pb-6">
                    <div className="mx-auto max-w-[1500px] space-y-6">
                        <header className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">
                                    Phân tích có nguồn
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                                    Phân tích robot
                                </h1>
                                <p className="mt-1 text-sm text-subtle">
                                    {selectedCompany?.name ??
                                        "Chọn công ty để xem dữ liệu."}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <label className="text-xs font-medium text-steel">
                                    <span className="sr-only">Chọn robot</span>
                                    <select
                                        value={selectedSnapshot?.robot.id ?? ""}
                                        onChange={(event) =>
                                            setRequestedRobotId(event.target.value)
                                        }
                                        disabled={fleet.items.length === 0}
                                        className="h-11 min-w-52 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-brand"
                                    >
                                        {fleet.items.map(({ robot }) => (
                                            <option key={robot.id} value={robot.id}>
                                                {robot.robotName} · {robot.model}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => void fleet.refresh()}
                                    disabled={fleet.loading || !selectedCompany}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-steel disabled:opacity-50"
                                >
                                    <RefreshCw className={fleet.loading ? "size-4 animate-spin" : "size-4"} />
                                    Làm mới
                                </button>
                            </div>
                        </header>

                        {companyError && <FeedbackBanner tone="error">{companyError}</FeedbackBanner>}
                        {fleet.error && <FeedbackBanner tone={fleet.stale ? "warning" : "error"}>{fleet.error}</FeedbackBanner>}
                        {historyError && <FeedbackBanner tone="warning">{historyError}</FeedbackBanner>}

                        {fleet.loading ? (
                            <DataState state="loading" title="Đang tải dữ liệu phân tích" />
                        ) : !selectedCompany ? (
                            <DataState state="empty" title="Chưa có công ty được chọn" description="Chọn công ty để xem trạng thái robot." />
                        ) : fleet.items.length === 0 ? (
                            <DataState state="empty" title="Chưa có robot để phân tích" description="Đăng ký robot trước khi xem dữ liệu." />
                        ) : (
                            <>
                                <section className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
                                    <MetricCell
                                        label="Trạng thái hiện tại"
                                        value={formatRobotStatus(
                                            selectedSnapshot?.state?.status
                                        )}
                                        tone={selectedSnapshot?.state?.isOnline ? "success" : "warning"}
                                    />
                                    <MetricCell
                                        label="Nhiệt độ hiện tại"
                                        value={selectedSnapshot?.state?.temperature ?? "—"}
                                        unit={typeof selectedSnapshot?.state?.temperature === "number" ? "°C" : undefined}
                                    />
                                    <MetricCell
                                        label="Độ trễ nhận dữ liệu"
                                        value={selectedSnapshot?.state?.latencyMilliseconds ?? "—"}
                                        unit={typeof selectedSnapshot?.state?.latencyMilliseconds === "number" ? "ms" : undefined}
                                    />
                                    <MetricCell
                                        label="Độ trễ trung bình"
                                        value={avgLatencyMs ?? "—"}
                                        unit={typeof avgLatencyMs === "number" ? "ms" : undefined}
                                    />
                                    <MetricCell
                                        label="Cảnh báo va chạm"
                                        value={collision.label}
                                        tone={collision.tone}
                                    />
                                </section>

                                <section className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
                                    <ChartPanel
                                        title="Lịch sử độ trễ nhận dữ liệu theo thời gian"
                                        description="Lịch sử độ trễ đo đạc tính bằng miligiây (ms); không nội suy khi thiếu dữ liệu"
                                        meta={chartData ? `${chartData.length} điểm` : "Đang kiểm tra"}
                                    >
                                        {chartData && chartData.length > 0 ? (
                                            <div className="h-72" role="img" aria-label="Biểu đồ lịch sử độ trễ robot">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={chartData}>
                                                        <CartesianGrid stroke="#E2E8F0" vertical={false} />
                                                        <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} tick={{ fontSize: 10 }} />
                                                        <YAxis tick={{ fontSize: 10 }} />
                                                        <Tooltip labelFormatter={(value) => new Date(value).toLocaleString("vi-VN")} />
                                                        <Line isAnimationActive={false} type="monotone" dataKey="latencyMilliseconds" name="Độ trễ ms" stroke="#2563EB" connectNulls={false} dot={false} />
                                                        <Line isAnimationActive={false} type="monotone" dataKey="avgLatencyMs" name="Độ trễ trung bình ms" stroke="#059669" strokeDasharray="3 3" connectNulls={false} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <p className="py-16 text-center text-sm text-subtle">
                                                Chưa có dữ liệu lịch sử từ hệ thống telemetry.
                                            </p>
                                        )}
                                        <SourceContext source="API lịch sử đo đạc robot" updatedAt={latestHistory?.timestamp ?? null} scope="Tối đa 500 điểm, tối đa 7 ngày theo backend" />
                                    </ChartPanel>

                                    <article className="border border-line bg-surface">
                                        <div className="border-b border-line px-4 py-3">
                                            <h2 className="text-sm font-semibold text-ink">
                                                Tọa độ và khớp mới nhất
                                            </h2>
                                            <p className="mt-1 text-xs text-subtle">
                                                Trạng thái mới nhất từ robot đang chọn
                                            </p>
                                        </div>
                                        <dl className="divide-y divide-line text-xs">
                                            <DetailRow label="Tọa độ TCP" value={formatPose(selectedSnapshot?.state?.tcpPose ?? latestHistory?.tcpPose ?? null)} />
                                            <DetailRow label="Góc khớp" value={formatJoints(selectedSnapshot?.state?.jointAngles ?? latestHistory?.jointAngles ?? [])} />
                                            <DetailRow label="Số thứ tự" value={String(selectedSnapshot?.state?.sequenceNumber ?? latestHistory?.sequenceNumber ?? "—")} />
                                            <DetailRow label="Nguồn" value={selectedSnapshot?.state?.source ?? latestHistory?.source ?? "Chưa có"} />
                                        </dl>
                                    </article>
                                </section>

                                <section>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h2 className="text-sm font-semibold text-ink">
                                            So sánh trạng thái hiện tại
                                        </h2>
                                        <StatusBadge tone="neutral">
                                            Ảnh chụp mới nhất
                                        </StatusBadge>
                                    </div>
                                    <div className="overflow-x-auto border border-line bg-surface">
                                        <table className="w-full min-w-[680px] text-left text-sm">
                                            <thead className="bg-canvas text-xs text-subtle">
                                                <tr>
                                                    {["Robot", "Kết nối", "Trạng thái", "Nhiệt độ", "Độ trễ", "Cập nhật"].map((label) => (
                                                        <th key={label} className="border-b border-line px-4 py-3 font-medium">{label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {fleet.items.map(({ robot, state, freshness, observedAt }) => (
                                                    <tr key={robot.id}>
                                                        <td className="px-4 py-3 font-telemetry text-xs font-semibold text-ink">{robot.robotName}</td>
                                                        <td className="px-4 py-3">{state ? state.isOnline ? "Trực tuyến" : "Ngoại tuyến" : "Chưa xác định"}</td>
                                                        <td className="px-4 py-3">{formatRobotStatus(state?.status)}</td>
                                                        <td className="px-4 py-3 font-telemetry">{typeof state?.temperature === "number" ? `${state.temperature} °C` : "—"}</td>
                                                        <td className="px-4 py-3 font-telemetry">{typeof state?.latencyMilliseconds === "number" ? `${state.latencyMilliseconds} ms` : "—"}</td>
                                                        <td className="px-4 py-3 text-xs text-subtle">{freshness === "stale" ? "Dữ liệu cũ · " : ""}{observedAt ? new Date(observedAt).toLocaleString("vi-VN") : "—"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        ["Tải robot", "Hệ thống máy chủ chưa cung cấp trường tải vận hành."],
                                        ["Sản lượng / OEE", "Chưa có API tổng hợp sản lượng hoặc hiệu suất thiết bị."],
                                        ["Vòng đời cảnh báo", "Chưa có API lịch sử và xác nhận cảnh báo."],
                                        ["Lịch sử ca sản xuất", "Backend có factory run nhưng chưa có API danh sách để phân tích."],
                                    ].map(([title, detail]) => (
                                        <article key={title} className="border border-dashed border-line bg-surface p-4">
                                            <AlertTriangle className="size-4 text-warning" />
                                            <h2 className="mt-3 text-sm font-semibold text-ink">{title}</h2>
                                            <p className="mt-2 text-xs leading-5 text-subtle">{detail}</p>
                                            <p className="mt-3 font-telemetry text-[10px] uppercase tracking-[.12em] text-subtle">Chưa khả dụng</p>
                                        </article>
                                    ))}
                                </section>
                            </>
                        )}
                    </div>
                </main>
                <MobileBottomNav />
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="px-4 py-4">
            <dt className="text-subtle">{label}</dt>
            <dd className="mt-1 break-words font-telemetry leading-5 text-ink">{value}</dd>
        </div>
    );
}

function formatPose(pose: { x: number; y: number; z: number; rx: number; ry: number; rz: number } | null) {
    if (!pose) return "Chưa có dữ liệu";
    return `X ${pose.x}, Y ${pose.y}, Z ${pose.z}; RX ${pose.rx}, RY ${pose.ry}, RZ ${pose.rz}`;
}

function formatJoints(joints: number[]) {
    return joints.length
        ? joints.map((value, index) => `J${index + 1}: ${value}°`).join(" · ")
        : "Chưa có dữ liệu";
}
