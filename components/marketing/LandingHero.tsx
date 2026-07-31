"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, PlayCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const BARS = [46, 54, 49, 62, 58, 68, 61, 57, 64, 60, 66, 63];
const CHECKLIST = [
    "Free có bảng điều khiển demo",
    "Basic và Premium dùng dữ liệu thật",
    "Phân quyền theo công ty và vai trò",
    "Không bịa chỉ số ngoài dữ liệu hệ thống",
];
const KPI = [
    ["Robot trực tuyến", "06 / 08"],
    ["Cảnh báo điều kiện", "02"],
    ["Nhiệt độ cao nhất", "68.4 °C"],
];

export function LandingHero() {
    const textRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, once: true });
    const cardRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, once: true });

    return (
        <section className="relative overflow-hidden border-b border-line">
            <div className="technical-grid absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/[0.03] via-transparent to-transparent" />

            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-32">

                {/* Left — text */}
                <div ref={textRef} className="reveal-left">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                        Nền tảng vận hành SynTwin
                    </p>
                    <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.5rem]">
                        Nhìn rõ trạng thái đội robot trước khi ra quyết định vận hành.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-steel sm:text-lg">
                        SynTwin tập trung dữ liệu robot, telemetry, cảnh báo điều kiện,
                        lịch sử lệnh và quyền truy cập công ty vào một không gian quản
                        lý thống nhất cho chủ và quản lý nhà máy.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/register"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]"
                        >
                            Tạo tài khoản Free <ArrowRight className="size-4" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-surface px-5 text-sm font-semibold text-ink transition hover:border-brand/40 hover:bg-canvas"
                        >
                            <PlayCircle className="size-4 text-brand" /> Xem gói dịch vụ
                        </Link>
                    </div>

                    <ul className="mt-7 grid gap-2 text-sm text-steel sm:grid-cols-2">
                        {CHECKLIST.map((item, i) => (
                            <li
                                key={item}
                                className="reveal-up flex items-start gap-2"
                                style={{ transitionDelay: `${i * 80 + 100}ms` }}
                            >
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right — telemetry card */}
                <div
                    ref={cardRef}
                    className="reveal-right border border-line bg-surface p-3 shadow-[0_24px_70px_rgba(15,23,42,0.10)] transition-shadow hover:shadow-[0_32px_80px_rgba(15,23,42,0.14)]"
                >
                    <div className="flex items-center justify-between border-b border-line px-3 py-2">
                        <span className="font-telemetry text-[11px] uppercase tracking-[0.15em] text-subtle">
                            Giao diện đại diện
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700">
                            <span className="animate-pulse-dot size-2 rounded-full bg-brand" />
                            Dữ liệu mô phỏng
                        </span>
                    </div>

                    <div className="technical-grid p-4 sm:p-6">
                        {/* KPI row */}
                        <div className="grid grid-cols-3 gap-px bg-line">
                            {KPI.map(([label, value], i) => (
                                <div
                                    key={label}
                                    className="reveal-up bg-surface p-3 sm:p-4"
                                    style={{ transitionDelay: `${i * 80 + 150}ms` }}
                                >
                                    <p className="text-[10px] leading-4 text-subtle sm:text-xs">{label}</p>
                                    <p className="mt-2 font-telemetry text-lg font-semibold text-ink sm:text-2xl">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Bar chart */}
                        <div className="mt-4 border border-line bg-surface p-4">
                            <div className="mb-5 flex items-center justify-between">
                                <p className="text-xs font-semibold text-ink">Nhiệt độ theo robot</p>
                                <p className="font-telemetry text-[10px] text-subtle">10 phút mô phỏng</p>
                            </div>
                            <div
                                role="img"
                                className="flex h-36 items-end gap-2"
                                aria-label="Biểu đồ cột mô phỏng nhiệt độ robot"
                            >
                                {BARS.map((value, index) => (
                                    <span
                                        key={`${value}-${index}`}
                                        className="flex-1"
                                        style={{
                                            height: `${value}%`,
                                            background: `color-mix(in srgb, var(--brand) 15%, transparent)`,
                                        }}
                                    >
                                        <span
                                            className="bar-animate block h-1 bg-brand"
                                            style={{ animationDelay: `${index * 60}ms` }}
                                        />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
