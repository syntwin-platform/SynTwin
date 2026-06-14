import { apiRequest } from "@/lib/api/client";

export interface AdminCompany {
  id: string;
  name: string;
  slug: string;
  status: "Active" | "Suspended";
  ownerUserId?: string | null;
  ownerEmail: string;
  ownerFullName?: string | null;
  monitorCount: number;
  createdAt: string;
}

export interface AdminCompanyMember {
  userId: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  role: "Owner" | "Monitor";
  joinedAt: string;
}

export function listAdminCompanies(
  search = ""
): Promise<AdminCompany[]> {
  const normalizedSearch = search.trim();
  const query = normalizedSearch
    ? `?search=${encodeURIComponent(normalizedSearch)}`
    : "";

  return apiRequest<AdminCompany[]>(
    `/api/admin/companies${query}`
  );
}

export function listAdminCompanyMembers(
  companyId: string
): Promise<AdminCompanyMember[]> {
  return apiRequest<AdminCompanyMember[]>(
    `/api/admin/companies/${companyId}/members`
  );
}

export function addAdminCompanyMonitor(
  companyId: string,
  email: string
): Promise<AdminCompanyMember> {
  return apiRequest<AdminCompanyMember>(
    `/api/admin/companies/${companyId}/monitors`,
    {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    }
  );
}

export function replaceAdminCompanyMonitor(
  companyId: string,
  monitorUserId: string,
  email: string
): Promise<AdminCompanyMember> {
  return apiRequest<AdminCompanyMember>(
    `/api/admin/companies/${companyId}/monitors/${monitorUserId}`,
    {
      method: "PUT",
      body: JSON.stringify({ email: email.trim() }),
    }
  );
}

export function removeAdminCompanyMonitor(
  companyId: string,
  monitorUserId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/admin/companies/${companyId}/monitors/${monitorUserId}`,
    {
      method: "DELETE",
    }
  );
}