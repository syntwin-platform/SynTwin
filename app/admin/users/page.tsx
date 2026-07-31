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
import { AdminShell } from "@/components/shell/AdminShell";
import { useSession } from "@/hooks/useSession";
import {
  adminGetUserById,
  adminListUsers,
  adminUpdateUserRole,
  adminUpdateUserStatus,
  adminUpdateUserSubscription,
  type AdminSubscriptionPlan,
  type AdminUserRole,
  type AdminUserStatus,
  type AdminUserDetail,
  type AdminUserListItem,
} from "@/lib/api/admin";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type RoleValue = "" | AdminUserRole;
type StatusValue = "" | AdminUserStatus;
type PlanValue = "" | AdminSubscriptionPlan;

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
  const detailEpochRef = useRef(0);

  const loadUsers = useCallback(
    async (currentFilters: Filters, currentPage: number) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

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
          signal: controller.signal,
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
        if (abortRef.current === controller) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!session) return;

    const timeoutId = window.setTimeout(() => {
      void loadUsers(filters, page);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [session, filters, page, loadUsers]);

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
    const detailEpoch = ++detailEpochRef.current;
    setSelectedUser(null);
    setDetailError("");
    setActionSuccess("");
    setActionError("");
    setDetailLoading(true);

    try {
      const detail = await adminGetUserById(id);
      if (detailEpochRef.current !== detailEpoch) return;
      setSelectedUser(detail);
      setEditRole(detail.role);
      setEditStatus(detail.status);
      setEditPlan(detail.subscriptionPlan);
    } catch (err) {
      if (detailEpochRef.current !== detailEpoch) return;
      setDetailError(getErrorMessage(err));
      setSelectedUser(null);
    } finally {
      if (detailEpochRef.current === detailEpoch) {
        setDetailLoading(false);
      }
    }
  }

  async function saveStatus(): Promise<void> {
    if (!selectedUser || editStatus === selectedUser.status) {
      return;
    }

    const detailEpoch = detailEpochRef.current;
    setActionSaving(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await adminUpdateUserStatus(
        selectedUser.id,
        { status: editStatus as AdminUserStatus }
      );
      setUsers((current) =>
        current.map((user) =>
          user.id === updated.id ? { ...user, status: updated.status } : user
        )
      );
      if (detailEpochRef.current === detailEpoch) {
        setSelectedUser(updated);
        setEditStatus(updated.status);
        setActionSuccess("Trạng thái đã được cập nhật.");
      }
    } catch (err) {
      if (detailEpochRef.current === detailEpoch) {
        setActionError(getErrorMessage(err));
      }
    } finally {
      if (detailEpochRef.current === detailEpoch) {
        setActionSaving(false);
      }
    }
  }

  async function saveRole(): Promise<void> {
    if (!selectedUser || editRole === selectedUser.role) {
      return;
    }

    const detailEpoch = detailEpochRef.current;
    setActionSaving(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await adminUpdateUserRole(
        selectedUser.id,
        { role: editRole as AdminUserRole }
      );
      setUsers((current) =>
        current.map((user) =>
          user.id === updated.id ? { ...user, role: updated.role } : user
        )
      );
      if (detailEpochRef.current === detailEpoch) {
        setSelectedUser(updated);
        setEditRole(updated.role);
        setActionSuccess("Vai trò đã được cập nhật.");
      }
    } catch (err) {
      if (detailEpochRef.current === detailEpoch) {
        setActionError(getErrorMessage(err));
      }
    } finally {
      if (detailEpochRef.current === detailEpoch) {
        setActionSaving(false);
      }
    }
  }

  async function savePlan(): Promise<void> {
    if (
      !selectedUser ||
      editPlan === selectedUser.subscriptionPlan
    ) {
      return;
    }

    const detailEpoch = detailEpochRef.current;
    setActionSaving(true);
    setActionError("");
    setActionSuccess("");

    try {
      const updated = await adminUpdateUserSubscription(
        selectedUser.id,
        { subscriptionPlan: editPlan as AdminSubscriptionPlan }
      );
      setUsers((current) =>
        current.map((user) =>
          user.id === updated.id
            ? {
                ...user,
                subscriptionPlan: updated.subscriptionPlan,
              }
            : user
        )
      );
      if (detailEpochRef.current === detailEpoch) {
        setSelectedUser(updated);
        setEditPlan(updated.subscriptionPlan);
        setActionSuccess("Gói dịch vụ đã được cập nhật.");
      }
    } catch (err) {
      if (detailEpochRef.current === detailEpoch) {
        setActionError(getErrorMessage(err));
      }
    } finally {
      if (detailEpochRef.current === detailEpoch) {
        setActionSaving(false);
      }
    }
  }

  const closeDetail = useCallback((): void => {
    detailEpochRef.current += 1;
    setSelectedUser(null);
    setDetailLoading(false);
    setActionSaving(false);
    setDetailError("");
    setActionSuccess("");
    setActionError("");
  }, []);

  const hasActiveFilters =
    filters.search ||
    filters.role ||
    filters.status ||
    filters.plan;

  if (!session) return null;

  return (
    <AdminShell session={session}>
        <div className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">Quản trị truy cập</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                Quản lý người dùng
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                {totalItems > 0
                  ? `${totalItems} người dùng trên nền tảng`
                  : "Quản lý quyền truy cập, vai trò, trạng thái và gói dịch vụ."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <form
                onSubmit={applySearch}
                className="relative flex items-center"
              >
                <Search className="absolute left-3 h-4 w-4 text-[#475569]" />
                <input
                  type="search"
                  placeholder="Tìm tên hoặc email…"
                  aria-label="Tìm theo tên hoặc email"
                  value={pendingSearch}
                  onChange={(e) =>
                    setPendingSearch(e.target.value)
                  }
                  className="h-9 w-52 rounded-lg border border-[#E2E8F0] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#C52F00] focus:ring-2 focus:ring-[#C52F00]/10"
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
                    ? "border-[#C52F00] bg-[#C52F00]/5 text-[#C52F00]"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                <Filter size={15} />
                Bộ lọc
                {hasActiveFilters && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C52F00] text-[9px] font-bold text-white">
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
                aria-label="Làm mới danh sách người dùng"
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
                label="Vai trò"
                value={filters.role}
                options={["Tất cả vai trò", "Người dùng", "SuperAdmin"]}
                values={["", "User", "SuperAdmin"]}
                onChange={(v) =>
                  applyFilter("role", v as RoleValue)
                }
              />
              <FilterSelect
                label="Trạng thái"
                value={filters.status}
                options={[
                  "Tất cả trạng thái",
                  "Hoạt động",
                  "Đã khóa",
                  "Đã xóa",
                ]}  
                values={["", "Active", "Locked", "Deleted"]}
                onChange={(v) =>
                  applyFilter("status", v as StatusValue)
                }
              />
              <FilterSelect
                label="Gói dịch vụ"
                value={filters.plan}
                options={[
                  "Tất cả gói",
                  "Free",
                  "Basic",
                  "Premium",
                ]}
                values={["", "Free", "Basic", "Premium"]}
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
                  <X size={13} /> Xóa lọc
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
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#475569]">
                <Loader2 className="h-4 w-4 animate-spin text-[#C52F00]" />
                Đang tải người dùng…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <tr>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Người dùng
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Vai trò
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Gói
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Trạng thái
                      </th>
                      <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Lần đăng nhập cuối
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Thao tác
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
                          className="py-16 text-center text-sm text-[#475569]"
                        >
                          Không tìm thấy người dùng.
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
                <p className="text-xs text-[#475569]">
                  Trang {page}/{totalPages} —{" "}
                  {totalItems} người dùng
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    aria-label="Trang trước"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Trang sau"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
    </AdminShell>
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C52F00]/10 text-xs font-bold text-[#C52F00]">
            {(user.fullName ?? user.email)
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-[#0F172A]">
              {user.fullName ?? (
                <span className="italic text-[#475569]">
                  Chưa có tên
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
          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-medium text-[#475569]">
            Người dùng
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
              <span className="text-xs font-medium text-emerald-700">
                Hoạt động
              </span>
            </>
          ) : (
            <>
              <UserX size={13} className="text-[#475569]" />
              <span className="text-xs font-medium text-[#475569]">
                {user.status}
              </span>
            </>
          )}
        </div>
      </td>

      <td className="px-5 py-3.5 text-xs text-[#475569]">
        {user.lastLoginAt
          ? formatDate(user.lastLoginAt)
          : "Chưa từng"}
      </td>

      <td className="px-5 py-3.5 text-right">
        <button
          type="button"
          onClick={onManage}
          title="Quản lý người dùng"
          aria-label={`Quản lý ${user.fullName ?? user.email}`}
          className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] shadow-sm hover:bg-[#F8FAFC]"
        >
          <MoreHorizontal size={14} /> Quản lý
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
  const dialogRef = useDialogA11y(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-user-dialog-title" className="w-full max-w-lg rounded-md border border-line bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 id="admin-user-dialog-title" className="text-base font-semibold text-ink">
            Quản lý người dùng
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết người dùng"
            className="rounded-lg p-1 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#475569]">
              <Loader2 className="h-4 w-4 animate-spin text-[#C52F00]" />
              Đang tải người dùng…
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C52F00]/10 text-lg font-bold text-[#C52F00]">
                  {(user.fullName ?? user.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">
                    {user.fullName ?? (
                      <span className="italic text-[#475569]">
                        Chưa có tên
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[#64748B]">
                    {user.email}
                  </p>
                  <p className="text-xs text-[#475569]">
                    Tham gia {formatDate(user.createdAt)}
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
              <ActionRow label="Trạng thái tài khoản">
                <select
                  aria-label="Trạng thái tài khoản"
                  value={editStatus}
                  onChange={(e) =>
                    onStatusChange(e.target.value)
                  }
                  className="h-9 rounded-lg border border-[#DCE3EC] bg-white px-2 text-sm text-[#0F172A] outline-none focus:border-[#C52F00]"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Locked">Đã khóa</option>
                  {user.status === "Deleted" && (
                    <option value="Deleted" disabled>
                      Đã xóa
                    </option>
                  )}
                </select>
                <SaveButton
                  label="Lưu trạng thái"
                  dirty={editStatus !== user.status}
                  saving={saving}
                  onClick={onSaveStatus}
                />
              </ActionRow>

              {/* Role */}
              <ActionRow label="Vai trò">
                <select
                  aria-label="Vai trò"
                  value={editRole}
                  onChange={(e) =>
                    onRoleChange(e.target.value)
                  }
                  className="h-9 rounded-lg border border-[#DCE3EC] bg-white px-2 text-sm text-[#0F172A] outline-none focus:border-[#C52F00]"
                >
                  <option value="User">Người dùng</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
                <SaveButton
                  label="Lưu vai trò"
                  dirty={editRole !== user.role}
                  saving={saving}
                  onClick={onSaveRole}
                />
              </ActionRow>

              {/* Subscription */}
              <ActionRow label="Gói dịch vụ">
                <select
                  aria-label="Gói dịch vụ"
                  value={editPlan}
                  onChange={(e) =>
                    onPlanChange(e.target.value)
                  }
                  className="h-9 rounded-lg border border-[#DCE3EC] bg-white px-2 text-sm text-[#0F172A] outline-none focus:border-[#C52F00]"
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                </select>
                <SaveButton
                  label="Lưu gói dịch vụ"
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
  label,
  dirty,
  saving,
  onClick,
}: {
  label: string;
  dirty: boolean;
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!dirty || saving}
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#0F172A] px-3 text-xs font-semibold text-white hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {saving ? (
        <Loader2 size={12} className="animate-spin" />
      ) : null}
      Lưu
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
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-[#E2E8F0] bg-white px-2 text-sm text-[#334155] outline-none focus:border-[#C52F00]"
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
    Premium: {
      bg: "bg-purple-100",
      text: "text-purple-700",
    },
    Basic: { bg: "bg-blue-100", text: "text-blue-700" },
    Free: { bg: "bg-[#F1F5F9]", text: "text-[#475569]" },
  };
  const c = config[plan] ?? {
    bg: "bg-[#F1F5F9]",
    text: "text-[#475569]",
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
    : "Đã xảy ra lỗi không xác định.";
}

function useDialogA11y(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const controls = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    controls()[0]?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = controls();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);
  return dialogRef;
}
