"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const plans = [
    {
        code: "Starter",
        name: "Starter",
        price: "5.000.000 ₫",
        period: "/ tháng",
        robots: "Tối đa 5 robot",
        target: "Doanh nghiệp quy mô nhỏ",
        features: [
            "Giám sát tối đa 5 robot",
            "Telemetry và trạng thái thời gian thực",
            "Cảnh báo bất thường và nhiệt độ",
            "Bảng điều khiển dữ liệu thật",
        ],
        highlight: false,
    },
    {
        code: "Business",
        name: "Business (SME Target)",
        price: "15.000.000 ₫",
        period: "/ tháng",
        robots: "Tối đa 20 robot",
        target: "Dành cho doanh nghiệp SME",
        features: [
            "Giám sát tối đa 20 robot",
            "Gửi lệnh điều khiển robot từ xa",
            "Lịch sử đo đạc và phân tích chuyên sâu",
            "Quản lý thành viên và công ty",
            "Hỗ trợ kỹ thuật ưu tiên",
        ],
        highlight: true,
        badge: "Khuyên dùng (SME Target)",
    },
    {
        code: "Enterprise",
        name: "Enterprise",
        price: "50.000.000 ₫",
        period: "/ tháng",
        robots: "Trên 20 robot",
        target: "Tập đoàn & nhà máy quy mô lớn",
        features: [
            "Quản lý trên 20 robot",
            "Toàn bộ tính năng cao cấp không giới hạn",
            "Lưu trữ nhật ký vận hành dài hạn",
            "Tích hợp API và giải pháp riêng",
            "Hỗ trợ kỹ thuật 24/7 trực tiếp",
        ],
        highlight: false,
    },
] as const;

export function PlanPreview() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
    const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });
    const tableRef = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

    return (
        <section className="border-b border-line bg-canvas py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                {/* Section Header */}
                <div
                    ref={headRef}
                    className="reveal-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                            Lộ trình & Giá dịch vụ
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            Bảng giá linh hoạt theo quy mô nhà máy.
                        </h2>
                    </div>
                    <Link
                        href="/pricing"
                        className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
                    >
                        Xem chi tiết bảng giá <ArrowRight className="size-4" />
                    </Link>
                </div>

                {/* Plan Cards Grid */}
                <div
                    ref={gridRef}
                    className="mt-10 grid gap-6 md:grid-cols-3"
                >
                    {plans.map((plan, i) => (
                        <article
                            key={plan.name}
                            className={`reveal-scale card-hover relative flex flex-col rounded-2xl bg-surface p-7 ${
                                plan.highlight
                                    ? "border-2 border-brand shadow-xl shadow-brand/10 ring-4 ring-brand/10"
                                    : "border border-line shadow-sm"
                            }`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            {plan.highlight && (
                                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-brand px-3.5 py-1 font-telemetry text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                                    <Sparkles className="size-3" />
                                    {plan.badge}
                                </span>
                            )}

                            <div>
                                <p className="font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                                    {plan.code}
                                </p>
                                <h3 className="mt-1.5 text-xl font-bold text-ink">
                                    {plan.name}
                                </h3>
                                <p className="mt-1 text-xs text-subtle">
                                    {plan.target}
                                </p>
                            </div>

                            <div className="my-6 border-y border-line/60 py-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-telemetry text-3xl font-bold text-ink">
                                        {plan.price}
                                    </span>
                                    <span className="text-xs text-subtle">
                                        {plan.period}
                                    </span>
                                </div>
                                <span className="mt-2 inline-block rounded border border-line bg-canvas px-2 py-0.5 font-telemetry text-xs font-medium text-brand">
                                    {plan.robots}
                                </span>
                            </div>

                            <ul className="mb-6 flex-1 space-y-3">
                                {plan.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-2.5 text-sm text-steel"
                                    >
                                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={`/pricing?plan=${plan.code}`}
                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                                    plan.highlight
                                        ? "bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/20"
                                        : "border border-line bg-canvas text-ink hover:bg-surface hover:border-brand/40"
                                }`}
                            >
                                Chọn gói {plan.code} <ArrowRight className="size-4" />
                            </Link>
                        </article>
                    ))}
                </div>

                {/* Direct Comparison Table matching user screenshot */}
                <div
                    ref={tableRef}
                    className="reveal-up mt-16 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
                >
                    <div className="border-b border-line bg-canvas px-6 py-4">
                        <h3 className="text-base font-semibold text-ink">
                            Bảng tóm tắt gói dịch vụ (Summary Table)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-line bg-[#0F172A] text-white">
                                    <th className="px-6 py-4 font-semibold">Package</th>
                                    <th className="px-6 py-4 font-semibold">Assistive Robots</th>
                                    <th className="px-6 py-4 font-semibold">Price/month</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                <tr className="transition hover:bg-canvas">
                                    <td className="px-6 py-4 font-semibold text-ink">Starter</td>
                                    <td className="px-6 py-4 text-steel">Up to 5 robots</td>
                                    <td className="px-6 py-4 font-telemetry font-bold text-ink">5 million VND</td>
                                </tr>
                                <tr className="bg-amber-50/60 transition hover:bg-amber-50">
                                    <td className="px-6 py-4 font-semibold text-ink flex items-center gap-2">
                                        Business (SME Target)
                                        <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                            Target
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-amber-950">Up to 20 robots</td>
                                    <td className="px-6 py-4 font-telemetry font-bold text-amber-950">VND 15 million</td>
                                </tr>
                                <tr className="transition hover:bg-canvas">
                                    <td className="px-6 py-4 font-semibold text-ink">Enterprise</td>
                                    <td className="px-6 py-4 text-steel">Over 20 robots</td>
                                    <td className="px-6 py-4 font-telemetry font-bold text-ink">VND 50 million</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
