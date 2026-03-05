"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bot,
  Factory,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowRight,
  Eye,
  EyeOff,
  ChevronDown,
  Github,
  Activity,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#F9FAFA]">
      {/* Background subtle grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Image src="/images/syntwin-logo.png" alt="SynTwin" width={36} height={36} />
            <span className="text-base font-bold tracking-wide text-[#0F172A]">
              SynTwin
            </span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]">
              How It Works
            </a>
            <a href="#login" className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]">
              Login
            </a>
          </div>
          <a
            href="#login"
            className="rounded-lg bg-[#FD3E06] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#E63600]"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-24 text-center lg:pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FD3E06]/20 bg-[#FD3E06]/5 px-4 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#FD3E06]" />
            <span className="text-xs font-medium text-[#FD3E06]">
              Real-time Industrial Monitoring
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
            Your Factory,{" "}
            <span className="text-[#FD3E06]">
              Digitally Twinned
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
            Monitor industrial robot arms in real&#8209;time with immersive 3D visualization.
            Predict failures, optimize throughput, and take control of your smart factory.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#login"
              className="group flex items-center gap-2 rounded-xl bg-[#FD3E06] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FD3E06]/20 transition-all hover:bg-[#E63600] hover:shadow-[#FD3E06]/30"
            >
              Enter Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-medium text-[#334155] transition-all hover:border-[#FD3E06]/30 hover:shadow-md"
            >
              Learn More
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8">
          {[
            { value: "99.8%", label: "Uptime" },
            { value: "<50ms", label: "Latency" },
            { value: "3D", label: "Visualization" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-2xl font-bold text-[#0F172A] sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-[#64748B] sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-[#E2E8F0] bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FD3E06]">
              Capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#0F172A] sm:text-4xl">
              Everything You Need to Monitor
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-[#64748B]">
              A unified platform for real-time factory operations, predictive analytics, and
              robotic fleet management.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Factory,
                title: "3D Factory View",
                desc: "Immersive Three.js-powered 3D scene of your entire factory floor with live robot positions.",
              },
              {
                icon: Bot,
                title: "Robot Fleet Management",
                desc: "Track status, temperature, load, and cycle time for every robotic arm on the floor.",
              },
              {
                icon: Zap,
                title: "Real-time Alerts",
                desc: "Instant notifications for overheating, communication failures, and threshold breaches.",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Historical trends, OEE metrics, and predictive maintenance insights at a glance.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Access",
                desc: "Role-based access control ensures operators see only what they need.",
              },
              {
                icon: Activity,
                title: "Live Telemetry",
                desc: "Sub-second data streaming from edge sensors directly into the Digital Twin.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-[#E2E8F0] bg-white p-6 transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FD3E06]/10">
                  <f.icon className="h-5 w-5 text-[#FD3E06]" />
                </div>
                <h3 className="text-sm font-semibold text-[#0F172A]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 border-t border-[#E2E8F0] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FD3E06]">
              Workflow
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#0F172A] sm:text-4xl">
              How It Works
            </h2>
          </div>

          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect Sensors",
                desc: "Plug in edge gateways and the platform auto-discovers robot arms on the factory floor.",
              },
              {
                step: "02",
                title: "Visualize in 3D",
                desc: "See every robot, conveyor belt, and workstation rendered live in an interactive 3D scene.",
              },
              {
                step: "03",
                title: "Act on Insights",
                desc: "Receive alerts, view analytics, and make data-driven decisions to maximize uptime.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <span className="inline-block font-mono text-3xl font-bold text-[#FD3E06]/20">
                  {s.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-[#0F172A]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section id="login" className="relative z-10 border-t border-[#E2E8F0] bg-white py-24">
        <div className="mx-auto max-w-md px-6">
          <LoginCard />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#E2E8F0] py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Image src="/images/syntwin-logo.png" alt="SynTwin" width={18} height={18} />
            <span className="text-xs text-[#64748B]">
              © 2026 SynTwin. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-[#64748B] hover:text-[#0F172A]">
              Privacy
            </a>
            <a href="#" className="text-xs text-[#64748B] hover:text-[#0F172A]">
              Terms
            </a>
            <a href="#" className="text-[#64748B] hover:text-[#0F172A]">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Login Card                                                         */
/* ------------------------------------------------------------------ */
function LoginCard() {
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
      setLoading(false);
      router.push("/dashboard");
    }, 1200);
  }

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-xl shadow-black/5">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FD3E06]/10">
          <Image src="/images/syntwin-logo.png" alt="SynTwin" width={28} height={28} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A]">Welcome Back</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Sign in to access the SynTwin dashboard
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#334155]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#334155]">
            Password
          </label>
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
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-[#E2E8F0] accent-[#FD3E06]"
            />
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

      <p className="mt-6 text-center text-xs text-[#94A3B8]">
        Demo credentials are pre-filled — just click Sign In.
      </p>
    </div>
  );
}
