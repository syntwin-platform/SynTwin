"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    Cpu,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Rocket,
    ShieldCheck,
    User,
} from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { registerUser } from "@/lib/api/auth";
import { storeAuthResponse } from "@/lib/auth";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        if (!fullName.trim()) return setError("Vui lòng nhập họ và tên.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return setError("Email chưa đúng định dạng.");
        if (password.length < 8)
            return setError("Mật khẩu phải có ít nhất 8 ký tự.");
        if (password !== confirmPassword)
            return setError("Mật khẩu xác nhận chưa khớp.");
        if (!agree) return setError("Bạn cần đồng ý với điều khoản sử dụng.");

        setLoading(true);
        try {
            const auth = await registerUser({
                email,
                password,
                fullName,
                timezone:
                    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
            });
            setSuccess(true);
            window.setTimeout(() => {
                const plan = new URLSearchParams(window.location.search).get("plan");
                const target = plan ? `/pricing?plan=${encodeURIComponent(plan)}` : "/pricing";
                if (!storeAuthResponse(auth, false)) {
                    setSuccess(false);
                    setError("Phản hồi đăng ký từ backend không hợp lệ.");
                    setLoading(false);
                    return;
                }
                window.location.replace(target);
            }, 900);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Không thể tạo tài khoản."
            );
            setLoading(false);
        }
    }

    const fieldClass =
        "mt-1.5 h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm outline-none transition focus:border-brand";

    return (
        <main className="min-h-screen bg-canvas">
            <header className="border-b border-line bg-surface">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <BrandMark />
                    <Link
                        href="/login"
                        className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-brand hover:text-brand-hover"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:py-16">
                {/* Left Side Panel — Light Modern High-Tech Card */}
                <aside className="relative hidden flex-col justify-between overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#FFF7F4] via-surface to-[#F1F5F9] p-8 lg:flex">
                    <div className="technical-grid absolute inset-0 opacity-25 pointer-events-none" />

                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                            <Rocket className="size-3.5" />
                            <span>Khởi tạo tài khoản Free</span>
                        </div>

                        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            Bắt đầu bằng demo trước khi kết nối dữ liệu thật.
                        </h2>
                        <p className="mt-4 text-sm leading-6 text-steel">
                            Tài khoản mới bắt đầu với gói Free không giới hạn thời gian. Bạn có thể khám phá dữ liệu mô phỏng, thử nghiệm tính năng trước khi nâng cấp gói Basic hoặc Premium.
                        </p>

                        <ul className="mt-8 space-y-3.5">
                            {[
                                "Không cần thông tin thanh toán để đăng ký",
                                "Bảng điều khiển demo chỉ đọc, tách biệt dữ liệu thật",
                                "Nâng cấp bất cứ lúc nào khi sẵn sàng vận hành nhà máy",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm text-steel">
                                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                                        <CheckCircle2 className="size-3.5" />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-10 rounded-xl border border-line bg-surface/80 p-4 backdrop-blur">
                        <div className="flex items-center justify-between font-telemetry text-xs">
                            <span className="text-subtle">Gói khởi tạo:</span>
                            <span className="font-semibold text-brand">FREE PLAN</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-steel">
                            <span>Quyền truy cập:</span>
                            <span className="font-medium text-ink">Demo workspace</span>
                        </div>
                    </div>
                </aside>

                {/* Right Form */}
                <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-sm">
                    <p className="font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Tài khoản Free
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                        Tạo tài khoản SynTwin
                    </h1>
                    <p className="mt-2 text-sm text-steel">
                        Điền thông tin người quản lý để bắt đầu.
                    </p>

                    {error && (
                        <FeedbackBanner tone="error" className="mt-5">
                            {error}
                        </FeedbackBanner>
                    )}

                    {success ? (
                        <div className="py-16 text-center">
                            <CheckCircle2 className="mx-auto size-12 text-success" />
                            <h3 className="mt-4 text-xl font-semibold text-ink">
                                Tạo tài khoản thành công!
                            </h3>
                            <p className="mt-2 text-sm text-subtle">
                                Đang chuyển đến bảng giá…
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-medium text-steel">
                                Họ và tên
                                <span className="relative block">
                                    <User className="absolute left-3 top-3.5 size-4 text-subtle" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={fieldClass}
                                        placeholder="Nguyễn Văn An"
                                    />
                                </span>
                            </label>

                            <label className="text-sm font-medium text-steel">
                                Email công việc
                                <span className="relative block">
                                    <Mail className="absolute left-3 top-3.5 size-4 text-subtle" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={fieldClass}
                                        placeholder="ban@congty.vn"
                                    />
                                </span>
                            </label>

                            <label className="text-sm font-medium text-steel">
                                Mật khẩu
                                <span className="relative block">
                                    <LockKeyhole className="absolute left-3 top-3.5 size-4 text-subtle" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`${fieldClass} pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={
                                            showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                                        }
                                        className="absolute right-2 top-1 inline-flex size-9 items-center justify-center text-subtle hover:text-ink"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </span>
                            </label>

                            <label className="text-sm font-medium text-steel">
                                Xác nhận mật khẩu
                                <span className="relative block">
                                    <LockKeyhole className="absolute left-3 top-3.5 size-4 text-subtle" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={fieldClass}
                                    />
                                </span>
                            </label>

                            <label className="flex items-start gap-3 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                    className="mt-1 size-4 accent-brand"
                                />
                                <span className="text-sm leading-6 text-steel">
                                    Tôi đồng ý với điều khoản sử dụng và chính sách quyền riêng tư của SynTwin.
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20 disabled:opacity-60 sm:col-span-2"
                            >
                                {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản Free"}
                                <ArrowRight className="size-4" />
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}
