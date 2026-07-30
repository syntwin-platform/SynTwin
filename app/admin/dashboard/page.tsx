"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Loader2,
  RefreshCw,
  Users,
  UserSearch,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useSession } from "@/hooks/useSession";
import {
  adminGetDashboardMetrics,
  type AdminDashboardMetrics,
} from "@/lib/api/admin";

export default function AdminDashboardPage() {
  const session = useSession();
  const [metrics, setMetrics] =
    useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const loadMetrics = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const response = await adminGetDashboardMetrics(controller.signal);
      setMetrics(response);
    } catch (requestError) {
      if (
        requestError instanceof Error &&
        requestError.name === "AbortError"
      ) {
        return;
      }

      setError(getErrorMessage(requestError));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const timeoutId = window.setTimeout(() => {
      void loadMetrics();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      abortRef.current?.abort();
    };
  }, [loadMetrics, session]);

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      <div className="hidden sm:flex">
        <AdminSidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader session={session} />

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Platform Overview
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Live platform totals from the admin user and company APIs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadMetrics()}
              disabled={loading}
              className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#64748B] shadow-sm transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh data
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => void loadMetrics()}
                  className="font-semibold underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {loading && !metrics ? (
            <div
              role="status"
              className="flex min-h-72 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#64748B]"
            >
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#FD3E06]" />
              Loading admin metrics…
            </div>
          ) : metrics ? (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Users"
                  value={metrics.totalUsers.toLocaleString()}
                  icon={<Users size={20} className="text-[#3B82F6]" />}
                />
                <KpiCard
                  title="Active Accounts"
                  value={metrics.activeUsers.toLocaleString()}
                  icon={<Activity size={20} className="text-[#10B981]" />}
                />
                <KpiCard
                  title="Companies"
                  value={metrics.totalCompanies.toLocaleString()}
                  icon={<Building2 size={20} className="text-[#8B5CF6]" />}
                />
                <KpiCard
                  title="Linked Monitors"
                  value={metrics.linkedMonitors.toLocaleString()}
                  icon={<UserSearch size={20} className="text-[#F59E0B]" />}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <MetricChart
                  title="Subscription Distribution"
                  data={metrics.usersByPlan}
                  color="#FD3E06"
                />
                <MetricChart
                  title="Account Status"
                  data={metrics.usersByStatus}
                  color="#475569"
                />
              </div>
            </>
          ) : null}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-[#E2E8F0] bg-white sm:hidden">
        {[
          { href: "/admin/dashboard", icon: "📊", label: "Overview" },
          { href: "/admin/users", icon: "👥", label: "Users" },
          { href: "/admin/companies", icon: "🏢", label: "Companies" },
        ].map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[9px] font-medium text-[#64748B]">
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#64748B]">{title}</h2>
        <div className="rounded-lg bg-[#F8FAFC] p-2">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-[#0F172A]">{value}</div>
    </div>
  );
}

function MetricChart({
  title,
  data,
  color,
}: {
  title: string;
  data: Array<{ name: string; count: number }>;
  color: string;
}) {
  return (
    <section className="flex min-h-[340px] flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">
        {title}
      </h2>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B" }}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B" }}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load admin dashboard data.";
}
