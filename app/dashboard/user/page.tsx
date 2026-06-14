"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  CreditCard,
  Eye,
  Loader2,
  Mail,
  RadioTower,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import { restoreSession } from "@/lib/api/auth";
import {
  getCurrentSubscription,
  type CurrentSubscription,
} from "@/lib/api/subscriptions";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  type UserProfile,
} from "@/lib/api/users";

interface ProfileForm {
  fullName: string;
  avatarUrl: string;
  timezone: string;
}

const EMPTY_FORM: ProfileForm = {
  fullName: "",
  avatarUrl: "",
  timezone: "UTC",
};

export default function UserProfilePage() {
  const router = useRouter();
  const session = useSession();

  const [profile, setProfile] =
    useState<UserProfile | null>(null);
  const [subscription, setSubscription] =
    useState<CurrentSubscription | null>(null);
  const [form, setForm] =
    useState<ProfileForm>(EMPTY_FORM);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (session?.isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [router, session?.isAdmin]);

  useEffect(() => {
    if (!session || session.isAdmin) {
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      setPageLoading(true);
      setError("");

      void Promise.all([
        getCurrentUserProfile(),
        getCurrentSubscription(),
      ])
        .then(([profileResponse, subscriptionResponse]) => {
          if (cancelled) return;

          setProfile(profileResponse);
          setSubscription(subscriptionResponse);
          setForm(toProfileForm(profileResponse));
        })
        .catch((requestError) => {
          if (!cancelled) {
            setError(getErrorMessage(requestError));
          }
        })
        .finally(() => {
          if (!cancelled) {
            setPageLoading(false);
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [session]);

  async function saveProfile(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.timezone.trim()) {
      setError("Timezone is required.");
      return;
    }

    if (
      form.avatarUrl.trim() &&
      !isValidHttpUrl(form.avatarUrl)
    ) {
      setError(
        "Avatar URL must start with http:// or https://."
      );
      return;
    }

    setSaving(true);

    try {
      const updatedProfile =
        await updateCurrentUserProfile(form);

      setProfile(updatedProfile);
      setForm(toProfileForm(updatedProfile));

      await restoreSession();

      setSuccess("Your profile was updated.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (!session) {
    return null;
  }

  const displayName =
    profile?.fullName?.trim() || session.name;

  const displayPlan =
    subscription?.planCode ??
    profile?.subscriptionPlan ??
    session.subscriptionPlan;

  const displayRole = profile?.role ?? session.role;

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
      <div className="hidden sm:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader session={session} />

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#0F172A]">
                User Profile
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Manage your profile and subscription details.
              </p>
            </div>

            {pageLoading && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#64748B]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your account...
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6">
                <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center border-b border-[#E2E8F0] pb-6">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#FD3E06]/10 text-3xl font-bold text-[#FD3E06]">
                      {displayName.charAt(0).toUpperCase()}
                    </div>

                    <h2 className="text-center text-lg font-bold text-[#0F172A]">
                      {displayName}
                    </h2>

                    <p className="text-sm font-medium text-[#64748B]">
                      {displayPlan} Plan
                    </p>
                  </div>

                  <div className="mt-6 space-y-4 text-sm">
                    <ProfileDetail
                      icon={Mail}
                      value={profile?.email ?? session.email}
                    />

                    <ProfileDetail
                      icon={ShieldCheck}
                      value={`Role: ${displayRole}`}
                    />

                    <ProfileDetail
                      icon={Settings}
                      value={`Timezone: ${
                        profile?.timezone ?? session.timezone
                      }`}
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#FD3E06]" />
                    <h3 className="font-semibold text-[#0F172A]">
                      Subscription
                    </h3>
                  </div>

                  {subscription ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                        Current plan
                      </p>

                      <div className="mt-1 flex items-end justify-between gap-3">
                        <p className="text-xl font-bold text-[#0F172A]">
                          {subscription.planName}
                        </p>

                        <p className="text-sm font-semibold text-[#FD3E06]">
                          {formatPrice(
                            subscription.monthlyPrice
                          )}
                        </p>
                      </div>

                      <div className="my-5 space-y-3 border-y border-[#E2E8F0] py-5">
                        <SubscriptionDetail
                          icon={Bot}
                          label={`Up to ${subscription.maxRobots} robot${
                            subscription.maxRobots === 1
                              ? ""
                              : "s"
                          }`}
                          enabled
                        />

                        <SubscriptionDetail
                          icon={Eye}
                          label="Digital Twin 3D"
                          enabled={subscription.canView3D}
                        />

                        <SubscriptionDetail
                          icon={RadioTower}
                          label="Remote commands"
                          enabled={subscription.canSendCommand}
                        />
                      </div>

                      <p className="mb-4 text-xs text-[#64748B]">
                        Active since{" "}
                        {formatDate(subscription.startsAt)}
                      </p>
                    </>
                  ) : (
                    <p className="mb-5 text-sm text-[#64748B]">
                      Subscription information is unavailable.
                    </p>
                  )}

                  <Link
                    href="/pricing"
                    className="flex w-full items-center justify-center rounded-lg bg-[#0F172A] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#334155]"
                  >
                    Manage Billing
                  </Link>
                </section>
              </div>

              <section className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm md:col-span-2">
                <div className="mb-6 flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-[#FD3E06]" />
                  <h2 className="text-lg font-semibold text-[#0F172A]">
                    Personal Information
                  </h2>
                </div>

                <form
                  onSubmit={saveProfile}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="full-name"
                      className="mb-1.5 block text-sm font-medium text-[#334155]"
                    >
                      Full name
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      maxLength={100}
                      value={form.fullName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      placeholder="Your full name"
                      className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="avatar-url"
                      className="mb-1.5 block text-sm font-medium text-[#334155]"
                    >
                      Avatar URL
                    </label>
                    <input
                      id="avatar-url"
                      type="url"
                      maxLength={500}
                      value={form.avatarUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          avatarUrl: event.target.value,
                        }))
                      }
                      placeholder="https://example.com/avatar.png"
                      className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="timezone"
                      className="mb-1.5 block text-sm font-medium text-[#334155]"
                    >
                      Timezone
                    </label>
                    <input
                      id="timezone"
                      type="text"
                      required
                      maxLength={50}
                      value={form.timezone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          timezone: event.target.value,
                        }))
                      }
                      placeholder="Asia/Ho_Chi_Minh"
                      className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                    />
                  </div>

                  <div className="flex justify-end border-t border-[#E2E8F0] pt-5">
                    <button
                      type="submit"
                      disabled={saving || pageLoading}
                      className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FD3E06] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#E63600] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

function ProfileDetail({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-[#94A3B8]" />
      <span className="break-all text-[#334155]">
        {value}
      </span>
    </div>
  );
}

function SubscriptionDetail({
  icon: Icon,
  label,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-[#334155]">
        <Icon className="h-4 w-4 text-[#94A3B8]" />
        <span>{label}</span>
      </div>

      {enabled ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="h-4 w-4 text-[#CBD5E1]" />
      )}
    </div>
  );
}

function toProfileForm(
  profile: UserProfile
): ProfileForm {
  return {
    fullName: profile.fullName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    timezone: profile.timezone || "UTC",
  };
}

function formatPrice(price: number): string {
  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(date);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Could not load your account.";
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}