"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    Mail,
} from "lucide-react";
import {
    confirmLoginCode,
    loginUser,
    requestLoginCode,
    storeAuthenticatedSession,
} from "@/lib/api/auth";
import type { Session } from "@/lib/auth";

type LoginMode = "password" | "emailCode";

function BrandMark({ size = "large" }: { size?: "small" | "large" }) {
    const dimensions =
        size === "large" ? "h-[88px] w-[88px]" : "h-11 w-11";

    return (
        <span
            className={`relative inline-flex shrink-0 overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-orange-100 shadow-[0_12px_30px_rgba(253,62,6,0.16)] ${dimensions}`}
            aria-label="SynTwin logo"
            role="img"
        >
            <span
                className="absolute inset-0 bg-no-repeat"
                style={{
                    backgroundImage: "url('/images/syntwin-logo.png')",
                    backgroundPosition: "64% 49%",
                    backgroundSize: "205% auto",
                }}
            />
        </span>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<LoginMode>("password");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    function redirectAfterLogin(session: Session): void {
        router.push(session.isAdmin ? "/admin/dashboard" : "/dashboard");
        router.refresh();
    }

    function changeMode(nextMode: LoginMode): void {
        setMode(nextMode);
        setError("");
        setMessage("");
        setCode("");
        setCodeSent(false);
    }

    async function handlePasswordLogin(): Promise<void> {
        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const auth = await loginUser(email, password);
            redirectAfterLogin(storeAuthenticatedSession(auth));
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    async function sendLoginCode(): Promise<void> {
        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const result = await requestLoginCode(email);
            setCodeSent(true);
            setMessage(
                result.message ||
                    "If the email exists, a login code has been sent."
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    async function handleCodeLogin(): Promise<void> {
        if (!/^\d{6}$/.test(code)) {
            setError("Please enter the 6-digit code from your email.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const auth = await confirmLoginCode(email, code);
            redirectAfterLogin(storeAuthenticatedSession(auth));
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();
        setError("");
        setMessage("");

        if (mode === "password") {
            await handlePasswordLogin();
            return;
        }

        if (codeSent) {
            await handleCodeLogin();
            return;
        }

        await sendLoginCode();
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FD3E06]/10 blur-3xl" />
            </div>

            <nav className="relative z-10 border-b border-[#E2E8F0]/80 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <BrandMark size="small" />
                        <div>
                            <span className="block text-base font-bold tracking-wide text-[#0F172A]">
                                SynTwin
                            </span>
                            <span className="block text-[10px] uppercase tracking-[0.18em] text-[#94A3B8]">
                                Industrial Digital Twin
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-[#64748B] sm:inline">
                            New to SynTwin?
                        </span>
                        <Link
                            href="/register"
                            className="rounded-lg bg-[#FD3E06] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#E63600]"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex min-h-[calc(100vh-69px)] items-center justify-center px-4 py-8 sm:py-10">
                <div className="w-full max-w-[520px]">
                    <div className="mb-5 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#FD3E06]/20 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FD3E06]" />
                            <span className="text-xs font-medium text-[#FD3E06]">
                                Real-time Industrial Monitoring
                            </span>
                        </div>
                    </div>

                    <section className="rounded-3xl border border-[#E2E8F0] bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
                        <header className="mb-6 text-center">
                            <BrandMark />
                            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
                                Welcome back
                            </h1>
                            <p className="mt-1.5 text-sm text-[#64748B]">
                                Sign in securely to your SynTwin workspace
                            </p>
                        </header>

                        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-[#F1F5F9] p-1">
                            <button
                                type="button"
                                onClick={() => changeMode("password")}
                                disabled={loading}
                                className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
                                    mode === "password"
                                        ? "bg-white text-[#0F172A] shadow-sm"
                                        : "text-[#64748B] hover:text-[#334155]"
                                }`}
                            >
                                <LockKeyhole className="h-4 w-4" />
                                Password
                            </button>
                            <button
                                type="button"
                                onClick={() => changeMode("emailCode")}
                                disabled={loading}
                                className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
                                    mode === "emailCode"
                                        ? "bg-white text-[#0F172A] shadow-sm"
                                        : "text-[#64748B] hover:text-[#334155]"
                                }`}
                            >
                                <Mail className="h-4 w-4" />
                                Email code
                            </button>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {message && (
                            <div
                                role="status"
                                className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-700"
                            >
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-semibold text-[#334155]"
                                >
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                        disabled={loading || codeSent}
                                        className="h-12 w-full rounded-xl border border-[#DCE3EC] bg-white pl-10 pr-3 text-sm text-[#0F172A] outline-none transition focus:border-[#FD3E06] focus:ring-4 focus:ring-[#FD3E06]/10 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#64748B]"
                                    />
                                </div>
                            </div>

                            {mode === "password" ? (
                                <>
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-1.5 block text-xs font-semibold text-[#334155]"
                                        >
                                            Password
                                        </label>
                                        <div className="relative">
                                            <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={password}
                                                onChange={(event) =>
                                                    setPassword(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                disabled={loading}
                                                className="h-12 w-full rounded-xl border border-[#DCE3EC] bg-white pl-10 pr-11 text-sm text-[#0F172A] outline-none transition focus:border-[#FD3E06] focus:ring-4 focus:ring-[#FD3E06]/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (current) => !current
                                                    )
                                                }
                                                disabled={loading}
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#334155]"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-xs text-[#64748B]">
                                            <input
                                                type="checkbox"
                                                defaultChecked
                                                className="h-3.5 w-3.5 rounded border-[#CBD5E1] accent-[#FD3E06]"
                                            />
                                            Remember me
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeMode("emailCode")
                                            }
                                            className="text-xs font-medium text-[#FD3E06] hover:text-[#E63600]"
                                        >
                                            Sign in without password
                                        </button>
                                    </div>
                                </>
                            ) : codeSent ? (
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label
                                            htmlFor="login-code"
                                            className="text-xs font-semibold text-[#334155]"
                                        >
                                            6-digit login code
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCodeSent(false);
                                                setCode("");
                                                setMessage("");
                                                setError("");
                                            }}
                                            disabled={loading}
                                            className="text-xs font-medium text-[#FD3E06] hover:text-[#E63600]"
                                        >
                                            Change email
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                        <input
                                            id="login-code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            value={code}
                                            onChange={(event) =>
                                                setCode(
                                                    event.target.value
                                                        .replace(/\D/g, "")
                                                        .slice(0, 6)
                                                )
                                            }
                                            placeholder="000000"
                                            autoComplete="one-time-code"
                                            autoFocus
                                            disabled={loading}
                                            className="h-14 w-full rounded-xl border border-[#DCE3EC] bg-white pl-11 pr-4 text-center font-mono text-xl font-semibold tracking-[0.45em] text-[#0F172A] outline-none transition placeholder:tracking-[0.45em] placeholder:text-[#CBD5E1] focus:border-[#FD3E06] focus:ring-4 focus:ring-[#FD3E06]/10"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={sendLoginCode}
                                        disabled={loading}
                                        className="mt-2 text-xs font-medium text-[#64748B] hover:text-[#FD3E06]"
                                    >
                                        Send a new code
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-[#FED7C9] bg-[#FFF7F3] px-4 py-3 text-xs leading-relaxed text-[#9A3412]">
                                    We will send a one-time 6-digit code to your
                                    email. No password is required.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FD3E06] text-sm font-semibold text-white shadow-lg shadow-[#FD3E06]/20 transition-all hover:-translate-y-0.5 hover:bg-[#E63600] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Please wait...
                                    </>
                                ) : (
                                    <>
                                        {mode === "password"
                                            ? "Sign in"
                                            : codeSent
                                              ? "Verify and sign in"
                                              : "Send login code"}
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-5 border-t border-[#E2E8F0] pt-5 text-center">
                            <p className="text-xs text-[#64748B]">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="font-semibold text-[#FD3E06] hover:text-[#E63600] hover:underline"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </section>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-[#94A3B8]">
                        <span>Secure JWT authentication</span>
                        <span>Email code expires in 10 minutes</span>
                        <span>Role-based access</span>
                    </div>
                </div>
            </main>
        </div>
    );
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Authentication failed. Please try again.";
}
