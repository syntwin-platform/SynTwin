import { apiRequest } from "@/lib/api/client";
import type { BackendSubscriptionPlan } from "@/lib/auth";

export type CompanyRole = "Owner" | "Monitor";

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry?: string | null;
  address?: string | null;
  timezone: string;
  logoUrl?: string | null;
  status: "Active" | "Suspended";
  currentUserRole: CompanyRole;
  memberCount: number;
  subscriptionPlan: BackendSubscriptionPlan;
  maxRobots: number;
  canView3D: boolean;
  canSendCommand: boolean;
  createdAt: string;
}

export interface CompanyMember {
  userId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: CompanyRole;
  isActive: boolean;
  joinedAt: string;
}

export interface CompanyInput {
  name: string;
  industry?: string;
  address?: string;
  timezone: string;
  logoUrl?: string;
}

function normalizeCompanyInput(
  input: CompanyInput
): CompanyInput {
  return {
    name: input.name.trim(),
    industry: input.industry?.trim() || undefined,
    address: input.address?.trim() || undefined,
    timezone: input.timezone.trim(),
    logoUrl: input.logoUrl?.trim() || undefined,
  };
}

export function listCompanies(): Promise<Company[]> {
  return apiRequest<Company[]>("/api/companies");
}

export function createCompany(
  input: CompanyInput
): Promise<Company> {
  return apiRequest<Company>("/api/companies", {
    method: "POST",
    body: JSON.stringify(
      normalizeCompanyInput(input)
    ),
  });
}

export function updateCompany(
  companyId: string,
  input: CompanyInput
): Promise<Company> {
  return apiRequest<Company>(
    `/api/companies/${companyId}`,
    {
      method: "PUT",
      body: JSON.stringify(
        normalizeCompanyInput(input)
      ),
    }
  );
}

export function listCompanyMembers(
  companyId: string
): Promise<CompanyMember[]> {
  return apiRequest<CompanyMember[]>(
    `/api/companies/${companyId}/members`
  );
}

export function addCompanyMonitor(
  companyId: string,
  email: string
): Promise<CompanyMember> {
  return apiRequest<CompanyMember>(
    `/api/companies/${companyId}/monitors`,
    {
      method: "POST",
      body: JSON.stringify({
        email: email.trim(),
      }),
    }
  );
}

export function replaceCompanyMonitor(
  companyId: string,
  monitorUserId: string,
  email: string
): Promise<CompanyMember> {
  return apiRequest<CompanyMember>(
    `/api/companies/${companyId}/monitors/${monitorUserId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        email: email.trim(),
      }),
    }
  );
}

export function setCompanyMonitorStatus(
  companyId: string,
  monitorUserId: string,
  isActive: boolean
): Promise<CompanyMember> {
  return apiRequest<CompanyMember>(
    `/api/companies/${companyId}/monitors/${monitorUserId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }
  );
}

export function removeCompanyMonitor(
  companyId: string,
  monitorUserId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/companies/${companyId}/monitors/${monitorUserId}`,
    {
      method: "DELETE",
    }
  );
}