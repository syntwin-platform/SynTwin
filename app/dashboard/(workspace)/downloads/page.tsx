"use client";

import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Download,
    ExternalLink,
    Info,
    Lock,
    Monitor,
    Package,
    Shield,
    ShieldAlert,
    Zap,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import { FAIROBOT_DOWNLOAD_URL, FAIROBOT_VERSION } from "@/lib/constants/downloads";

const FEATURES = [
    "Mô phỏng và điều khiển cánh tay robot Fairino",
    "Kết nối trực tiếp với thiết bị thật qua mạng nội bộ",
    "Lập trình chuyển động bằng giao diện đồ họa",
    "Ghi và phát lại chuỗi lệnh",
    "Tương thích đầy đủ với hệ thống SynTwin",
];

export default function DownloadsPage() {
    const session = useSession();
    const isPaid =
        session?.plan === "basic" || session?.plan === "enterprise";

    const downloadUrl = FAIROBOT_DOWNLOAD_URL;

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
            <div className="hidden sm:block">
                <Sidebar />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session ?? undefined} />
                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-20 sm:px-6 sm:pb-6">
                    <div className="mx-auto max-w-3xl space-y-6">
                        {/* Page header */}
                        <header className="border-b border-line pb-5">
                            <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">
                                Phần mềm
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                                Tải phần mềm FaiRobot Studio
                            </h1>
                            <p className="mt-1 text-sm text-subtle">
                                Phần mềm máy tính dành riêng cho tài khoản vận hành của SynTwin.
                            </p>
                        </header>

                        {/* Main software card */}
                        <article className="border border-line bg-surface">
                            {/* Card header */}
                            <div className="flex items-start gap-4 border-b border-line p-5 sm:p-6">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-line bg-canvas">
                                    <Monitor className="size-6 text-brand" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold text-ink">
                                            FaiRobot Studio
                                        </h2>
                                        <span className="font-telemetry rounded border border-line bg-canvas px-1.5 py-0.5 text-[10px] text-subtle">
                                            v{FAIROBOT_VERSION}
                                        </span>
                                        {isPaid && (
                                            <span className="rounded border border-success/30 bg-success/10 px-1.5 py-0.5 font-telemetry text-[10px] text-success">
                                                Đã kích hoạt
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-subtle">
                                        Ứng dụng điều khiển và mô phỏng cánh tay robot Fairino — tích hợp với nền tảng SynTwin.
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                        <span className="flex items-center gap-1 text-xs text-subtle">
                                            <Package className="size-3" />
                                            Windows 10/11 (64-bit) · ~85 MB
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-subtle">
                                            <Shield className="size-3 text-emerald-600" />
                                            Phát hành bởi SynTwin Platform
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="border-b border-line p-5 sm:p-6">
                                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-subtle">
                                    Tính năng chính
                                </h3>
                                <ul className="space-y-2">
                                    {FEATURES.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2 text-sm text-steel"
                                        >
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Download or Paywall */}
                            <div className="p-5 sm:p-6">
                                {isPaid ? (
                                    <div className="space-y-4">
                                        {downloadUrl ? (
                                            <a
                                                id="btn-download-fairino-cloud"
                                                href={downloadUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover active:scale-[0.99] sm:w-auto"
                                            >
                                                <Download className="size-4" />
                                                Tải FaiRobot Studio cho Windows (v{FAIROBOT_VERSION})
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-line px-6 text-sm font-semibold text-subtle opacity-60 sm:w-auto"
                                            >
                                                Chưa có bản cài đặt
                                            </button>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-subtle">
                                            <span>Windows 10/11 64-bit</span>
                                            <span>•</span>
                                            <Link
                                                href="/download/fairobot"
                                                className="font-medium text-brand hover:underline inline-flex items-center gap-1"
                                            >
                                                <Info className="size-3.5" />
                                                Xem trang hướng dẫn cài đặt & SmartScreen
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-dashed border-line bg-canvas p-5">
                                        <div className="flex items-start gap-3">
                                            <Lock className="mt-0.5 size-5 shrink-0 text-subtle" />
                                            <div>
                                                <p className="text-sm font-medium text-ink">
                                                    Tính năng dành cho gói trả phí
                                                </p>
                                                <p className="mt-1 text-sm text-subtle">
                                                    Nâng cấp lên gói Basic hoặc Enterprise để tải và sử dụng FaiRobot Studio.
                                                </p>
                                                <Link
                                                    href="/pricing"
                                                    id="link-upgrade-for-download"
                                                    className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover"
                                                >
                                                    Xem bảng giá
                                                    <ArrowRight className="size-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </article>

                        {/* Windows SmartScreen alert */}
                        <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
                                <div className="text-xs text-amber-900 leading-5">
                                    <p className="font-semibold text-amber-950">Lưu ý khi mở bộ cài trên Windows:</p>
                                    <p className="mt-0.5">
                                        Nếu thấy cảnh báo Windows SmartScreen: Nhấn <span className="font-semibold">&quot;More info&quot;</span> (&quot;Thông tin thêm&quot;) → Chọn <span className="font-semibold">&quot;Run anyway&quot;</span> (&quot;Vẫn chạy&quot;).
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System requirements */}
                        <section className="border border-line bg-surface">
                            <div className="border-b border-line px-5 py-3">
                                <h2 className="text-sm font-semibold text-ink">
                                    Yêu cầu hệ thống
                                </h2>
                            </div>
                            <dl className="divide-y divide-line text-sm">
                                {[
                                    ["Hệ điều hành", "Windows 10 / 11 (64-bit)"],
                                    ["Bộ nhớ RAM", "Tối thiểu 4 GB"],
                                    ["Đồ họa", "OpenGL 3.3 trở lên"],
                                    ["Kết nối", "Mạng nội bộ hoặc Internet"],
                                    ["Phiên bản phần mềm", `FaiRobot Studio v${FAIROBOT_VERSION}`],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between gap-4 px-5 py-3"
                                    >
                                        <dt className="text-subtle">{label}</dt>
                                        <dd className="font-telemetry text-xs text-ink">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    </div>
                </main>
                <MobileBottomNav />
            </div>
        </div>
    );
}
