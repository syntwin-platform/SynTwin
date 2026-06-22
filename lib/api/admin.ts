import { apiRequest } from "@/lib/api/client";

// ────────────────────────────────────────────────────────────
// AdminUsers — Types
// ────────────────────────────────────────────────────────────

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  status: string;
  subscriptionPlan: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  timezone: string;
  role: string;
  status: string;
  subscriptionPlan: string;
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
  role?: string;
  status?: string;
  plan?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminUpdateUserStatusInput {
  status: string;
}

export interface AdminUpdateUserRoleInput {
  role: string;
}

export interface AdminUpdateUserSubscriptionInput {
  subscriptionPlan: string;
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
    `/api/admin/users${qs ? `?${qs}` : ""}`
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

export function adminListCompanies(search?: string): Promise<AdminCompany[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest<AdminCompany[]>(`/api/admin/companies${qs}`);
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
