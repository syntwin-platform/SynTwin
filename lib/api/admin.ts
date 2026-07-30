import { apiRequest } from "@/lib/api/client";

export type AdminUserRole = "User" | "SuperAdmin";
export type AdminUserStatus = "Active" | "Locked" | "Deleted";
export type AdminSubscriptionPlan = "Free" | "Basic" | "Premium";

// ────────────────────────────────────────────────────────────
// AdminUsers — Types
// ────────────────────────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  subscriptionPlan: AdminSubscriptionPlan;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  timezone: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  subscriptionPlan: AdminSubscriptionPlan;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminListUsersQuery {
  search?: string;
  role?: AdminUserRole;
  status?: AdminUserStatus;
  plan?: AdminSubscriptionPlan;
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export interface AdminUpdateUserStatusInput {
  status: AdminUserStatus;
}

export interface AdminUpdateUserRoleInput {
  role: AdminUserRole;
}

export interface AdminUpdateUserSubscriptionInput {
  subscriptionPlan: AdminSubscriptionPlan;
}

// ────────────────────────────────────────────────────────────
// AdminCompanies — Types
// ────────────────────────────────────────────────────────────

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerUserId: string | null;
  ownerEmail: string;
  ownerFullName: string | null;
  monitorCount: number;
  createdAt: string;
}

export interface AdminCompanyMember {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  joinedAt: string;
}

export interface AdminLinkedAccountInput {
  email: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  linkedMonitors: number;
  usersByStatus: Array<{
    name: AdminUserStatus;
    count: number;
  }>;
  usersByPlan: Array<{
    name: AdminSubscriptionPlan;
    count: number;
  }>;
}

// ────────────────────────────────────────────────────────────
// AdminUsers — API Functions
// ────────────────────────────────────────────────────────────

export function adminListUsers(
  query: AdminListUsersQuery = {}
): Promise<AdminUserListResponse> {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);
  if (query.plan) params.set("plan", query.plan);
  if (query.page != null) params.set("page", String(query.page));
  if (query.pageSize != null) params.set("pageSize", String(query.pageSize));

  const qs = params.toString();
  return apiRequest<AdminUserListResponse>(
    `/api/admin/users${qs ? `?${qs}` : ""}`,
    { signal: query.signal }
  );
}

export function adminGetUserById(id: string): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${id}`);
}

export function adminUpdateUserStatus(
  id: string,
  input: AdminUpdateUserStatusInput
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function adminUpdateUserRole(
  id: string,
  input: AdminUpdateUserRoleInput
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function adminUpdateUserSubscription(
  id: string,
  input: AdminUpdateUserSubscriptionInput
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${id}/subscription`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

// ────────────────────────────────────────────────────────────
// AdminCompanies — API Functions
// ────────────────────────────────────────────────────────────

export function adminListCompanies(
  search?: string,
  signal?: AbortSignal
): Promise<AdminCompany[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest<AdminCompany[]>(`/api/admin/companies${qs}`, {
    signal,
  });
}

export function adminListCompanyMembers(
  companyId: string
): Promise<AdminCompanyMember[]> {
  return apiRequest<AdminCompanyMember[]>(
    `/api/admin/companies/${companyId}/members`
  );
}

export function adminAddCompanyMonitor(
  companyId: string,
  input: AdminLinkedAccountInput
): Promise<AdminCompanyMember> {
  return apiRequest<AdminCompanyMember>(
    `/api/admin/companies/${companyId}/monitors`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function adminReplaceCompanyMonitor(
  companyId: string,
  monitorUserId: string,
  input: AdminLinkedAccountInput
): Promise<AdminCompanyMember> {
  return apiRequest<AdminCompanyMember>(
    `/api/admin/companies/${companyId}/monitors/${monitorUserId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export function adminRemoveCompanyMonitor(
  companyId: string,
  monitorUserId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/admin/companies/${companyId}/monitors/${monitorUserId}`,
    { method: "DELETE" }
  );
}

export async function adminGetDashboardMetrics(
  signal?: AbortSignal
): Promise<AdminDashboardMetrics> {
  const statuses: AdminUserStatus[] = [
    "Active",
    "Locked",
    "Deleted",
  ];
  const plans: AdminSubscriptionPlan[] = [
    "Free",
    "Basic",
    "Premium",
  ];

  const [
    totalUsersResponse,
    companies,
    ...distributionResponses
  ] = await Promise.all([
    adminListUsers({ page: 1, pageSize: 1, signal }),
    adminListCompanies(undefined, signal),
    ...statuses.map((status) =>
      adminListUsers({
        status,
        page: 1,
        pageSize: 1,
        signal,
      })
    ),
    ...plans.map((plan) =>
      adminListUsers({
        plan,
        page: 1,
        pageSize: 1,
        signal,
      })
    ),
  ]);

  const statusResponses = distributionResponses.slice(
    0,
    statuses.length
  );
  const planResponses = distributionResponses.slice(statuses.length);
  const usersByStatus = statuses.map((name, index) => ({
    name,
    count: statusResponses[index].totalItems,
  }));
  const usersByPlan = plans.map((name, index) => ({
    name,
    count: planResponses[index].totalItems,
  }));

  return {
    totalUsers: totalUsersResponse.totalItems,
    activeUsers:
      usersByStatus.find(({ name }) => name === "Active")?.count ?? 0,
    totalCompanies: companies.length,
    linkedMonitors: companies.reduce(
      (total, company) => total + company.monitorCount,
      0
    ),
    usersByStatus,
    usersByPlan,
  };
}
