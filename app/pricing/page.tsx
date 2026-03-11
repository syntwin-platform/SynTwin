"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Check,
    Zap,
    Building2,
    ArrowRight,
    LogOut,
} from "lucide-react";
import { getSession, clearSession, type Session } from "@/lib/auth";

export default function PricingPage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        const s = getSession();
        if (!s) {
            router.replace("/login");
            return;
        }
        // If they already have a plan, redirect to dashboard
        if (s.plan !== "unpaid") {
            router.replace("/dashboard");
            return;
        }
        setSession(s);
    }, [router]);

    function handleSelectPlan(plan: "basic" | "enterprise") {
        setLoading(plan);
        // Simulate payment / plan activation
        setTimeout(() => {
            // Update session plan
            const s = getSession();
            if (s) {
                const updated = { ...s, plan: plan as "basic" | "enterprise" };
                localStorage.setItem("syntwin_session", JSON.stringify(updated));

                // Also update the account in the registry
                try {
                    const raw = localStorage.getItem("syntwin_accounts");
                    const extra = raw ? JSON.parse(raw) : [];
                    const idx = extra.findIndex((a: { email: string }) => a.email === s.email);
                    if (idx >= 0) {
                        extra[idx].plan = plan;
                        localStorage.setItem("syntwin_accounts", JSON.stringify(extra));
                    }
                } catch { }
            }
            setLoading(null);
            router.push("/dashboard");
        }, 1400);
    }

    function handleLogout() {
        clearSession();
        router.push("/login");
    }

    if (!session) return null;

    return (
        <div className="relative min-h-screen bg-[#F9FAFA]">
            {/* Background grid */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            {/* Nav */}
            <nav className="relative z-10 border-b border-[#E2E8F0] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <a href="/" className="flex items-center gap-2.5">
                        <Image src="/images/syntwin-logo.png" alt="SynTwin" width={36} height={36} />
                        <span className="text-base font-bold tracking-wide text-[#0F172A]">SynTwin</span>
                    </a>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[#64748B]">
                            Xin chào, <span className="font-medium text-[#0F172A]">{session.name}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-medium text-[#64748B] transition-all hover:border-[#FD3E06]/30 hover:text-[#FD3E06]"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 mx-auto max-w-5xl px-6 py-16">
                {/* Header */}
                <div className="text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FD3E06]/20 bg-[#FD3E06]/5 px-4 py-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#FD3E06]" />
                        <span className="text-xs font-medium text-[#FD3E06]">Chọn gói phù hợp với nhà máy của bạn</span>
                    </div>
                    <h1 className="mt-2 text-3xl font-bold text-[#0F172A] sm:text-4xl">
                        Bắt đầu giám sát thông minh
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm text-[#64748B]">
                        SynTwin hoạt động theo mô hình SaaS theo tháng. Nâng cấp hoặc hủy bất cứ lúc nào.
                    </p>
                </div>

                {/* Pricing cards */}
                <div className="mt-14 grid gap-6 md:grid-cols-2">
                    {/* Basic plan */}
                    <div className="relative flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-lg shadow-black/5 transition-all hover:shadow-xl hover:shadow-black/8">
                        <div className="mb-6">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#3B82F6]/10">
                                <Zap className="h-5 w-5 text-[#3B82F6]" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6]">
                                Gói Cơ Bản
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Pilot</h2>
                            <p className="mt-1 text-sm text-[#64748B]">
                                Phù hợp với doanh nghiệp muốn thử nghiệm hệ thống
                            </p>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-end gap-1">
                                <span className="text-4xl font-bold text-[#0F172A]">$79</span>
                                <span className="mb-1 text-sm text-[#64748B]">– $99 / tháng</span>
                            </div>
                        </div>

                        {/* Features */}
                        <ul className="mb-8 flex-1 space-y-3">
                            {[
                                "Giám sát 2–3 robot",
                                "Dashboard cơ bản",
                                "Trạng thái robot realtime",
                                "Cảnh báo đơn giản",
                            ].map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-[#334155]">
                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#3B82F6]" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={!!loading}
                            onClick={() => handleSelectPlan("basic")}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#3B82F6] text-sm font-semibold text-[#3B82F6] transition-all hover:bg-[#3B82F6] hover:text-white disabled:opacity-60"
                        >
                            {loading === "basic" ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Đang kích hoạt…
                                </>
                            ) : (
                                <>
                                    Chọn gói Pilot
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Enterprise plan */}
                    <div className="relative flex flex-col rounded-2xl border-2 border-[#FD3E06]/40 bg-white p-8 shadow-xl shadow-[#FD3E06]/8 transition-all hover:shadow-2xl hover:shadow-[#FD3E06]/12">
                        {/* Popular badge */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="rounded-full bg-[#FD3E06] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md shadow-[#FD3E06]/30">
                                Phổ biến nhất
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FD3E06]/10">
                                <Building2 className="h-5 w-5 text-[#FD3E06]" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#FD3E06]">
                                Gói Doanh Nghiệp
                            </p>
                            <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">Enterprise</h2>
                            <p className="mt-1 text-sm text-[#64748B]">
                                Phù hợp với nhà máy vận hành nhiều robot
                            </p>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            <div className="flex items-end gap-1">
                                <span className="text-4xl font-bold text-[#0F172A]">$499</span>
                                <span className="mb-1 text-sm text-[#64748B]">– $999 / tháng</span>
                            </div>
                            <p className="mt-1 text-xs text-[#64748B]">
                                hoặc $20–$30 / robot / tháng
                            </p>
                        </div>

                        {/* Features */}
                        <ul className="mb-8 flex-1 space-y-3">
                            {[
                                "Giám sát không giới hạn robot",
                                "Nhà máy ảo 3D toàn phần",
                                "Phân tích dữ liệu robot nâng cao",
                                "Cảnh báo bảo trì dự đoán (AI)",
                                "Tích hợp hệ thống nhà máy (ERP/MES)",
                            ].map((f) => (
                                <li key={f} className="flex items-start gap-2.5 text-sm text-[#334155]">
                                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#FD3E06]" />
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={!!loading}
                            onClick={() => handleSelectPlan("enterprise")}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FD3E06] text-sm font-semibold text-white shadow-lg shadow-[#FD3E06]/25 transition-all hover:bg-[#E63600] disabled:opacity-60"
                        >
                            {loading === "enterprise" ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Đang kích hoạt…
                                </>
                            ) : (
                                <>
                                    Chọn gói Enterprise
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-8 text-center text-xs text-[#94A3B8]">
                    Tất cả gói đều bao gồm hỗ trợ kỹ thuật. Không yêu cầu hợp đồng dài hạn. Hủy bất cứ lúc nào.
                </p>
            </main>
        </div>
    );
}
