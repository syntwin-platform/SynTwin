"use client";

import { LucideIcon, Briefcase, Crown, Rocket, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface PlanCardItem {
    icon: LucideIcon;
    title: string;
    capacity: string;
    price: string;
    desc: string;
    isHighlighted: boolean;
    badge?: string;
}

const items: PlanCardItem[] = [
    {
        icon: Rocket,
        title: "Gói Starter",
        capacity: "Tối đa 5 robot",
        price: "5.000.000 ₫/tháng",
        desc: "Dành cho nhà máy quy mô nhỏ, theo dõi dữ liệu telemetry trực tiếp & cảnh báo bất thường.",
        isHighlighted: false,
    },
    {
        icon: Briefcase,
        title: "Gói Business",
        capacity: "Tối đa 20 robot",
        price: "15.000.000 ₫/tháng",
        desc: "Gói tiêu chuẩn doanh nghiệp, gửi lệnh điều khiển từ xa, phân tích sâu & phân quyền thành viên.",
        isHighlighted: true,
        badge: "Phổ biến nhất",
    },
    {
        icon: Crown,
        title: "Gói Enterprise",
        capacity: "Trên 20 robot không giới hạn",
        price: "50.000.000 ₫/tháng",
        desc: "Giải pháp quy mô lớn cho tập đoàn, tích hợp hệ thống riêng, API tùy chỉnh & hỗ trợ 24/7.",
        isHighlighted: false,
    },
];

export function AccessSecurity() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
    const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section id="bao-mat" className="relative overflow-hidden border-b border-line bg-surface py-16 sm:py-24">
            <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">

                <div ref={headRef} className="reveal-left lg:col-span-5">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Gói Dịch Vụ & Phân Quyền
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Đa dạng gói dịch vụ linh hoạt cho mọi quy mô nhà máy.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-steel">
                        SynTwin cung cấp các gói giải pháp giám sát & điều khiển robot tối ưu theo quy mô thiết bị. Giao diện tự động điều hướng người dùng và bảo mật nghiêm ngặt đối với từng cấp tài khoản.
                    </p>
                </div>

                <div ref={cardsRef} className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
                    {items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className={`reveal-scale card-hover relative flex flex-col justify-between rounded-xl border p-5 transition shadow-sm ${
                                    item.isHighlighted
                                        ? "border-brand bg-brand-soft/20 shadow-md ring-1 ring-brand/20"
                                        : "border-line bg-canvas hover:border-brand/30 hover:bg-surface"
                                }`}
                                style={{ transitionDelay: `${i * 100}ms` }}
                            >
                                {item.badge && (
                                    <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                        <Sparkles className="size-3" />
                                        {item.badge}
                                    </span>
                                )}
                                <div>
                                    <div className={`flex size-10 items-center justify-center rounded-lg border shadow-sm transition ${
                                        item.isHighlighted
                                            ? "border-brand/40 bg-brand text-white"
                                            : "border-line bg-surface text-brand"
                                    }`}>
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
                                    <p className="mt-1 font-telemetry text-xs font-semibold text-brand">{item.capacity}</p>
                                    <p className="mt-2 text-xs leading-5 text-steel">{item.desc}</p>
                                </div>
                                <div className="mt-4 border-t border-line/60 pt-3">
                                    <span className="text-xs font-bold text-ink">{item.price}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

