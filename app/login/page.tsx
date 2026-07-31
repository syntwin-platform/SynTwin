"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Cpu,
    Eye,
    EyeOff,
    KeyRound,
    Layers,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import {
    confirmLoginCode,
    loginUser,
    requestLoginCode,
    storeAuthenticatedSession,
} from "@/lib/api/auth";
import { getPostLoginDestination } from "@/lib/access-policy";
import type { Session } from "@/lib/auth";

type Mode = "password" | "code";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<Mode>("password");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = window.setInterval(
            () => setSecondsLeft((value) => Math.max(0, value - 1)),
            1000
        );
        return () => window.clearInterval(timer);
    }, [secondsLeft]);

    function finish(session: Session) {
        const requested = new URLSearchParams(window.location.search).get("next");
        router.replace(getPostLoginDestination(session, requested));
        router.refresh();
    }

    function switchMode(nextMode: Mode) {
        if (loading || nextMode === mode) return;
        setMode(nextMode);
        setError("");
        setMessage("");
        setCode("");
        setCodeSent(false);
        setSecondsLeft(0);
    }

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Vui lòng nhập địa chỉ email.");
            return;
        }

        setLoading(true);
        try {
            if (mode === "password") {
                if (!password) throw new Error("Vui lòng nhập mật khẩu.");
                finish(storeAuthenticatedSession(await loginUser(email, password)));
            } else if (!codeSent) {
                const result = await requestLoginCode(email);
                setCodeSent(true);
                setSecondsLeft(60);
                setMessage(
                    result.message || "Nếu email tồn tại, mã đăng nhập đã được gửi."
                );
            } else {
                if (!/^\d{6}$/.test(code))
                    throw new Error("Mã đăng nhập phải gồm đúng 6 chữ số.");
                finish(
                    storeAuthenticatedSession(await confirmLoginCode(email, code))
                );
            }
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Không thể đăng nhập. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    }

    async function resendCode() {
        if (secondsLeft > 0 || !email.trim()) return;
        setLoading(true);
        setError("");
        try {
            const result = await requestLoginCode(email);
            setSecondsLeft(60);
            setMessage(result.message || "Mã mới đã được gửi.");
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Không thể gửi lại mã."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="grid min-h-screen bg-canvas lg:grid-cols-[.9fr_1.1fr]">
            {/* Left — Form */}
            <section className="flex flex-col border-r border-line bg-surface px-5 py-6 sm:px-10 lg:px-14">
                <BrandMark />
                <div className="mx-auto my-auto w-full max-w-md py-12">
                    <p className="font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Truy cập không gian vận hành
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                        Đăng nhập SynTwin
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-steel">
                        Tiếp tục bằng mật khẩu hoặc mã dùng một lần gửi qua email.
                    </p>

                    <div className="mt-7 grid grid-cols-2 gap-px rounded-md bg-line p-px">
                        <button
                            type="button"
                            aria-pressed={mode === "password"}
                            disabled={loading}
                            onClick={() => switchMode("password")}
                            className={`min-h-11 rounded-[5px] text-sm font-medium transition disabled:opacity-60 ${
                                mode === "password"
                                    ? "bg-surface text-ink shadow-sm"
                                    : "bg-canvas text-subtle hover:text-ink"
                            }`}
                        >
                            <LockKeyhole className="mr-2 inline size-4 text-brand" />
                            Mật khẩu
                        </button>
                        <button
                            type="button"
                            aria-pressed={mode === "code"}
                            disabled={loading}
                            onClick={() => switchMode("code")}
                            className={`min-h-11 rounded-[5px] text-sm font-medium transition disabled:opacity-60 ${
                                mode === "code"
                                    ? "bg-surface text-ink shadow-sm"
                                    : "bg-canvas text-subtle hover:text-ink"
                            }`}
                        >
                            <Mail className="mr-2 inline size-4 text-brand" />
                            Mã email
                        </button>
                    </div>

                    <div className="mt-5 space-y-3">
                        {error && <FeedbackBanner tone="error">{error}</FeedbackBanner>}
                        {message && <FeedbackBanner tone="success">{message}</FeedbackBanner>}
                    </div>

                    <form onSubmit={submit} className="mt-5 space-y-4">
                        <label className="block text-sm font-medium text-steel">
                            Email công việc
                            <span className="relative mt-1.5 block">
                                <Mail className="absolute left-3 top-3.5 size-4 text-subtle" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading || codeSent}
                                    autoComplete="email"
                                    placeholder="ban@congty.vn"
                                    className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-3 text-sm outline-none transition focus:border-brand"
                                />
                            </span>
                        </label>

                        {mode === "password" ? (
                            <label className="block text-sm font-medium text-steel">
                                Mật khẩu
                                <span className="relative mt-1.5 block">
                                    <LockKeyhole className="absolute left-3 top-3.5 size-4 text-subtle" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-11 text-sm outline-none transition focus:border-brand"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        className="absolute right-2 top-1 inline-flex size-9 items-center justify-center text-subtle hover:text-ink"
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </span>
                            </label>
                        ) : codeSent ? (
                            <label className="block text-sm font-medium text-steel">
                                Mã đăng nhập 6 chữ số
                                <input
                                    inputMode="numeric"
                                    value={code}
                                    onChange={(e) =>
                                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    className="mt-1.5 h-12 w-full rounded-md border border-line bg-surface text-center font-telemetry text-xl tracking-[.45em] outline-none transition focus:border-brand"
                                />
                            </label>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20 disabled:opacity-60"
                        >
                            {loading
                                ? "Đang xử lý…"
                                : mode === "password"
                                  ? "Đăng nhập"
                                  : codeSent
                                    ? "Xác nhận mã"
                                    : "Gửi mã đăng nhập"}
                            <ArrowRight className="size-4" />
                        </button>
                    </form>

                    {mode === "code" && codeSent && (
                        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-subtle">
                            <button
                                type="button"
                                disabled={secondsLeft > 0 || loading}
                                onClick={() => void resendCode()}
                                className="min-h-11 font-medium text-brand disabled:text-subtle"
                            >
                                {secondsLeft > 0
                                    ? `Gửi lại sau ${secondsLeft}s`
                                    : "Gửi lại mã"}
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => {
                                    setCode("");
                                    setCodeSent(false);
                                    setSecondsLeft(0);
                                    setMessage("");
                                }}
                                className="min-h-11 font-medium text-steel hover:text-ink disabled:opacity-60"
                            >
                                Đổi email
                            </button>
                        </div>
                    )}

                    <p className="mt-6 text-center text-sm text-subtle">
                        Chưa có tài khoản?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-brand hover:text-brand-hover"
                        >
                            Tạo tài khoản Free
                        </Link>
                    </p>
                </div>
            </section>

            {/* Right Side Showcase — Light Modern High-Tech Aesthetics */}
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#FFF7F4] via-[#F8FAFC] to-[#F1F5F9] p-12 lg:flex">
                <div className="technical-grid absolute inset-0 opacity-25 pointer-events-none" />
                <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand/5 blur-3xl" />

                {/* Top status bar */}
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 shadow-sm backdrop-blur">
                        <span className="animate-pulse-dot size-2 rounded-full bg-emerald-500" />
                        <span className="font-telemetry text-xs font-medium text-steel">
                            Hệ thống vận hành: Hoạt động 99.9%
                        </span>
                    </div>
                    <span className="font-telemetry text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                        SynTwin Platform
                    </span>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-auto max-w-lg py-8">
                    <div className="inline-flex size-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand shadow-sm">
                        <KeyRound className="size-6" />
                    </div>

                    <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Một tài khoản, đúng không gian vận hành.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-steel">
                        Phân tách rõ ràng giữa môi trường trải nghiệm Demo mô phỏng, không gian dữ liệu thật dành cho doanh nghiệp và khu vực quản trị SuperAdmin.
                    </p>

                    {/* Interactive feature cards */}
                    <div className="mt-8 space-y-3">
                        <div className="flex items-start gap-3.5 rounded-xl border border-line bg-surface/90 p-4 shadow-sm backdrop-blur transition hover:border-brand/30">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-brand">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-ink">Xác thực vai trò tự động</p>
                                <p className="mt-0.5 text-xs text-steel">
                                    Đưa bạn đến chính xác bảng điều khiển theo gói đăng ký (Free, Basic, Premium).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3.5 rounded-xl border border-line bg-surface/90 p-4 shadow-sm backdrop-blur transition hover:border-brand/30">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-brand">
                                <Activity className="size-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-ink">Telemetry thời gian thực</p>
                                <p className="mt-0.5 text-xs text-steel">
                                    Theo dõi thông số robot, nhiệt độ, độ trễ và cảnh báo tức thời.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom footer badge */}
                <div className="relative z-10 flex items-center justify-between border-t border-line/60 pt-6">
                    <p className="text-xs text-subtle">
                        Dữ liệu vận hành được bảo mật theo tiêu chuẩn công nghiệp.
                    </p>
                    <div className="flex items-center gap-1.5 font-telemetry text-xs font-semibold text-steel">
                        <Cpu className="size-3.5 text-brand" />
                        <span>v1.0.1</span>
                    </div>
                </div>
            </aside>
        </main>
    );
}
