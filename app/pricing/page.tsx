"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowRight,
    Check,
    Loader2,
    LogOut,
    Sparkles,
} from "lucide-react";
import { logoutUser } from "@/lib/api/auth";
import {
    createVnPayCheckout,
    type PaidSubscriptionPlan,
} from "@/lib/api/payments";
import { useSession } from "@/hooks/useSession";

export interface StaticPackageInfo {
    code: string;
    name: string;
    priceFormatted: string;
    monthlyPrice: number;
    robotsFormatted: string;
    target: string;
    backendPlan: PaidSubscriptionPlan;
    isHighlighted: boolean;
    badge?: string;
    features: string[];
}

const PACKAGES: StaticPackageInfo[] = [
    {
        code: "Starter",
        name: "Starter",
        priceFormatted: "5.000.000 ₫",
        monthlyPrice: 5000000,
        robotsFormatted: "Up to 5 robots",
        target: "Doanh nghiệp quy mô khởi đầu",
        backendPlan: "Basic",
        isHighlighted: false,
        features: [
            "Giám sát tối đa 5 robot",
            "Bảng điều khiển dữ liệu thật",
            "Telemetry & trạng thái trực tiếp",
            "Cảnh báo điều kiện & bất thường",
            "Lưu nhật ký vận hành 30 ngày",
        ],
    },
    {
        code: "Business",
        name: "Business",
        priceFormatted: "15.000.000 ₫",
        monthlyPrice: 15000000,
        robotsFormatted: "Up to 20 robots",
        target: "Gói tiêu chuẩn dành cho SME",
        backendPlan: "Basic",
        isHighlighted: true,
        badge: "Phổ biến",
        features: [
            "Giám sát tối đa 20 robot",
            "Bảng điều khiển dữ liệu thật",
            "Gửi lệnh điều khiển robot từ xa",
            "Lịch sử đo đạc & phân tích chuyên sâu",
            "Quản lý nhà máy & phân quyền thành viên",
            "Hỗ trợ kỹ thuật ưu tiên",
        ],
    },
    {
        code: "Enterprise",
        name: "Enterprise",
        priceFormatted: "50.000.000 ₫",
        monthlyPrice: 50000000,
        robotsFormatted: "Over 20 robots",
        target: "Tập đoàn & nhà máy quy mô lớn",
        backendPlan: "Premium",
        isHighlighted: false,
        features: [
            "Quản lý trên 20 robot không giới hạn",
            "Toàn bộ tính năng cao cấp nhất của SynTwin",
            "Lưu trữ nhật ký vận hành dài hạn",
            "Tích hợp hệ thống riêng & API tùy chỉnh",
            "Đội ngũ hỗ trợ 24/7 trực tiếp",
        ],
    },
];

export default function PricingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useSession();
    const requestedPlan = searchParams.get("plan");
    const selectedPlan = requestedPlan;

    const [checkoutPlan, setCheckoutPlan] =
        useState<PaidSubscriptionPlan | null>(null);
    const [error, setError] = useState("");

    async function handleCheckout(
        plan: PaidSubscriptionPlan
    ): Promise<void> {
        if (session?.isAdmin) {
            setError(
                "Tài khoản quản trị chỉ có quyền xem bảng giá và không thể thực hiện thanh toán."
            );
            return;
        }

        if (!session) {
            window.location.assign(
                `/login?next=${encodeURIComponent(
                    `/pricing?plan=${plan}`
                )}`
            );
            return;
        }

        setCheckoutPlan(plan);
        setError("");

        try {
            const checkout = await createVnPayCheckout(plan);

            if (!checkout.paymentUrl) {
                throw new Error(
                    "Hệ thống không trả về đường dẫn thanh toán VNPay."
                );
            }

            window.location.assign(checkout.paymentUrl);
        } catch (checkoutError) {
            setError(
                checkoutError instanceof Error
                    ? checkoutError.message
                    : "Không thể khởi tạo giao dịch VNPay."
            );
            setCheckoutPlan(null);
        }
    }

    async function handleLogout(): Promise<void> {
        await logoutUser();
        router.replace("/login");
    }

    return (
        <div className="relative min-h-screen bg-[#F8FAFC]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            {/* Navbar */}
            <nav className="relative z-10 border-b border-[#E2E8F0] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link
                        href={
                            session?.isAdmin
                                ? "/admin/dashboard"
                                : session
                                  ? "/dashboard"
                                  : "/"
                        }
                        className="flex items-center gap-2.5 transition hover:opacity-80"
                    >
                        <Image
                            src="/images/syntwin-logo.png"
                            alt="SynTwin"
                            width={36}
                            height={36}
                        />
                        <span className="font-bold tracking-wide text-[#0F172A]">
                            SynTwin
                        </span>
                    </Link>

                    {session ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {session?.name ?? "Khách"}
                                </p>
                                <p className="text-xs text-[#64748B]">
                                    Gói hiện tại: {session?.subscriptionPlan}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void handleLogout()}
                                className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#64748B] transition hover:border-[#C52F00]/40 hover:text-[#C52F00]"
                            >
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-steel"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white hover:bg-brand-hover sm:px-4"
                            >
                                Bắt đầu <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Header Content */}
            <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#C52F00]/20 bg-[#C52F00]/5 px-3 py-1 text-xs font-semibold text-[#C52F00]">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium text-[#C52F00]">
                            Bảng Giá Dịch Vụ Mới
                        </span>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold text-[#0F172A] sm:text-4xl">
                        Bảng giá SynTwin cho nhà máy & doanh nghiệp
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#64748B]">
                        Lựa chọn gói dịch vụ tối ưu theo số lượng robot và quy mô sản xuất.
                        Thanh toán bảo mật trực tiếp qua cổng VNPay.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* 3 Pricing Cards */}
                <div className="mt-12 grid gap-6 lg:grid-cols-3">
                    {PACKAGES.map((pkg) => {
                        const isCheckingOut =
                            checkoutPlan === pkg.backendPlan;

                        return (
                            <article
                                key={pkg.code}
                                data-selected={
                                    selectedPlan === pkg.code ||
                                    (selectedPlan === pkg.backendPlan && (pkg.isHighlighted || pkg.backendPlan === "Premium"))
                                        ? "true"
                                        : undefined
                                }
                                className={`relative flex flex-col rounded-2xl bg-white p-8 ${
                                    pkg.isHighlighted
                                        ? "border-2 border-[#C52F00] shadow-xl shadow-[#C52F00]/10 ring-4 ring-[#C52F00]/10"
                                        : "border border-[#E2E8F0] shadow-lg shadow-black/5"
                                }`}
                            >
                                {pkg.badge && (
                                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#C52F00] px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-sm">
                                        <Sparkles className="h-3 w-3" />
                                        {pkg.badge}
                                    </span>
                                )}

                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
                                            {pkg.code}
                                        </p>
                                        <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">
                                            {pkg.name}
                                        </h2>
                                    </div>
                                </div>

                                <p className="mt-2 text-xs text-[#64748B]">
                                    {pkg.target}
                                </p>

                                <div className="my-6 border-y border-[#E2E8F0] py-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-extrabold text-[#0F172A]">
                                            {pkg.priceFormatted}
                                        </span>
                                        <span className="text-xs font-medium text-[#64748B]">
                                            / tháng
                                        </span>
                                    </div>
                                    <span className="mt-2 inline-block rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#0F172A]">
                                        {pkg.robotsFormatted}
                                    </span>
                                </div>

                                <ul className="mb-8 flex-1 space-y-3">
                                    {pkg.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2.5 text-sm text-[#334155]"
                                        >
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {!session ? (
                                    <Link
                                        href={`/login?next=${encodeURIComponent(`/pricing?plan=${pkg.backendPlan}`)}`}
                                        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
                                            pkg.isHighlighted
                                                ? "bg-[#C52F00] text-white hover:bg-[#9F2600]"
                                                : "border-2 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white"
                                        }`}
                                    >
                                        Thanh toán {pkg.name} qua VNPay
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={
                                            session?.isAdmin ||
                                            checkoutPlan !== null
                                        }
                                        onClick={() => {
                                            void handleCheckout(
                                                pkg.backendPlan
                                            );
                                        }}
                                        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            pkg.isHighlighted
                                                ? "bg-[#C52F00] text-white hover:bg-[#9F2600]"
                                                : "border-2 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white"
                                        }`}
                                    >
                                        {session?.isAdmin ? (
                                            "Chỉ xem"
                                        ) : isCheckingOut ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang chuyển đến VNPay
                                            </>
                                        ) : (
                                            <>
                                                Thanh toán {pkg.name} qua VNPay
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </article>
                        );
                    })}
                </div>

                {/* Exact Table View matching User Request Screenshot */}
                <div className="mt-14 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-md">
                    <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
                        <h3 className="text-base font-bold text-[#0F172A]">
                            Bảng so sánh gói dịch vụ (Standard Matrix)
                        </h3>
                    </div>
                    <div className="overflow-x-auto" tabIndex={0} aria-label="Bảng so sánh gói dịch vụ">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#E2E8F0] bg-[#0B1527] text-white">
                                    <th className="px-6 py-4 font-bold tracking-wide">
                                        Package
                                    </th>
                                    <th className="px-6 py-4 font-bold tracking-wide">
                                        Assistive Robots
                                    </th>
                                    <th className="px-6 py-4 font-bold tracking-wide">
                                        Price/month
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                <tr className="transition hover:bg-[#F8FAFC]">
                                    <td className="px-6 py-5 font-bold text-[#0F172A]">
                                        Starter
                                    </td>
                                    <td className="px-6 py-5 text-[#334155]">
                                        Up to 5 robots
                                    </td>
                                    <td className="px-6 py-5 font-mono font-bold text-[#0F172A]">
                                        5 million VND
                                    </td>
                                </tr>
                                <tr className="bg-[#FFF8F0] transition hover:bg-[#FFF3E6]">
                                    <td className="px-6 py-5 font-bold text-[#0F172A] flex items-center gap-2">
                                        Business
                                        <span className="rounded bg-[#FDBA74] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7C2D12]">
                                            Target
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-medium text-[#7C2D12]">
                                        Up to 20 robots
                                    </td>
                                    <td className="px-6 py-5 font-mono font-bold text-[#7C2D12]">
                                        VND 15 million
                                    </td>
                                </tr>
                                <tr className="transition hover:bg-[#F8FAFC]">
                                    <td className="px-6 py-5 font-bold text-[#0F172A]">
                                        Enterprise
                                    </td>
                                    <td className="px-6 py-5 text-[#334155]">
                                        Over 20 robots
                                    </td>
                                    <td className="px-6 py-5 font-mono font-bold text-[#0F172A]">
                                        VND 50 million
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-[#64748B]">
                    Giao dịch được xử lý và bảo mật qua VNPay Gateway. Giá trên đã bao gồm toàn bộ hạ tầng telemetry và quản lý robot.
                </p>
            </main>
        </div>
    );
}
