"use client";

import { KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const items = [
    [KeyRound, "Free Plan", "Bảng điều khiển demo mô phỏng, thao tác chỉ đọc."],
    [ShieldCheck, "Basic / Premium", "Không gian vận hành dữ liệu thật từ thiết bị."],
    [UserCog, "SuperAdmin", "Khu vực quản trị hệ thống, công ty và người dùng."],
] as const;

export function AccessSecurity() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
    const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section id="bao-mat" className="relative overflow-hidden border-b border-line bg-surface py-16 sm:py-24">
            <div className="technical-grid pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -left-20 top-1/2 size-72 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">

                <div ref={headRef} className="reveal-left">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Phân quyền và Bảo mật
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Phân tách rõ demo, không gian trả phí và quản trị nền tảng.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-steel">
                        Giao diện tự động điều hướng người dùng theo gói dịch vụ và vai trò trước khi hiển thị dữ liệu. Hệ thống máy chủ thực thi quyền truy cập nghiêm ngặt đối với từng API.
                    </p>
                </div>

                <div ref={cardsRef} className="grid gap-4 sm:grid-cols-3">
                    {items.map(([Icon, title, desc], i) => (
                        <div
                            key={title}
                            className="reveal-scale card-hover group rounded-xl border border-line bg-canvas p-5 transition hover:border-brand/30 hover:bg-surface shadow-sm"
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-brand shadow-sm transition group-hover:border-brand/40 group-hover:bg-brand/10">
                                <Icon className="size-5" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                            <p className="mt-2 text-xs leading-5 text-steel">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
