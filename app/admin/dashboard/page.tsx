"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { AdminShell } from "@/components/shell/AdminShell";
import { SourceContext } from "@/components/shared/SourceContext";
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
    <AdminShell session={session}>
        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">Tổng hợp quản trị</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                Tổng quan nền tảng
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Số liệu tổng hợp từ các API quản trị người dùng và công ty.
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
              Làm mới dữ liệu
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
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {loading && !metrics ? (
            <div
              role="status"
              className="flex min-h-72 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#64748B]"
            >
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#C52F00]" />
              Đang tải số liệu quản trị…
            </div>
          ) : metrics ? (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Tổng người dùng"
                  value={metrics.totalUsers.toLocaleString()}
                  icon={<Users size={20} className="text-[#3B82F6]" />}
                />
                <KpiCard
                  title="Tài khoản hoạt động"
                  value={metrics.activeUsers.toLocaleString()}
                  icon={<Activity size={20} className="text-[#10B981]" />}
                />
                <KpiCard
                  title="Công ty"
                  value={metrics.totalCompanies.toLocaleString()}
                  icon={<Building2 size={20} className="text-[#8B5CF6]" />}
                />
                <KpiCard
                  title="Tài khoản giám sát"
                  value={metrics.linkedMonitors.toLocaleString()}
                  icon={<UserSearch size={20} className="text-[#F59E0B]" />}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <MetricChart
                  title="Phân bổ gói dịch vụ"
                  data={metrics.usersByPlan}
                  color="#C52F00"
                />
                <MetricChart
                  title="Trạng thái tài khoản"
                  data={metrics.usersByStatus}
                  color="#475569"
                />
              </div>
              <div className="mt-5">
                <SourceContext source="API quản trị người dùng và công ty" scope="Dữ liệu được tổng hợp từ nhiều yêu cầu API; thời điểm có thể khác nhau" />
              </div>
            </>
          ) : null}
        </main>
    </AdminShell>
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
    <div className="border border-line bg-surface p-5">
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
    <section aria-label={title} className="flex min-h-[340px] flex-col border border-line bg-surface p-5">
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
            <Bar isAnimationActive={false} dataKey="count" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-xs text-subtle">
        {data.map((item) => `${formatMetricName(item.name)}: ${item.count}`).join("; ")}
      </p>
    </section>
  );
}

function formatMetricName(name: string): string {
  return {
    Active: "Hoạt động",
    Locked: "Bị khóa",
    Deleted: "Đã xóa",
  }[name] ?? name;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu tổng quan quản trị.";
}
