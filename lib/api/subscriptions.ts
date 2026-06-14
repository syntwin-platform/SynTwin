import { apiRequest } from "@/lib/api/client";
import type { BackendSubscriptionPlan } from "@/lib/auth";

export interface CurrentSubscription {
  planCode: BackendSubscriptionPlan;
  planName: string;
  monthlyPrice: number;
  maxRobots: number;
  canView3D: boolean;
  canSendCommand: boolean;
  startsAt: string;
}

export interface SubscriptionPlan {
  id: number;
  code: BackendSubscriptionPlan;
  name: string;
  monthlyPrice: number;
  maxRobots: number;
  canView3D: boolean;
  canSendCommand: boolean;
  auditRetentionDays?: number | null;
}

export function getCurrentSubscription():
  Promise<CurrentSubscription> {
  return apiRequest<CurrentSubscription>(
    "/api/users/me/subscription"
  );
}

export function listSubscriptionPlans():
  Promise<SubscriptionPlan[]> {
  return apiRequest<SubscriptionPlan[]>(
    "/api/subscription-plans",
    {
      authenticated: false,
    }
  );
}