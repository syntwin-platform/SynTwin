"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("operator@syntwin.io");
    const [password, setPassword] = useState("password");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const result = login(email, password);
            setLoading(false);

            if (!result.ok) {
                setError(result.error);
                return;
            }

            // Redirect based on plan
            if (result.session.plan === "unpaid") {
                router.push("/pricing");
            } else {
                router.push("/dashboard");
            }
        }, 900);
    }

    return (
        <div className="relative min-h-screen bg-[#F9FAFA]">
            {/* Background subtle grid */}
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
                        <span className="text-sm text-[#64748B]">New to SynTwin?</span>
                        <a
                            href="/register"
                            className="rounded-lg bg-[#FD3E06] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#E63600]"
                        >
                            Create Account
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="relative z-10 flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Badge */}
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#FD3E06]/20 bg-[#FD3E06]/5 px-4 py-1.5">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FD3E06]" />
                            <span className="text-xs font-medium text-[#FD3E06]">Real-time Industrial Monitoring</span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-xl shadow-black/5">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FD3E06]/10">
                                <Image src="/images/syntwin-logo.png" alt="SynTwin" width={28} height={28} />
                            </div>
                            <h1 className="text-xl font-bold text-[#0F172A]">Welcome Back</h1>
                            <p className="mt-1 text-sm text-[#64748B]">Sign in to access the SynTwin dashboard</p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#334155]">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#334155]">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155]"
                                    >
                                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs text-[#64748B]">
                                    <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded border-[#E2E8F0] accent-[#FD3E06]" />
                                    Remember me
                                </label>
                                <a href="#" className="text-xs text-[#FD3E06] hover:text-[#E63600]">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FD3E06] text-sm font-semibold text-white shadow-lg shadow-[#FD3E06]/20 transition-all hover:bg-[#E63600] disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Demo accounts hint */}
                        <div className="mt-5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                                Demo Accounts (password: <span className="font-mono">password</span>)
                            </p>
                            <div className="space-y-1">
                                {[
                                    { email: "operator@syntwin.io", label: "Enterprise (full access)" },
                                    { email: "basic@syntwin.io", label: "Basic — max 3 robots" },
                                    { email: "newuser@syntwin.io", label: "Unpaid — pricing page" },
                                ].map(({ email: e, label }) => (
                                    <button
                                        key={e}
                                        type="button"
                                        onClick={() => { setEmail(e); setPassword("password"); }}
                                        className="block w-full rounded px-2 py-1 text-left text-[10px] text-[#334155] transition-colors hover:bg-[#FD3E06]/5"
                                    >
                                        <span className="font-mono text-[#FD3E06]">{e}</span>
                                        <span className="ml-2 text-[#94A3B8]">— {label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 border-t border-[#E2E8F0] pt-4 text-center">
                            <p className="text-xs text-[#64748B]">
                                Don&apos;t have an account?{" "}
                                <a href="/register" className="font-medium text-[#FD3E06] hover:text-[#E63600] hover:underline">
                                    Create one for free
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 flex items-center justify-center gap-6">
                        {["🔒 SOC-2 Compliant", "⚡ 99.8% Uptime", "🌐 Edge-hosted"].map((badge) => (
                            <span key={badge} className="text-[10px] text-[#94A3B8]">{badge}</span>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[#E2E8F0] py-5">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Image src="/images/syntwin-logo.png" alt="SynTwin" width={16} height={16} />
                        <span className="text-xs text-[#94A3B8]">© 2026 SynTwin. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0F172A]">Privacy</a>
                        <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0F172A]">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
