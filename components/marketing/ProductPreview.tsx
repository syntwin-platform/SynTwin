"use client";

import { Activity, AlertTriangle, Clock3, Thermometer } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const rows = [
    ["RA-001", "Đang chạy", "61.8 °C", "18 ms"],
    ["RA-002", "Sẵn sàng", "54.2 °C", "22 ms"],
    ["RA-003", "Cần kiểm tra", "68.4 °C", "31 ms"],
];
const features = [
    [Activity, "Trạng thái tức thời"],
    [Thermometer, "Nhiệt độ robot"],
    [AlertTriangle, "Điều kiện bất thường"],
    [Clock3, "Nguồn và thời điểm"],
] as const;

export function ProductPreview() {
    const leftRef = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });
    const rightRef = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });

    return (
        <section className="border-b border-line bg-surface py-16 sm:py-24">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">

                {/* Left */}
                <div ref={leftRef} className="reveal-left">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                        Từ tổng quan đến chi tiết
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Đọc trạng thái chính xác, không bị phân tán bởi mô phỏng hình ảnh.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-steel">
                        Bảng vận hành ưu tiên trạng thái kết nối, nhiệt độ, cảnh báo va
                        chạm, độ trễ, thời điểm cập nhật và nguồn dữ liệu.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {features.map(([Icon, label], i) => (
                            <div
                                key={label}
                                className="reveal-up flex items-center gap-2 border-l-2 border-brand/30 px-3 py-2 text-sm text-steel transition hover:border-brand hover:text-ink"
                                style={{ transitionDelay: `${i * 80 + 100}ms` }}
                            >
                                <Icon className="size-4 shrink-0 text-brand" />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right — table */}
                <div ref={rightRef} className="reveal-right overflow-hidden border border-line shadow-sm">
                    <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-3">
                        <p className="text-sm font-semibold text-ink">Đội robot — Nhà máy mẫu</p>
                        <span className="flex items-center gap-1.5 text-xs text-subtle">
                            <span className="animate-pulse-dot size-1.5 rounded-full bg-brand" />
                            Ví dụ mô phỏng
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-left text-[11px] sm:text-sm">
                            <thead>
                                <tr>
                                    {["Robot", "Trạng thái", "Nhiệt độ", "Độ trễ"].map((h) => (
                                        <th key={h} className="border-b border-line px-3 py-3 text-[10px] font-medium text-subtle sm:text-xs">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, ri) => (
                                    <tr
                                        key={row[0]}
                                        className="reveal-up border-b border-line last:border-0 transition hover:bg-canvas"
                                        style={{ transitionDelay: `${ri * 80 + 150}ms` }}
                                    >
                                        {row.map((cell, i) => (
                                            <td
                                                key={`${row[0]}-${i}`}
                                                className={`break-words px-3 py-4 ${
                                                    i === 0
                                                        ? "font-telemetry font-semibold text-ink"
                                                        : i === 1
                                                          ? `text-xs font-medium ${cell === "Cần kiểm tra" ? "text-warning" : "text-steel"}`
                                                          : "font-telemetry text-steel"
                                                }`}
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
