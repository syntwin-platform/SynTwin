"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Eye,
    EyeOff,
    ArrowRight,
    User,
    Mail,
    Lock,
    Building2,
    CheckCircle2,
} from "lucide-react";
import { registerAccount, setSession } from "@/lib/auth";

export default function RegisterPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    function validate() {
        if (!fullName.trim()) return "Full name is required.";
        if (!company.trim()) return "Company name is required.";
        if (!email.trim()) return "Email is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return "Please enter a valid email address.";
        if (password.length < 8) return "Password must be at least 8 characters.";
        if (password !== confirmPassword) return "Passwords do not match.";
        if (!agree) return "You must agree to the Terms & Privacy Policy.";
        return null;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const err = validate();
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setTimeout(() => {
            // Save account to registry
            registerAccount({
                email,
                password,
                name: fullName,
                plan: "unpaid",
            });
            // Create session
            setSession({ email, name: fullName, plan: "unpaid" });
            setLoading(false);
            setSuccess(true);
            setTimeout(() => router.push("/pricing"), 1500);
        }, 1500);
    }

    /* password strength */
    const strength =
        password.length === 0
            ? 0
            : password.length < 6
                ? 1
                : password.length < 10
                    ? 2
                    : 3;
    const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
    const strengthColor = ["", "#EF4444", "#FACC15", "#22C55E"][strength];

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
                        <Image
                            src="/images/syntwin-logo.png"
                            alt="SynTwin"
                            width={36}
                            height={36}
                        />
                        <span className="text-base font-bold tracking-wide text-[#0F172A]">
                            SynTwin
                        </span>
                    </a>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-[#64748B]">
                            Already have an account?
                        </span>
                        <a
                            href="/#login"
                            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#334155] transition-all hover:border-[#FD3E06]/30 hover:shadow-md"
                        >
                            Sign In
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
                            <span className="text-xs font-medium text-[#FD3E06]">
                                Create your SynTwin account
                            </span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-xl shadow-black/5">
                        {success ? (
                            /* Success state */
                            <div className="flex flex-col items-center py-6 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/10">
                                    <CheckCircle2 className="h-8 w-8 text-[#22C55E]" />
                                </div>
                                <h2 className="text-xl font-bold text-[#0F172A]">
                                    Account Created!
                                </h2>
                                <p className="mt-2 text-sm text-[#64748B]">
                                    Welcome to SynTwin. Redirecting you to login…
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="mb-6 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FD3E06]/10">
                                        <Image
                                            src="/images/syntwin-logo.png"
                                            alt="SynTwin"
                                            width={28}
                                            height={28}
                                        />
                                    </div>
                                    <h2 className="text-xl font-bold text-[#0F172A]">
                                        Get Started
                                    </h2>
                                    <p className="mt-1 text-sm text-[#64748B]">
                                        Set up your factory monitoring workspace
                                    </p>
                                </div>

                                {/* Error */}
                                {error && (
                                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Jane Smith"
                                                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                            />
                                        </div>
                                    </div>

                                    {/* Company */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                                            Company / Factory
                                        </label>
                                        <div className="relative">
                                            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                type="text"
                                                value={company}
                                                onChange={(e) => setCompany(e.target.value)}
                                                placeholder="Acme Manufacturing"
                                                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                                            Work Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="jane@company.com"
                                                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                type={showPw ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Min. 8 characters"
                                                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPw(!showPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155]"
                                            >
                                                {showPw ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {/* Strength bar */}
                                        {password.length > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex flex-1 gap-1">
                                                    {[1, 2, 3].map((lvl) => (
                                                        <div
                                                            key={lvl}
                                                            className="h-1 flex-1 rounded-full transition-all duration-300"
                                                            style={{
                                                                backgroundColor:
                                                                    strength >= lvl
                                                                        ? strengthColor
                                                                        : "#E2E8F0",
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <span
                                                    className="text-[10px] font-medium"
                                                    style={{ color: strengthColor }}
                                                >
                                                    {strengthLabel}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#334155]">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                            <input
                                                type={showConfirmPw ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter password"
                                                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-10 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#334155]"
                                            >
                                                {showConfirmPw ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terms */}
                                    <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                                        <input
                                            type="checkbox"
                                            checked={agree}
                                            onChange={(e) => setAgree(e.target.checked)}
                                            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 rounded border-[#E2E8F0] accent-[#FD3E06]"
                                        />
                                        <span className="text-xs leading-relaxed text-[#64748B]">
                                            I agree to the{" "}
                                            <a
                                                href="#"
                                                className="text-[#FD3E06] hover:text-[#E63600] hover:underline"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="#"
                                                className="text-[#FD3E06] hover:text-[#E63600] hover:underline"
                                            >
                                                Privacy Policy
                                            </a>
                                        </span>
                                    </label>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FD3E06] text-sm font-semibold text-white shadow-lg shadow-[#FD3E06]/20 transition-all hover:bg-[#E63600] disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Creating account…
                                            </>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="my-5 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-[#E2E8F0]" />
                                    <span className="text-xs text-[#94A3B8]">or</span>
                                    <div className="h-px flex-1 bg-[#E2E8F0]" />
                                </div>

                                {/* Sign-in link */}
                                <p className="text-center text-xs text-[#64748B]">
                                    Already have an account?{" "}
                                    <a
                                        href="/#login"
                                        className="font-medium text-[#FD3E06] hover:text-[#E63600] hover:underline"
                                    >
                                        Sign in
                                    </a>
                                </p>
                            </>
                        )}
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 flex items-center justify-center gap-6">
                        {[
                            "🔒 SOC-2 Compliant",
                            "⚡ 99.8% Uptime",
                            "🌐 Edge-hosted",
                        ].map((badge) => (
                            <span key={badge} className="text-[10px] text-[#94A3B8]">
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[#E2E8F0] py-5">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/images/syntwin-logo.png"
                            alt="SynTwin"
                            width={16}
                            height={16}
                        />
                        <span className="text-xs text-[#94A3B8]">
                            © 2026 SynTwin. All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0F172A]">
                            Privacy
                        </a>
                        <a href="#" className="text-xs text-[#94A3B8] hover:text-[#0F172A]">
                            Terms
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
