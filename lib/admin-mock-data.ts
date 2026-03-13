import { PlanId } from "./auth";

export interface DashboardMetrics {
  totalUsers: number;
  totalRevenue: number;
  totalFactories: number;
  monthlyRevenue: { name: string; value: number }[];
  activePackages: { name: string; count: number }[];
  userRetentionRate: number; // Percentage
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  status: "active" | "inactive";
  lastLogin: string;
  usageCount: number; // e.g., number of times they logged in or used the service
  factories: number;
}

export const ADMIN_MOCK_METRICS: DashboardMetrics = {
  totalUsers: 1240,
  totalRevenue: 45200,
  totalFactories: 342,
  userRetentionRate: 85.4,
  monthlyRevenue: [
    { name: "Jan", value: 32000 },
    { name: "Feb", value: 34500 },
    { name: "Mar", value: 36800 },
    { name: "Apr", value: 39100 },
    { name: "May", value: 42000 },
    { name: "Jun", value: 45200 },
  ],
  activePackages: [
    { name: "Unpaid", count: 450 },
    { name: "Basic", count: 520 },
    { name: "Enterprise", count: 270 },
  ],
};

export const ADMIN_MOCK_USERS: AdminUser[] = [
  { id: "USR-001", name: "Operator User", email: "operator@syntwin.io", plan: "enterprise", status: "active", lastLogin: "2026-03-12", usageCount: 145, factories: 3 },
  { id: "USR-002", name: "New User", email: "newuser@syntwin.io", plan: "unpaid", status: "inactive", lastLogin: "2026-03-01", usageCount: 2, factories: 0 },
  { id: "USR-003", name: "Basic User", email: "basic@syntwin.io", plan: "basic", status: "active", lastLogin: "2026-03-13", usageCount: 89, factories: 1 },
  { id: "USR-004", name: "Enterprise Corp", email: "enterprise@syntwin.io", plan: "enterprise", status: "active", lastLogin: "2026-03-13", usageCount: 843, factories: 5 },
  { id: "USR-005", name: "Tech Innovations", email: "tech@example.com", plan: "basic", status: "active", lastLogin: "2026-03-10", usageCount: 45, factories: 2 },
  { id: "USR-006", name: "Global Manufacturing", email: "contact@globalmfg.com", plan: "enterprise", status: "active", lastLogin: "2026-03-11", usageCount: 212, factories: 8 },
  { id: "USR-007", name: "Local Workshop", email: "info@localworkshop.com", plan: "unpaid", status: "active", lastLogin: "2026-03-05", usageCount: 5, factories: 1 },
];
