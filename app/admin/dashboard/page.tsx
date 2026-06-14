"use client";

import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { useSession } from "@/hooks/useSession";
import { ADMIN_MOCK_METRICS } from "@/lib/admin-mock-data";
import { Users, DollarSign, Factory, RefreshCw, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function AdminDashboardPage() {
  const session = useSession();

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar */}
      <div className="hidden sm:flex">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader session={session} />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0F172A]">Platform Overview</h2>
            <button className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition-colors text-[#64748B]">
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <KpiCard
              title="Total Users"
              value={ADMIN_MOCK_METRICS.totalUsers.toLocaleString()}
              icon={<Users size={20} className="text-[#3B82F6]" />}
              trend="+12%"
            />
            <KpiCard
              title="Total Revenue (MRR)"
              value={`$${ADMIN_MOCK_METRICS.totalRevenue.toLocaleString()}`}
              icon={<DollarSign size={20} className="text-[#10B981]" />}
              trend="+8.5%"
            />
            <KpiCard
              title="Active Factories"
              value={ADMIN_MOCK_METRICS.totalFactories.toLocaleString()}
              icon={<Factory size={20} className="text-[#8B5CF6]" />}
              trend="+3%"
            />
            <KpiCard
              title="User Retention"
              value={`${ADMIN_MOCK_METRICS.userRetentionRate}%`}
              icon={<Activity size={20} className="text-[#F59E0B]" />}
              trend="+1.2%"
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Revenue Line Chart */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm lg:col-span-2 flex flex-col min-h-[350px]">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Revenue Growth</h3>
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ADMIN_MOCK_METRICS.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#FD3E06" strokeWidth={3} dot={{ r: 4, fill: '#FD3E06', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Packages Bar Chart */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col min-h-[350px]">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Plan Distribution</h3>
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ADMIN_MOCK_METRICS.activePackages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       cursor={{ fill: '#F8FAFC' }}
                    />
                    <Bar dataKey="count" fill="#475569" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* MOBILE: Bottom navigation bar for admin */}
       <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-[#E2E8F0] bg-white sm:hidden">
        {[
          { href: "/admin/dashboard", icon: "📊", label: "Overview" },
          { href: "/admin/users", icon: "👥", label: "Users" },
          { href: "/admin/settings", icon: "⚙️", label: "Settings" },
        ].map(({ href, icon, label }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[9px] font-medium text-[#64748B]">{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

function KpiCard({ title, value, icon, trend }: { title: string; value: string; icon: React.ReactNode; trend: string }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[#64748B]">{title}</h3>
        <div className="p-2 bg-[#F8FAFC] rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <div className="text-2xl font-bold text-[#0F172A]">{value}</div>
        <div className="text-xs font-semibold text-[#10B981] mb-1 bg-[#10B981]/10 px-1.5 py-0.5 rounded-full">{trend}</div>
      </div>
    </div>
  );
}
