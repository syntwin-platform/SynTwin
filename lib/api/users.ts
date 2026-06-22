import { apiRequest } from "@/lib/api/client";
import type {
  BackendSubscriptionPlan,
  BackendUserRole,
} from "@/lib/auth";

// ────────────────────────────────────────────────────────────
// Users/Me — Types
// ────────────────────────────────────────────────────────────

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
  fullName?: string | null;
  avatarUrl?: string | null;
  timezone: string;
}

// ────────────────────────────────────────────────────────────
// Users/Me — API Functions
// ────────────────────────────────────────────────────────────

/** GET /api/users/me — Lấy thông tin profile của người dùng hiện tại. */
export function getCurrentUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/users/me");
}

/** PATCH /api/users/me — Cập nhật profile người dùng hiện tại. */
export function updateCurrentUserProfile(
  input: UpdateUserProfileInput
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify({
      fullName: input.fullName?.trim() || null,
      avatarUrl: input.avatarUrl?.trim() || null,
      timezone: input.timezone.trim() || "UTC",
    }),
  });
}

/**
 * GET /api/users/me/subscription — Lấy thông tin gói đăng ký hiện tại.
 * Type được định nghĩa trong `lib/api/subscriptions.ts`.
 */
export { getCurrentSubscription } from "@/lib/api/subscriptions";

/**
 * PATCH /api/users/me/subscription — Backend endpoint này luôn trả về
 * 400 với thông báo redirect sang VNPay checkout.
 * Để nâng cấp gói, hãy dùng `createVnPayCheckout` trong `lib/api/payments.ts`.
 */
export { createVnPayCheckout as upgradeSubscriptionViaPay } from "@/lib/api/payments";