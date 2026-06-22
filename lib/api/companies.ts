import { apiRequest } from "@/lib/api/client";

// ────────────────────────────────────────────────────────────
// Companies — Types
// ────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  address: string | null;
  timezone: string;
  logoUrl: string | null;
  status: string;
  currentUserRole: string;
  memberCount: number;
  subscriptionPlan: string;
  maxRobots: number;
  canView3D: boolean;
  canSendCommand: boolean;
  createdAt: string;
}

export interface CompanyMember {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  joinedAt: string;
}

export interface CreateCompanyInput {
  name: string;
  industry?: string | null;
  address?: string | null;
  timezone?: string;
  logoUrl?: string | null;
}

export interface UpdateCompanyInput {
  name: string;
  industry?: string | null;
  address?: string | null;
  timezone?: string;
  logoUrl?: string | null;
}

export interface LinkedMonitorAccountInput {
  email: string;
}

export interface UpdateMonitorStatusInput {
  isActive: boolean;
}

// ────────────────────────────────────────────────────────────
// Companies — API Functions
// ────────────────────────────────────────────────────────────

export function listMyCompanies(): Promise<Company[]> {
  return apiRequest<Company[]>("/api/companies");
}

export function getCompanyById(companyId: string): Promise<Company> {
  return apiRequest<Company>(`/api/companies/${companyId}`);
}

export function createCompany(input: CreateCompanyInput): Promise<Company> {
  return apiRequest<Company>("/api/companies", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCompany(
  companyId: string,
  input: UpdateCompanyInput
): Promise<Company> {
  return apiRequest<Company>(`/api/companies/${companyId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function listCompanyMembers(companyId: string): Promise<CompanyMember[]> {
  return apiRequest<CompanyMember[]>(`/api/companies/${companyId}/members`);
}

export function addCompanyMonitor(
  companyId: string,
  input: LinkedMonitorAccountInput
): Promise<CompanyMember> {
  return apiRequest<CompanyMember>(`/api/companies/${companyId}/monitors`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function replaceCompanyMonitor(
  companyId: string,
  monitorUserId: string,
  input: LinkedMonitorAccountInput
): Promise<CompanyMember> {
  return apiRequest<CompanyMember>(
    `/api/companies/${companyId}/monitors/${monitorUserId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export function removeCompanyMonitor(
  companyId: string,
  monitorUserId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/companies/${companyId}/monitors/${monitorUserId}`,
    { method: "DELETE" }
  );
}

export function setCompanyMonitorStatus(
  companyId: string,
  monitorUserId: string,
  input: UpdateMonitorStatusInput
): Promise<CompanyMember> {
  return apiRequest<CompanyMember>(
    `/api/companies/${companyId}/monitors/${monitorUserId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}
