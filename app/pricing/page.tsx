"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Bot,
    Check,
    Crown,
    Loader2,
    LogOut,
    Zap,
} from "lucide-react";
import { logoutUser } from "@/lib/api/auth";
import {
    createVnPayCheckout,
    type PaidSubscriptionPlan,
} from "@/lib/api/payments";
import {
    listSubscriptionPlans,
    type SubscriptionPlan,
} from "@/lib/api/subscriptions";
import type { BackendSubscriptionPlan } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

const PLAN_ORDER: Record<BackendSubscriptionPlan, number> = {
    Free: 0,
    Basic: 1,
    Premium: 2,
};

function formatPrice(price: number): string {
    if (price === 0) {
        return "Miễn phí";
    }

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(price);
}

function isPaidPlan(
    plan: BackendSubscriptionPlan
): plan is PaidSubscriptionPlan {
    return plan === "Basic" || plan === "Premium";
}

function getPlanDescription(
    plan: BackendSubscriptionPlan
): string {
    switch (plan) {
        case "Premium":
            return "Dành cho nhà máy cần vận hành nhiều robot và đầy đủ tính năng.";

        case "Basic":
            return "Phù hợp để bắt đầu triển khai và giám sát một nhóm robot nhỏ.";

        default:
            return "Trải nghiệm các tính năng giám sát cơ bản của SynTwin.";
    }
}

function getPlanFeatures(plan: SubscriptionPlan): string[] {
    const robotLimit =
        plan.maxRobots === 1
            ? "Quản lý tối đa 1 robot"
            : `Quản lý tối đa ${plan.maxRobots} robot`;

    const view3D = plan.canView3D
        ? "Xem mô hình Digital Twin 3D"
        : "Giám sát trạng thái robot cơ bản";

    const sendCommand = plan.canSendCommand
        ? "Gửi lệnh điều khiển robot"
        : "Không bao gồm điều khiển từ xa";

    const auditRetention = plan.auditRetentionDays
        ? `Lưu lịch sử hoạt động ${plan.auditRetentionDays} ngày`
        : "Lưu lịch sử hoạt động tiêu chuẩn";

    return [
        robotLimit,
        view3D,
        sendCommand,
        auditRetention,
    ];
}

function PlanIcon({
    plan,
}: {
    plan: BackendSubscriptionPlan;
}) {
    if (plan === "Premium") {
        return <Crown className="h-6 w-6 text-[#FD3E06]" />;
    }

    if (plan === "Basic") {
        return <Zap className="h-6 w-6 text-[#3B82F6]" />;
    }

    return <Bot className="h-6 w-6 text-[#64748B]" />;
}

export default function PricingPage() {
    const router = useRouter();
    const session = useSession();

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);
    const [checkoutPlan, setCheckoutPlan] =
        useState<PaidSubscriptionPlan | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadPlans(): Promise<void> {
            try {
                const response = await listSubscriptionPlans();

                if (cancelled) {
                    return;
                }

                setPlans(
                    [...response].sort(
                        (first, second) =>
                            PLAN_ORDER[first.code] -
                            PLAN_ORDER[second.code]
                    )
                );
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Không thể tải danh sách gói dịch vụ."
                );
            } finally {
                if (!cancelled) {
                    setIsLoadingPlans(false);
                }
            }
        }

        const timer = window.setTimeout(() => {
            void loadPlans();
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, []);

    async function handleCheckout(
        plan: PaidSubscriptionPlan
    ): Promise<void> {
        setCheckoutPlan(plan);
        setError("");

        try {
            const checkout = await createVnPayCheckout(plan);

            if (!checkout.paymentUrl) {
                throw new Error(
                    "Backend không trả về đường dẫn thanh toán VNPay."
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

    if (!session) {
        return null;
    }

    return (
        <div className="relative min-h-screen bg-[#F8FAFC]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <nav className="relative z-10 border-b border-[#E2E8F0] bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5"
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

                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-[#0F172A]">
                                {session.name}
                            </p>
                            <p className="text-xs text-[#64748B]">
                                Gói hiện tại:{" "}
                                {session.subscriptionPlan}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleLogout()}
                            className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-medium text-[#64748B] transition hover:border-[#FD3E06]/40 hover:text-[#FD3E06]"
                        >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#FD3E06]/20 bg-[#FD3E06]/5 px-4 py-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#FD3E06]" />
                        <span className="text-xs font-medium text-[#FD3E06]">
                            Gói dịch vụ SynTwin
                        </span>
                    </div>

                    <h1 className="mt-5 text-3xl font-bold text-[#0F172A] sm:text-4xl">
                        Chọn gói phù hợp với nhà máy
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#64748B]">
                        Danh sách gói và mức giá được tải trực tiếp
                        từ Backend. Thanh toán các gói trả phí được
                        xử lý qua VNPay.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mx-auto mt-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {isLoadingPlans ? (
                    <div className="flex min-h-72 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#FD3E06]" />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="mt-12 rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center">
                        <p className="text-sm text-[#64748B]">
                            Backend chưa trả về gói dịch vụ nào.
                        </p>
                    </div>
                ) : (
                    <div className="mt-14 grid gap-6 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const isPremium =
                                plan.code === "Premium";
                            const isCurrent =
                                session.subscriptionPlan ===
                                plan.code;
                            const paidPlan = isPaidPlan(plan.code)
                                ? plan.code
                                : null;
                            const isCheckingOut =
                                checkoutPlan === paidPlan;
                            const features =
                                getPlanFeatures(plan);

                            return (
                                <article
                                    key={plan.id}
                                    className={`relative flex flex-col rounded-2xl bg-white p-8 ${
                                        isPremium
                                            ? "border-2 border-[#FD3E06]/50 shadow-xl shadow-[#FD3E06]/10"
                                            : "border border-[#E2E8F0] shadow-lg shadow-black/5"
                                    }`}
                                >
                                    {isPremium && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FD3E06] px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                                            Đầy đủ tính năng
                                        </span>
                                    )}

                                    <div
                                        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${
                                            isPremium
                                                ? "bg-[#FD3E06]/10"
                                                : plan.code ===
                                                    "Basic"
                                                  ? "bg-[#3B82F6]/10"
                                                  : "bg-[#64748B]/10"
                                        }`}
                                    >
                                        <PlanIcon plan={plan.code} />
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B]">
                                                {plan.code}
                                            </p>
                                            <h2 className="mt-1 text-2xl font-bold text-[#0F172A]">
                                                {plan.name}
                                            </h2>
                                        </div>

                                        {isCurrent && (
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                Đang sử dụng
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 min-h-12 text-sm leading-6 text-[#64748B]">
                                        {getPlanDescription(
                                            plan.code
                                        )}
                                    </p>

                                    <div className="my-7">
                                        <span className="text-3xl font-bold text-[#0F172A]">
                                            {formatPrice(
                                                plan.monthlyPrice
                                            )}
                                        </span>

                                        {plan.monthlyPrice > 0 && (
                                            <span className="ml-1 text-sm text-[#64748B]">
                                                / tháng
                                            </span>
                                        )}
                                    </div>

                                    <ul className="mb-8 flex-1 space-y-3">
                                        {features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-2.5 text-sm text-[#334155]"
                                            >
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        disabled={
                                            isCurrent ||
                                            !paidPlan ||
                                            checkoutPlan !== null
                                        }
                                        onClick={() => {
                                            if (paidPlan) {
                                                void handleCheckout(
                                                    paidPlan
                                                );
                                            }
                                        }}
                                        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            isPremium
                                                ? "bg-[#FD3E06] text-white hover:bg-[#E63600]"
                                                : "border-2 border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white"
                                        }`}
                                    >
                                        {isCheckingOut ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang chuyển đến VNPay
                                            </>
                                        ) : isCurrent ? (
                                            "Gói hiện tại"
                                        ) : paidPlan ? (
                                            <>
                                                Thanh toán qua VNPay
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        ) : (
                                            "Gói miễn phí mặc định"
                                        )}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}

                <p className="mt-10 text-center text-xs text-[#94A3B8]">
                    Giao dịch chỉ được ghi nhận sau khi Backend xác
                    minh kết quả trả về từ VNPay.
                </p>
            </main>
        </div>
    );
}