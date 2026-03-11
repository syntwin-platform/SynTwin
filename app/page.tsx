"use client";

import React from "react";
import Image from "next/image";
import {
  Bot,
  Factory,
  ShieldCheck,
  BarChart3,
  Zap,
  ArrowRight,
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
            <a href="/login" className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]">
              Login
            </a>
            <a href="/register" className="text-sm text-[#64748B] transition-colors hover:text-[#0F172A]">
              Register
            </a>
          </div>
          <a
            href="/login"
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
              href="/login"
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

      {/* CTA */}
      <section className="relative z-10 border-t border-[#E2E8F0] bg-white py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-[#0F172A] sm:text-4xl">
            Ready to digitize your factory?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-[#64748B]">
            Join leading manufacturers already using SynTwin to cut downtime and boost
            throughput with real-time Digital Twin technology.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/register"
              className="group flex items-center gap-2 rounded-xl bg-[#FD3E06] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FD3E06]/20 transition-all hover:bg-[#E63600]"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-medium text-[#334155] transition-all hover:border-[#FD3E06]/30 hover:shadow-md"
            >
              Sign In
            </a>
          </div>
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
