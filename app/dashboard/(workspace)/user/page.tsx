"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bot,
    CheckCircle2,
    CreditCard,
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
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
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
import { formatRobotLimit } from "@/lib/display-labels";
import { useSession } from "@/hooks/useSession";

interface ProfileForm {
    fullName: string;
    avatarUrl: string;
    timezone: string;
}

const emptyForm: ProfileForm = {
    fullName: "",
    avatarUrl: "",
    timezone: "Asia/Ho_Chi_Minh",
};

export default function UserProfilePage() {
    const router = useRouter();
    const session = useSession();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [subscription, setSubscription] =
        useState<CurrentSubscription | null>(null);
    const [form, setForm] = useState<ProfileForm>(emptyForm);
    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (session?.isAdmin) router.replace("/admin/dashboard");
    }, [router, session?.isAdmin]);

    useEffect(() => {
        if (!session || session.isAdmin) return;
        let cancelled = false;
        const timer = window.setTimeout(() => {
            void Promise.all([
                getCurrentUserProfile(),
                getCurrentSubscription(),
            ])
                .then(([profileResponse, subscriptionResponse]) => {
                    if (cancelled) return;
                    setProfile(profileResponse);
                    setSubscription(subscriptionResponse);
                    setForm({
                        fullName: profileResponse.fullName ?? "",
                        avatarUrl: profileResponse.avatarUrl ?? "",
                        timezone:
                            profileResponse.timezone || "Asia/Ho_Chi_Minh",
                    });
                    setError("");
                })
                .catch((requestError: unknown) => {
                    if (!cancelled) setError(getErrorMessage(requestError));
                })
                .finally(() => {
                    if (!cancelled) setPageLoading(false);
                });
        }, 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [session]);

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess("");
        if (!form.timezone.trim()) {
            setError("Vui lòng nhập múi giờ.");
            return;
        }
        if (form.avatarUrl.trim() && !isValidHttpUrl(form.avatarUrl)) {
            setError("URL ảnh đại diện phải bắt đầu bằng http:// hoặc https://.");
            return;
        }

        setSaving(true);
        try {
            const updated = await updateCurrentUserProfile(form);
            setProfile(updated);
            setForm({
                fullName: updated.fullName ?? "",
                avatarUrl: updated.avatarUrl ?? "",
                timezone: updated.timezone || "Asia/Ho_Chi_Minh",
            });
            await restoreSession();
            setSuccess("Thông tin tài khoản đã được cập nhật.");
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    }

    if (!session) return null;

    const displayName = profile?.fullName?.trim() || session.name || session.email;
    const displayPlan =
        subscription?.planCode ??
        profile?.subscriptionPlan ??
        session.subscriptionPlan;
    const displayRole = profile?.role ?? session.role;

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
            <div className="hidden sm:block"><Sidebar /></div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} />
                <main className="flex-1 overflow-y-auto px-4 py-5 pb-20 sm:px-6 sm:pb-6">
                    <div className="mx-auto max-w-6xl space-y-6">
                        <header className="border-b border-line pb-5">
                            <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">
                                Tài khoản
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                                Hồ sơ và gói dịch vụ
                            </h1>
                            <p className="mt-1 text-sm text-subtle">
                                Quản lý thông tin cá nhân, múi giờ và quyền sử dụng hiện tại.
                            </p>
                        </header>

                        {pageLoading && (
                            <div className="flex items-center gap-2 border border-line bg-surface px-4 py-3 text-sm text-subtle">
                                <Loader2 className="size-4 animate-spin text-brand" />
                                Đang tải tài khoản…
                            </div>
                        )}
                        {error && <FeedbackBanner tone="error">{error}</FeedbackBanner>}
                        {success && <FeedbackBanner tone="success">{success}</FeedbackBanner>}

                        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                            <div className="space-y-6">
                                <section className="border border-line bg-surface p-6">
                                    <div className="flex items-center gap-4 border-b border-line pb-5">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xl font-semibold text-brand">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-base font-semibold text-ink">{displayName}</h2>
                                            <p className="mt-1 font-telemetry text-[10px] uppercase tracking-[.12em] text-brand">Gói {displayPlan}</p>
                                        </div>
                                    </div>
                                    <dl className="mt-5 space-y-4">
                                        <ProfileDetail icon={Mail} label="Email" value={profile?.email ?? session.email} />
                                        <ProfileDetail icon={ShieldCheck} label="Vai trò" value={displayRole === "SuperAdmin" ? "Quản trị hệ thống" : "Người dùng"} />
                                        <ProfileDetail icon={Settings} label="Múi giờ" value={profile?.timezone ?? session.timezone} />
                                    </dl>
                                </section>

                                <section className="border border-line bg-surface p-6">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="size-5 text-brand" />
                                        <h2 className="font-semibold text-ink">Gói dịch vụ</h2>
                                    </div>
                                    {subscription ? (
                                        <>
                                            <div className="mt-5 flex items-end justify-between gap-3">
                                                <div><p className="text-xs text-subtle">Gói hiện tại</p><p className="mt-1 text-xl font-semibold text-ink">{subscription.planName}</p></div>
                                                <p className="font-telemetry text-sm font-semibold text-brand">{formatPrice(subscription.monthlyPrice)}</p>
                                            </div>
                                            <div className="my-5 space-y-3 border-y border-line py-5">
                                                <Capability icon={Bot} label={formatRobotLimit(subscription.maxRobots)} enabled />
                                                <Capability icon={RadioTower} label="Gửi lệnh từ xa" enabled={subscription.canSendCommand} />
                                            </div>
                                            <p className="text-xs text-subtle">Hiệu lực từ {formatDate(subscription.startsAt)}</p>
                                        </>
                                    ) : (
                                        <p className="mt-5 text-sm text-subtle">Chưa thể tải thông tin gói dịch vụ.</p>
                                    )}
                                    <Link href="/pricing" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white hover:bg-steel">
                                        Quản lý thanh toán
                                    </Link>
                                </section>

                                <section className="border border-line bg-surface p-6">
                                    <div className="flex items-center gap-2">
                                        <Bot className="size-5 text-brand" />
                                        <h2 className="font-semibold text-ink">Phần mềm FaiRobot Studio</h2>
                                    </div>
                                    <p className="mt-2 text-xs text-subtle leading-5">
                                        Ứng dụng điều khiển và mô phỏng robot Fairino cho máy tính Windows.
                                    </p>
                                    <div className="mt-4 space-y-2">
                                        <a
                                            href="https://storage.googleapis.com/syntwin-staging-reso-2026-fairobot-downloads/FaiRobot-Studio-1.0.0-Setup.exe"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-hover"
                                        >
                                            Tải FaiRobot Studio (Windows)
                                        </a>
                                        <Link
                                            href="/download/fairobot"
                                            className="inline-flex min-h-9 w-full items-center justify-center rounded-md border border-line bg-canvas text-xs font-medium text-steel hover:text-ink"
                                        >
                                            Trang tải & Hướng dẫn cài đặt
                                        </Link>
                                    </div>
                                </section>
                            </div>

                            <section className="border border-line bg-surface p-5 sm:p-7">
                                <div className="flex items-center gap-2 border-b border-line pb-5">
                                    <UserRound className="size-5 text-brand" />
                                    <div><h2 className="text-lg font-semibold text-ink">Thông tin cá nhân</h2><p className="mt-1 text-xs text-subtle">Các thay đổi sẽ đồng bộ lại phiên đăng nhập.</p></div>
                                </div>
                                <form onSubmit={saveProfile} className="mt-6 space-y-5">
                                    <Field label="Họ và tên" htmlFor="full-name">
                                        <input id="full-name" type="text" maxLength={100} value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Nguyễn Văn A" className="h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand" />
                                    </Field>
                                    <Field label="URL ảnh đại diện" htmlFor="avatar-url">
                                        <input id="avatar-url" type="url" maxLength={500} value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://example.com/avatar.png" className="h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-brand" />
                                    </Field>
                                    <Field label="Múi giờ" htmlFor="timezone">
                                        <input id="timezone" type="text" required maxLength={50} value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))} placeholder="Asia/Ho_Chi_Minh" className="h-11 w-full rounded-md border border-line px-3 font-telemetry text-sm outline-none focus:border-brand" />
                                    </Field>
                                    <div className="flex justify-end border-t border-line pt-5">
                                        <button type="submit" disabled={saving || pageLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
                                            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                            {saving ? "Đang lưu…" : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </main>
                <MobileBottomNav />
            </div>
        </div>
    );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
    return <div><label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-steel">{label}</label>{children}</div>;
}

function ProfileDetail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return <div><dt className="flex items-center gap-3 text-[10px] uppercase tracking-[.12em] text-subtle"><Icon className="size-4 shrink-0" /><span>{label}</span></dt><dd className="mt-1 break-all pl-7 text-sm text-steel">{value}</dd></div>;
}

function Capability({ icon: Icon, label, enabled }: { icon: React.ComponentType<{ className?: string }>; label: string; enabled: boolean }) {
    return <div className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-steel"><Icon className="size-4 text-subtle" />{label}</span>{enabled ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-subtle" />}</div>;
}

function formatPrice(price: number) {
    return price === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(price);
}

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Không thể tải tài khoản.";
}

function isValidHttpUrl(value: string) {
    try {
        const url = new URL(value.trim());
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
