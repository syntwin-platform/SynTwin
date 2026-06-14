"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Loader2,
    ReceiptText,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { restoreSession } from "@/lib/api/auth";
import {
    getVnPayPaymentStatus,
    type VnPayPaymentStatus,
} from "@/lib/api/payments";

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function LoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#FD3E06]" />
                <p className="mt-4 text-sm text-[#64748B]">
                    Đang xác minh giao dịch...
                </p>
            </div>
        </div>
    );
}

function PaymentReturnContent() {
    const searchParams = useSearchParams();
    const transactionReference =
        searchParams.get("txnRef")?.trim() ?? "";

    const requestId = useRef(0);

    const [payment, setPayment] =
        useState<VnPayPaymentStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPayment = useCallback(async (): Promise<void> => {
        const currentRequestId = ++requestId.current;

        setIsLoading(true);
        setError("");

        if (!transactionReference) {
            setPayment(null);
            setError(
                "Đường dẫn trả về từ VNPay không có mã giao dịch."
            );
            setIsLoading(false);
            return;
        }

        try {
            const response = await getVnPayPaymentStatus(
                transactionReference
            );

            if (currentRequestId !== requestId.current) {
                return;
            }

            setPayment(response);

            if (response.paymentStatus === "Paid") {
                void restoreSession().catch(() => {
                    // AuthGuard will handle an invalid session.
                });
            }
        } catch (loadError) {
            if (currentRequestId !== requestId.current) {
                return;
            }

            setPayment(null);
            setError(
                loadError instanceof Error
                    ? loadError.message
                    : "Không thể xác minh trạng thái giao dịch."
            );
        } finally {
            if (currentRequestId === requestId.current) {
                setIsLoading(false);
            }
        }
    }, [transactionReference]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadPayment();
        }, 0);

        return () => {
            window.clearTimeout(timer);
            requestId.current += 1;
        };
    }, [loadPayment]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    const isPaid = payment?.paymentStatus === "Paid";
    const isPending = payment?.paymentStatus === "Pending";
    const isFailed =
        payment?.paymentStatus === "Failed" ||
        payment?.paymentStatus === "Refunded";

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8FAFC] px-6 py-12">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <section className="relative z-10 w-full max-w-xl rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-xl shadow-black/5 sm:p-10">
                <div className="text-center">
                    {isPaid && (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                        </div>
                    )}

                    {isPending && (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                            <Clock3 className="h-9 w-9 text-amber-600" />
                        </div>
                    )}

                    {(isFailed || error) && (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                            <XCircle className="h-9 w-9 text-red-600" />
                        </div>
                    )}

                    <h1 className="mt-5 text-2xl font-bold text-[#0F172A]">
                        {isPaid
                            ? "Thanh toán thành công"
                            : isPending
                              ? "Giao dịch đang xử lý"
                              : "Thanh toán chưa hoàn tất"}
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-[#64748B]">
                        {isPaid
                            ? "Backend đã xác minh giao dịch và cập nhật gói dịch vụ của bạn."
                            : isPending
                              ? "VNPay chưa xác nhận giao dịch. Bạn có thể kiểm tra lại trạng thái."
                              : error ||
                                "Giao dịch không thành công hoặc đã bị hủy."}
                    </p>
                </div>

                {payment && (
                    <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                        <div className="mb-5 flex items-center gap-2">
                            <ReceiptText className="h-5 w-5 text-[#FD3E06]" />
                            <h2 className="font-semibold text-[#0F172A]">
                                Chi tiết giao dịch
                            </h2>
                        </div>

                        <dl className="space-y-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-[#64748B]">
                                    Mã giao dịch
                                </dt>
                                <dd className="break-all text-right font-medium text-[#0F172A]">
                                    {payment.merchantTransactionRef}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-[#64748B]">
                                    Trạng thái
                                </dt>
                                <dd className="font-medium text-[#0F172A]">
                                    {payment.paymentStatus}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-[#64748B]">
                                    Gói dịch vụ
                                </dt>
                                <dd className="font-medium text-[#0F172A]">
                                    {payment.subscriptionPlan ??
                                        "Chưa cập nhật"}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-[#64748B]">
                                    Số tiền
                                </dt>
                                <dd className="font-semibold text-[#0F172A]">
                                    {formatPrice(
                                        payment.amount,
                                        payment.currency
                                    )}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-4">
                                <dt className="text-[#64748B]">
                                    Thời gian tạo
                                </dt>
                                <dd className="text-right font-medium text-[#0F172A]">
                                    {formatDate(payment.createdAt)}
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    {(isPending || error) && (
                        <button
                            type="button"
                            onClick={() => void loadPayment()}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#334155] transition hover:bg-[#F8FAFC]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Kiểm tra lại
                        </button>
                    )}

                    <Link
                        href={isPaid ? "/dashboard" : "/pricing"}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FD3E06] text-sm font-semibold text-white transition hover:bg-[#E63600]"
                    >
                        {isPaid
                            ? "Vào Dashboard"
                            : "Quay lại chọn gói"}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default function VnPayReturnPage() {
    return (
        <AuthGuard>
            <Suspense fallback={<LoadingScreen />}>
                <PaymentReturnContent />
            </Suspense>
        </AuthGuard>
    );
}