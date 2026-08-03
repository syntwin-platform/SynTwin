"use client";

import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Download,
    ExternalLink,
    Info,
    Laptop,
    Monitor,
    Package,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { FAIROBOT_DOWNLOAD_URL, FAIROBOT_VERSION } from "@/lib/constants/downloads";

export default function FaiRobotDownloadLandingPage() {
    const downloadUrl = FAIROBOT_DOWNLOAD_URL;

    return (
        <div className="min-h-screen bg-canvas text-ink">
            {/* Header */}
            <header className="border-b border-line bg-surface">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <BrandMark />
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-steel hover:text-ink"
                    >
                        <ArrowLeft className="size-4" />
                        Quay lại Dashboard
                    </Link>
                </div>
            </header>

            {/* Main content */}
            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
                {/* Hero card */}
                <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
                                <Monitor className="size-7" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                        FaiRobot Studio
                                    </h1>
                                    <span className="rounded border border-line bg-canvas px-2 py-0.5 font-telemetry text-xs font-semibold text-brand">
                                        v{FAIROBOT_VERSION}
                                    </span>
                                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                        Bản chính thức
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-steel">
                                    Phần mềm điều khiển, lập trình chuyển động và mô phỏng cánh tay robot Fairino cho Windows.
                                </p>
                            </div>
                        </div>

                        {/* Download CTA */}
                        <div className="shrink-0">
                            {downloadUrl ? (
                                <a
                                    id="btn-download-fairobot-direct"
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:bg-brand-hover active:scale-[0.98] sm:w-auto"
                                >
                                    <Download className="size-4" />
                                    Tải FaiRobot Studio cho Windows
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-line px-6 text-sm font-semibold text-subtle opacity-60 sm:w-auto"
                                >
                                    Chưa có bản cài đặt
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Metadata specs */}
                    <div className="mt-8 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
                        <div className="rounded-lg border border-line bg-canvas p-3">
                            <span className="text-[11px] font-medium text-subtle">Hệ điều hành</span>
                            <p className="mt-1 font-telemetry text-xs font-semibold text-ink flex items-center gap-1.5">
                                <Laptop className="size-3.5 text-brand" />
                                Windows 10 / 11 (64-bit)
                            </p>
                        </div>
                        <div className="rounded-lg border border-line bg-canvas p-3">
                            <span className="text-[11px] font-medium text-subtle">Phiên bản</span>
                            <p className="mt-1 font-telemetry text-xs font-semibold text-ink flex items-center gap-1.5">
                                <Package className="size-3.5 text-brand" />
                                v{FAIROBOT_VERSION} (Setup .exe)
                            </p>
                        </div>
                        <div className="rounded-lg border border-line bg-canvas p-3">
                            <span className="text-[11px] font-medium text-subtle">Dung lượng</span>
                            <p className="mt-1 font-telemetry text-xs font-semibold text-ink flex items-center gap-1.5">
                                <Info className="size-3.5 text-brand" />
                                ~85 MB
                            </p>
                        </div>
                        <div className="rounded-lg border border-line bg-canvas p-3">
                            <span className="text-[11px] font-medium text-subtle">Nhà phát hành</span>
                            <p className="mt-1 font-telemetry text-xs font-semibold text-ink flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 text-emerald-600" />
                                SynTwin Platform
                            </p>
                        </div>
                    </div>
                </div>

                {/* SmartScreen Warning Alert */}
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                    <div className="flex items-start gap-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <ShieldAlert className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-amber-950">
                                Lưu ý về Windows SmartScreen
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-amber-800">
                                File cài đặt thử nghiệm staging chưa được đăng ký chứng thư số thương mại (Code Signing Certificate). Khi mở file trên Windows 10/11, bộ lọc Microsoft Defender SmartScreen có thể hiển thị cảnh báo an toàn.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 font-telemetry text-xs text-amber-900">
                                <span className="font-semibold">Cách xử lý:</span>
                                <span className="rounded bg-amber-100/90 px-2 py-0.5 font-medium">
                                    1. Nhấn &quot;More info&quot; (&quot;Thông tin thêm&quot;)
                                </span>
                                <span className="rounded bg-amber-100/90 px-2 py-0.5 font-medium">
                                    2. Chọn &quot;Run anyway&quot; (&quot;Vẫn chạy&quot;)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Installation Guide */}
                <div className="mt-8 rounded-2xl border border-line bg-surface p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-ink">
                        Hướng dẫn cài đặt FaiRobot Studio
                    </h2>
                    <p className="mt-1 text-sm text-subtle">
                        Thực hiện 4 bước đơn giản để khởi chạy phần mềm trên máy tính của bạn.
                    </p>

                    <ol className="mt-6 space-y-4">
                        {[
                            {
                                step: "01",
                                title: "Tải file bộ cài đặt",
                                desc: "Nhấn nút Tải phía trên để tải file FaiRobot-Studio-Setup.exe về máy tính.",
                            },
                            {
                                step: "02",
                                title: "Khởi chạy Installer",
                                desc: "Nhấp đôi vào file vừa tải trong thư mục Downloads để bắt đầu quá trình cài đặt.",
                            },
                            {
                                step: "03",
                                title: "Bỏ qua cảnh báo SmartScreen (nếu có)",
                                desc: "Nếu Windows hiển thị khung bảo vệ SmartScreen, nhấn 'More info' -> chọn 'Run anyway'.",
                            },
                            {
                                step: "04",
                                title: "Đăng nhập tài khoản SynTwin",
                                desc: "Mở ứng dụng FaiRobot Studio sau khi hoàn tất cài đặt và nhập thông tin tài khoản SynTwin của bạn.",
                            },
                        ].map((item) => (
                            <li
                                key={item.step}
                                className="flex items-start gap-4 rounded-xl border border-line bg-canvas p-4"
                            >
                                <span className="font-telemetry text-lg font-bold text-brand">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-ink">
                                        {item.title}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-steel">
                                        {item.desc}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Footer support */}
                <div className="mt-6 text-center text-xs text-subtle">
                    <p>
                        Gặp sự cố khi tải hoặc cài đặt?{" "}
                        <a
                            href="mailto:support@syntwin.com"
                            className="font-semibold text-brand hover:underline"
                        >
                            Liên hệ bộ phận kỹ thuật SynTwin
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}
