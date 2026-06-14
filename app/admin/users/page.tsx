"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminHeader } from "@/components/AdminHeader";
import { useSession } from "@/hooks/useSession";
import { ADMIN_MOCK_USERS } from "@/lib/admin-mock-data";
import { Search, Filter, MoreHorizontal, UserCheck, UserX } from "lucide-react";

export default function AdminUsersPage() {
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  if (!session) return null;

  const filteredUsers = ADMIN_MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar */}
      <div className="hidden sm:flex">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader session={session} />

        {/* Users Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A]">User Management</h2>
              <p className="text-sm text-[#64748B] mt-1">Manage platform access, view usage, and moderate accounts.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                 <input 
                   type="text" 
                   placeholder="Search users..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-9 pr-4 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md w-full sm:w-64 focus:ring-1 focus:ring-[#FD3E06] outline-none transition-all placeholder:text-[#94A3B8] shadow-sm"
                 />
               </div>
               <button className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium border border-[#E2E8F0] shadow-sm hover:bg-[#F8FAFC] transition-colors text-[#64748B]">
                 <Filter size={16} /> <span className="hidden sm:inline">Filter</span>
               </button>
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <tr>
                         <th className="px-6 py-4 font-semibold text-[#475569]">User</th>
                         <th className="px-6 py-4 font-semibold text-[#475569]">Plan</th>
                         <th className="px-6 py-4 font-semibold text-[#475569]">Status</th>
                         <th className="px-6 py-4 font-semibold text-[#475569]">Usage Count</th>
                         <th className="px-6 py-4 font-semibold text-[#475569]">Factories</th>
                         <th className="px-6 py-4 font-semibold text-[#475569]">Last Login</th>
                         <th className="px-6 py-4 font-semibold text-[#475569] text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredUsers.map(user => (
                         <tr key={user.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#475569] font-bold text-xs">
                                   {user.name.charAt(0)}
                                 </div>
                                 <div>
                                   <div className="font-medium text-[#0F172A]">{user.name}</div>
                                   <div className="text-xs text-[#64748B]">{user.email}</div>
                                 </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize
                                 ${user.plan === 'enterprise' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 
                                   user.plan === 'basic' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#64748B]/10 text-[#64748B]'}
                               `}>
                                 {user.plan}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-1.5">
                                 {user.status === 'active' ? (
                                   <><UserCheck size={14} className="text-[#10B981]"/> <span className="text-[#10B981] font-medium">Active</span></>
                                 ) : (
                                   <><UserX size={14} className="text-[#94A3B8]"/> <span className="text-[#94A3B8] font-medium">Inactive</span></>
                                 )}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-[#475569] font-medium">
                               {user.usageCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-[#475569] font-medium">
                               {user.factories}
                            </td>
                            <td className="px-6 py-4 text-[#64748B] text-xs">
                               {new Date(user.lastLogin).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button className="text-[#94A3B8] hover:text-[#0F172A] transition-colors p-1 rounded-md hover:bg-[#E2E8F0]">
                                 <MoreHorizontal size={18} />
                               </button>
                            </td>
                         </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-[#64748B]">
                            No users found matching your search.
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
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
