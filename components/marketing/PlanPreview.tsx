"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const plans = [
    ["Free", "Khám phá dịch vụ", [
        "Bảng điều khiển mô phỏng",
        "Dữ liệu cố định, chỉ đọc",
        "Không truy cập không gian thật",
    ]],
    ["Basic", "Vận hành quy mô khởi đầu", [
        "Bảng điều khiển dữ liệu thật",
        "Quản lý robot theo giới hạn gói",
        "Công ty và thành viên",
    ]],
    ["Enterprise", "Mở rộng đội robot", [
        "Giới hạn robot theo hệ thống",
        "Đo đạc và lịch sử theo khả dụng",
        "Toàn bộ luồng xử lý trả phí",
    ]],
] as const;

export function PlanPreview() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
    const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

    return (
        <section className="border-b border-line bg-canvas py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">

                <div ref={headRef} className="reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                            Lộ trình sử dụng
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                            Bắt đầu bằng demo, nâng cấp khi cần dữ liệu thật.
                        </h2>
                    </div>
                    <Link
                        href="/pricing"
                        className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
                    >
                        Xem giá đang áp dụng <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div ref={gridRef} className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
                    {plans.map(([plan, purpose, features], i) => (
                        <article
                            key={plan}
                            className={`reveal-scale card-hover relative bg-surface p-6 ${plan === "Basic" ? "ring-1 ring-inset ring-brand/20" : ""}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {plan === "Basic" && (
                                <span className="absolute right-4 top-4 rounded-full border border-brand/25 bg-brand/10 px-2 py-0.5 font-telemetry text-[10px] font-semibold uppercase tracking-[.12em] text-brand">
                                    Phổ biến
                                </span>
                            )}
                            <p className="font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                                {plan}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-ink">{purpose}</h3>
                            <ul className="mt-5 space-y-3">
                                {features.map((f) => (
                                    <li key={f} className="flex gap-2 text-sm text-steel">
                                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
