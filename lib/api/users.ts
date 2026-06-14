import { apiRequest } from "@/lib/api/client";
import type {
  BackendSubscriptionPlan,
  BackendUserRole,
} from "@/lib/auth";

export interface UserProfile {
  id: string;
  email: string;
  role: BackendUserRole;
  status: string;
  subscriptionPlan: BackendSubscriptionPlan;
  timezone: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserProfileInput {
  fullName: string;
  avatarUrl: string;
  timezone: string;
}

export function getCurrentUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/users/me");
}

export function updateCurrentUserProfile(
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify({
      fullName: input.fullName.trim() || null,
      avatarUrl: input.avatarUrl.trim() || null,
      timezone: input.timezone.trim() || "UTC",
    }),
  });
}