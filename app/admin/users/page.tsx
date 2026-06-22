"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useSession } from "@/hooks/useSession";
import {
  adminGetUserById,
  adminListUsers,
  adminUpdateUserRole,
  adminUpdateUserStatus,
  adminUpdateUserSubscription,
  type AdminUserDetail,
  type AdminUserListItem,
} from "@/lib/api/admin";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const ROLES = ["", "User", "SuperAdmin"] as const;
const STATUSES = ["", "Active", "Locked"] as const;
const PLANS = ["", "Free", "Basic", "Enterprise"] as const;
const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type RoleValue = (typeof ROLES)[number];
type StatusValue = (typeof STATUSES)[number];
type PlanValue = (typeof PLANS)[number];

interface Filters {
  search: string;
  role: RoleValue;
  status: StatusValue;
  plan: PlanValue;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  role: "",
  status: "",
  plan: "",
};

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const session = useSession();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [pendingSearch, setPendingSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] =
    useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [actionSaving, setActionSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Role/status/plan being edited in modal
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPlan, setEditPlan] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  const loadUsers = useCallback(
    async (currentFilters: Filters, currentPage: number) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError("");

      try {
        const response = await adminListUsers({
          search: currentFilters.search || undefined,
          role: currentFilters.role || undefined,
          status: currentFilters.status || undefined,
          plan: currentFilters.plan || undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        setUsers(response.items);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!session) return;
    void loadUsers(filters, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, filters, page]);

  function applySearch(
    event: React.FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();
    setPage(1);
    setFilters((f) => ({ ...f, search: pendingSearch }));
  }

  function applyFilter<K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ): void {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters(): void {
    setPendingSearch("");
    setPage(1);
    setFilters(EMPTY_FILTERS);
  }

  async function openUserDetail(id: string): Promise<void> {
    setSelectedUser(null);
    setDetailError("");
    setActionSuccess("");
    setActionError("");
    setDetailLoading(true);

    try {
      const detail = await adminGetUserById(id);
      setSelectedUser(detail);
      setEditRole(detail.role);
      setEditStatus(detail.status);
      setEditPlan(detail.subscriptionPlan);
    } catch (err) {
      setDetailError(getErrorMessage(err));
      setSelectedUser(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveStatus(): Promise<void> {
    if (!selectedUser || editStatus === selectedUser.status) {
      return;
    }

    setActionSaving(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await adminUpdateUserStatus(
        selectedUser.id,
        { status: editStatus }
      );
      setSelectedUser(updated);
      setEditStatus(updated.status);
      setActionSuccess("Status updated.");
      void loadUsers(filters, page);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionSaving(false);
    }
  }

  async function saveRole(): Promise<void> {
    if (!selectedUser || editRole === selectedUser.role) {
      return;
    }

    setActionSaving(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await adminUpdateUserRole(
        selectedUser.id,
        { role: editRole }
      );
      setSelectedUser(updated);
      setEditRole(updated.role);
      setActionSuccess("Role updated.");
      void loadUsers(filters, page);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionSaving(false);
    }
  }

  async function savePlan(): Promise<void> {
    if (
      !selectedUser ||
      editPlan === selectedUser.subscriptionPlan
    ) {
      return;
    }

    setActionSaving(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await adminUpdateUserSubscription(
        selectedUser.id,
        { subscriptionPlan: editPlan }
      );
      setSelectedUser(updated);
      setEditPlan(updated.subscriptionPlan);
      setActionSuccess("Subscription updated.");
      void loadUsers(filters, page);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionSaving(false);
    }
  }

  function closeDetail(): void {
    setSelectedUser(null);
    setDetailError("");
    setActionSuccess("");
    setActionError("");
  }

  const hasActiveFilters =
    filters.search ||
    filters.role ||
    filters.status ||
    filters.plan;

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      {/* Sidebar */}
      <div className="hidden sm:flex">
        <AdminSidebar />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader session={session} />

        <div className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                User Management
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                {totalItems > 0
                  ? `${totalItems} users on the platform`
                  : "Manage platform access, view usage, and moderate accounts."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <form
                onSubmit={applySearch}
                className="relative flex items-center"
              >
                <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search name or email…"
                  value={pendingSearch}
                  onChange={(e) =>
                    setPendingSearch(e.target.value)
                  }
                  className="h-9 w-52 rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                />
              </form>

              {/* Filter toggle */}
              <button
                type="button"
                onClick={() =>
                  setShowFilters((v) => !v)
                }
                className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium shadow-sm transition-colors ${
                  showFilters || hasActiveFilters
                    ? "border-[#FD3E06] bg-[#FD3E06]/5 text-[#FD3E06]"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                <Filter size={15} />
                Filters
                {hasActiveFilters && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FD3E06] text-[9px] font-bold text-white">
                    {
                      [
                        filters.role,
                        filters.status,
                        filters.plan,
                        filters.search,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => void loadUsers(filters, page)}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] shadow-sm hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <FilterSelect
                label="Role"
                value={filters.role}
                options={["All roles", "User", "SuperAdmin"]}
                values={["", "User", "SuperAdmin"]}
                onChange={(v) =>
                  applyFilter("role", v as RoleValue)
                }
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                options={[
                  "All statuses",
                  "Active",
                  "Locked",
                ]}  
                values={["", "Active", "Locked"]}
                onChange={(v) =>
                  applyFilter("status", v as StatusValue)
                }
              />
              <FilterSelect
                label="Plan"
                value={filters.plan}
                options={[
                  "All plans",
                  "Free",
                  "Basic",
                  "Enterprise",
                ]}
                values={["", "Free", "Basic", "Enterprise"]}
                onChange={(v) =>
                  applyFilter("plan", v as PlanValue)
                }
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-red-600"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#94A3B8]">
                <Loader2 className="h-4 w-4 animate-spin text-[#FD3E06]" />
                Loading users…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <tr>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        User
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Role
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Plan
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Last Login
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {users.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onManage={() =>
                          void openUserDetail(user.id)
                        }
                      />
                    ))}
                    {!loading && users.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-16 text-center text-sm text-[#94A3B8]"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#E2E8F0] px-5 py-3">
                <p className="text-xs text-[#94A3B8]">
                  Page {page} of {totalPages} —{" "}
                  {totalItems} users
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-[#E2E8F0] bg-white sm:hidden">
        {[
          { href: "/admin/dashboard", icon: "📊", label: "Overview" },
          { href: "/admin/users", icon: "👥", label: "Users" },
          { href: "/admin/companies", icon: "🏢", label: "Companies" },
        ].map(({ href, icon, label }) => (
          <a
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[9px] font-medium text-[#64748B]">
              {label}
            </span>
          </a>
        ))}
      </nav>

      {/* User Detail Modal */}
      {(detailLoading || selectedUser || detailError) && (
        <UserDetailModal
          user={selectedUser}
          loading={detailLoading}
          error={detailError}
          saving={actionSaving}
          success={actionSuccess}
          actionError={actionError}
          editRole={editRole}
          editStatus={editStatus}
          editPlan={editPlan}
          onRoleChange={setEditRole}
          onStatusChange={setEditStatus}
          onPlanChange={setEditPlan}
          onSaveStatus={() => void saveStatus()}
          onSaveRole={() => void saveRole()}
          onSavePlan={() => void savePlan()}
          onClose={closeDetail}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UserRow
// ─────────────────────────────────────────────────────────────

function UserRow({
  user,
  onManage,
}: {
  user: AdminUserListItem;
  onManage: () => void;
}) {
  const isActive = user.status === "Active";
  const isSuperAdmin = user.role === "SuperAdmin";

  return (
    <tr className="transition-colors hover:bg-[#F8FAFC]/60">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FD3E06]/10 text-xs font-bold text-[#FD3E06]">
            {(user.fullName ?? user.email)
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-[#0F172A]">
              {user.fullName ?? (
                <span className="italic text-[#94A3B8]">
                  No name
                </span>
              )}
            </div>
            <div className="text-xs text-[#64748B]">
              {user.email}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-3.5">
        {isSuperAdmin ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
            <ShieldCheck size={11} /> SuperAdmin
          </span>
        ) : (
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#64748B]">
            User
          </span>
        )}
      </td>

      <td className="px-5 py-3.5">
        <PlanBadge plan={user.subscriptionPlan} />
      </td>

      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          {isActive ? (
            <>
              <UserCheck
                size={13}
                className="text-emerald-500"
              />
              <span className="text-xs font-medium text-emerald-600">
                Active
              </span>
            </>
          ) : (
            <>
              <UserX size={13} className="text-[#94A3B8]" />
              <span className="text-xs font-medium text-[#94A3B8]">
                {user.status}
              </span>
            </>
          )}
        </div>
      </td>

      <td className="px-5 py-3.5 text-xs text-[#94A3B8]">
        {user.lastLoginAt
          ? formatDate(user.lastLoginAt)
          : "Never"}
      </td>

      <td className="px-5 py-3.5 text-right">
        <button
          type="button"
          onClick={onManage}
          title="Manage user"
          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] shadow-sm hover:bg-[#F8FAFC]"
        >
          <MoreHorizontal size={14} /> Manage
        </button>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// UserDetailModal
// ─────────────────────────────────────────────────────────────

function UserDetailModal({
  user,
  loading,
  error,
  saving,
  success,
  actionError,
  editRole,
  editStatus,
  editPlan,
  onRoleChange,
  onStatusChange,
  onPlanChange,
  onSaveStatus,
  onSaveRole,
  onSavePlan,
  onClose,
}: {
  user: AdminUserDetail | null;
  loading: boolean;
  error: string;
  saving: boolean;
  success: string;
  actionError: string;
  editRole: string;
  editStatus: string;
  editPlan: string;
  onRoleChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPlanChange: (v: string) => void;
  onSaveStatus: () => void;
  onSaveRole: () => void;
  onSavePlan: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Manage User
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#94A3B8]">
              <Loader2 className="h-4 w-4 animate-spin text-[#FD3E06]" />
              Loading user…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {user && (
            <div className="space-y-5">
              {/* Identity */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FD3E06]/10 text-lg font-bold text-[#FD3E06]">
                  {(user.fullName ?? user.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">
                    {user.fullName ?? (
                      <span className="italic text-[#94A3B8]">
                        No name
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {user.email}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Joined {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                  ✓ {success}
                </div>
              )}
              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              {/* Status */}
              <ActionRow label="Account Status">
                <select
                  value={editStatus}
                  onChange={(e) =>
                    onStatusChange(e.target.value)
                  }
                  className="h-9 rounded-lg border border-[#DCE3EC] bg-white px-2 text-sm text-[#0F172A] outline-none focus:border-[#FD3E06]"
                >
                  <option value="Active">Active</option>
                  <option value="Locked">Locked</option>
                </select>
                <SaveButton
                  dirty={editStatus !== user.status}
                  saving={saving}
                  onClick={onSaveStatus}
                />
              </ActionRow>

              {/* Role */}
              <ActionRow label="Role">
                <select
                  value={editRole}
                  onChange={(e) =>
                    onRoleChange(e.target.value)
                  }
                  className="h-9 rounded-lg border border-[#DCE3EC] bg-white px-2 text-sm text-[#0F172A] outline-none focus:border-[#FD3E06]"
                >
                  <option value="User">User</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
                <SaveButton
                  dirty={editRole !== user.role}
                  saving={saving}
                  onClick={onSaveRole}
                />
              </ActionRow>

              {/* Subscription */}
              <ActionRow label="Subscription Plan">
                <select
                  value={editPlan}
                  onChange={(e) =>
                    onPlanChange(e.target.value)
                  }
                  className="h-9 rounded-lg border border-[#DCE3EC] bg-white px-2 text-sm text-[#0F172A] outline-none focus:border-[#FD3E06]"
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <SaveButton
                  dirty={editPlan !== user.subscriptionPlan}
                  saving={saving}
                  onClick={onSavePlan}
                />
              </ActionRow>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────

function ActionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
      <span className="min-w-[120px] text-sm font-medium text-[#334155]">
        {label}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function SaveButton({
  dirty,
  saving,
  onClick,
}: {
  dirty: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!dirty || saving}
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#0F172A] px-3 text-xs font-semibold text-white hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {saving ? (
        <Loader2 size={12} className="animate-spin" />
      ) : null}
      Save
    </button>
  );
}

function FilterSelect({
  label,
  value,
  options,
  values,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  values: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs font-medium text-[#64748B]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-sm text-[#334155] outline-none focus:border-[#FD3E06]"
      >
        {options.map((opt, i) => (
          <option key={opt} value={values[i]}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const config: Record<
    string,
    { bg: string; text: string }
  > = {
    Enterprise: {
      bg: "bg-purple-100",
      text: "text-purple-700",
    },
    Basic: { bg: "bg-blue-100", text: "text-blue-700" },
    Free: { bg: "bg-[#F1F5F9]", text: "text-[#64748B]" },
  };
  const c = config[plan] ?? {
    bg: "bg-[#F1F5F9]",
    text: "text-[#64748B]",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${c.bg} ${c.text}`}
    >
      {plan}
    </span>
  );
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(d);
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "An unexpected error occurred.";
}
