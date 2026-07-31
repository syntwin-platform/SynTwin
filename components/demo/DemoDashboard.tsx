"use client";

import Link from "next/link";
import { FlaskConical } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { DemoMutationButton } from "@/components/demo/DemoMutationButton";
import { ChartPanel } from "@/components/shared/ChartPanel";
import { MetricCell } from "@/components/shared/MetricCell";
import { SourceContext } from "@/components/shared/SourceContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
    DEMO_DATA,
    DEMO_REFERENCE_TIME,
    demoTrend,
} from "@/lib/demo/data";
import {
    selectDemoFleetSummary,
    selectDemoRobotComparison,
} from "@/lib/demo/selectors";

export function DemoDashboard() {
    const summary = selectDemoFleetSummary(DEMO_DATA);
    const comparison = selectDemoRobotComparison(DEMO_DATA);
    const alertCounts = DEMO_DATA.alerts.reduce(
        (counts, alert) => ({
            ...counts,
            [alert.severity]: (counts[alert.severity] ?? 0) + 1,
        }),
        {} as Record<string, number>
    );

    return (
        <main className="min-h-screen bg-canvas pb-20">
            <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div>
                        <p className="font-telemetry text-[10px] uppercase tracking-[.16em] text-brand">
                            SynTwin Demo
                        </p>
                        <h1 className="text-lg font-semibold text-ink">
                            Tổng quan nhà máy mô phỏng
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge tone="warning">
                            <FlaskConical className="size-3" />
                            Dữ liệu mô phỏng
                        </StatusBadge>
                        <Link
                            href="/pricing"
                            className="hidden min-h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-white sm:inline-flex"
                        >
                            Nâng cấp
                        </Link>
                    </div>
                </div>
            </header>

            <div
                className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6"
                data-testid="demo-operational-overview"
            >
                <div className="border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                    <strong>Trải nghiệm chỉ đọc.</strong> Mọi số liệu tại
                    trang này là kịch bản cố định để minh họa dịch vụ.
                </div>

                <section aria-labelledby="demo-fleet-heading">
                    <h2
                        id="demo-fleet-heading"
                        className="mb-3 text-sm font-semibold text-ink"
                    >
                        Trạng thái đội robot
                    </h2>
                    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCell
                            label="Đang vận hành"
                            value={`${summary.online}/${summary.total}`}
                            tone="success"
                        />
                        <MetricCell
                            label="Cần chú ý"
                            value={summary.attention}
                            tone="warning"
                        />
                        <MetricCell
                            label="Ngoại tuyến"
                            value={summary.offline}
                        />
                        <MetricCell
                            label="Thời điểm tham chiếu"
                            value="15:00"
                            unit="GMT+7"
                            tone="brand"
                        />
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <ChartPanel
                        title="Sản lượng và chu kỳ"
                        description="Sản lượng mô phỏng cố định, đơn vị chu kỳ/giờ"
                        meta="50 phút"
                    >
                        <div className="h-64" role="img" aria-label="Biểu đồ sản lượng mô phỏng từ 42 đến 51 chu kỳ mỗi giờ">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={demoTrend}>
                                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Area isAnimationActive={false} type="monotone" dataKey="throughput" stroke="#C52F00" fill="#C52F0022" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartPanel>
                    <ChartPanel
                        title="Nhiệt độ và tải"
                        description="Hai chuỗi mô phỏng; nhiệt độ °C và tải %"
                        meta="50 phút"
                    >
                        <div className="h-64" role="img" aria-label="Biểu đồ mô phỏng nhiệt độ và tải robot trong 50 phút">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={demoTrend}>
                                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Line isAnimationActive={false} type="monotone" dataKey="temperature" stroke="#C52F00" />
                                    <Line isAnimationActive={false} type="monotone" dataKey="load" stroke="#2563EB" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartPanel>
                </section>

                <section className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
                    <article className="border border-line bg-surface">
                        <div className="border-b border-line px-4 py-3">
                            <h2 className="text-sm font-semibold">
                                Cảnh báo theo mức độ
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-line">
                            {["Cảnh báo", "Quan trọng"].map((severity) => (
                                <MetricCell
                                    key={severity}
                                    label={severity}
                                    value={alertCounts[severity] ?? 0}
                                    tone={severity === "Quan trọng" ? "danger" : "warning"}
                                />
                            ))}
                        </div>
                        <ul className="divide-y divide-line">
                            {DEMO_DATA.alerts.map((alert) => (
                                <li key={alert.id} className="p-4">
                                    <p className="font-telemetry text-[10px] text-subtle">
                                        {alert.timestamp.slice(11, 16)} · {alert.severity}
                                    </p>
                                    <p className="mt-1 text-sm leading-5 text-steel">
                                        {alert.message}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="overflow-hidden border border-line bg-surface">
                        <div className="border-b border-line px-4 py-3">
                            <h2 className="text-sm font-semibold">
                                So sánh robot
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr>
                                        {["Robot", "Trạng thái", "Nhiệt độ", "Tải", "Chu kỳ"].map((label) => (
                                            <th key={label} className="border-b border-line px-4 py-3 text-xs font-medium text-subtle">
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparison.map((robot) => (
                                        <tr key={robot.id} className="border-b border-line last:border-0">
                                            <td className="px-4 py-3 font-telemetry font-semibold">{robot.name}</td>
                                            <td className="px-4 py-3">{robot.status}</td>
                                            <td className="px-4 py-3 font-telemetry">{robot.temperatureCelsius} °C</td>
                                            <td className="px-4 py-3 font-telemetry">{robot.loadPercent}%</td>
                                            <td className="px-4 py-3 font-telemetry">{robot.cycleSeconds || "—"} s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </section>

                <section className="border border-line bg-surface">
                    <div className="border-b border-line px-4 py-3">
                        <h2 className="text-sm font-semibold">
                            Sự kiện gần đây
                        </h2>
                    </div>
                    <ul className="grid divide-y divide-line md:grid-cols-2 md:divide-x md:divide-y-0">
                        {DEMO_DATA.events.map((event) => (
                            <li key={event.id} className="p-4">
                                <p className="font-telemetry text-[10px] text-subtle">
                                    {event.timestamp.slice(11, 16)} · {event.type}
                                </p>
                                <p className="mt-1 text-sm leading-5 text-steel">
                                    {event.message}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <DemoMutationButton />
                    <SourceContext
                        source="Bộ dữ liệu demo cố định"
                        updatedAt={DEMO_REFERENCE_TIME}
                        scope="Kịch bản minh họa"
                    />
                </div>
            </div>
        </main>
    );
}
