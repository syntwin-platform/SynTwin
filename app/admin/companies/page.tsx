"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Building2,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Search,
    Trash2,
    UserPlus,
    Users,
} from "lucide-react";
import { AdminShell } from "@/components/shell/AdminShell";
import { useSession } from "@/hooks/useSession";
import {
    adminAddCompanyMonitor,
    adminListCompanies,
    adminListCompanyMembers,
    adminRemoveCompanyMonitor,
    adminReplaceCompanyMonitor,
    type AdminCompany,
    type AdminCompanyMember,
} from "@/lib/api/admin";

export default function AdminCompaniesPage() {
    const session = useSession();
    const [companies, setCompanies] = useState<AdminCompany[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [members, setMembers] = useState<AdminCompanyMember[]>([]);
    const [search, setSearch] = useState("");
    const [newMonitorEmail, setNewMonitorEmail] = useState("");
    const [editedEmails, setEditedEmails] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pendingRemoval, setPendingRemoval] =
        useState<AdminCompanyMember | null>(null);

    const selectedCompany = useMemo(
        () =>
            companies.find((company) => company.id === selectedCompanyId) ??
            null,
        [companies, selectedCompanyId]
    );

    const owner = members.find((member) => member.role === "Owner");
    const monitors = members.filter((member) => member.role === "Monitor");

    const loadMembers = useCallback(async (companyId: string) => {
        const response = await adminListCompanyMembers(companyId);
        setMembers(response);
        setEditedEmails(
            Object.fromEntries(
                response
                    .filter((member) => member.role === "Monitor")
                    .map((member) => [member.userId, member.email])
            )
        );
    }, []);

    const loadCompanies = useCallback(
        async (searchValue = "") => {
            setLoading(true);
            setError("");

            try {
                const response = await adminListCompanies(searchValue.trim());
                setCompanies(response);

                const current = response[0];

                if (current) {
                    setSelectedCompanyId(current.id);
                    await loadMembers(current.id);
                } else {
                    setSelectedCompanyId("");
                    setMembers([]);
                }
            } catch (requestError) {
                setError(getErrorMessage(requestError));
            } finally {
                setLoading(false);
            }
        },
        [loadMembers]
    );

    useEffect(() => {
        if (!session) return;

        const timeoutId = window.setTimeout(() => {
            void loadCompanies();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadCompanies, session]);

    async function selectCompany(companyId: string): Promise<void> {
        setSelectedCompanyId(companyId);
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await loadMembers(companyId);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }

    async function submitSearch(
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();
        await loadCompanies(search);
    }

    async function addMonitor(
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();
        if (!selectedCompany || !newMonitorEmail.trim()) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const monitor = await adminAddCompanyMonitor(
                selectedCompany.id,
                { email: newMonitorEmail.trim() }
            );
            setMembers((current) => [...current, monitor]);
            setEditedEmails((current) => ({
                ...current,
                [monitor.userId]: monitor.email,
            }));
            setCompanies((current) =>
                current.map((company) =>
                    company.id === selectedCompany.id
                        ? { ...company, monitorCount: company.monitorCount + 1 }
                        : company
                )
            );
            setNewMonitorEmail("");
            setSuccess("Tài khoản giám sát đã được liên kết.");
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    }

    async function replaceMonitor(
        monitor: AdminCompanyMember
    ): Promise<void> {
        if (!selectedCompany) return;

        const email = editedEmails[monitor.userId]?.trim();
        if (!email || email === monitor.email) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const replacement = await adminReplaceCompanyMonitor(
                selectedCompany.id,
                monitor.userId,
                { email }
            );
            setMembers((current) =>
                current.map((member) =>
                    member.userId === monitor.userId ? replacement : member
                )
            );
            setEditedEmails((current) => {
                const next = { ...current };
                delete next[monitor.userId];
                next[replacement.userId] = replacement.email;
                return next;
            });
            setSuccess("Email liên kết đã được thay thế.");
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    }

    async function removeMonitor(
        monitor: AdminCompanyMember
    ): Promise<void> {
        if (!selectedCompany) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await adminRemoveCompanyMonitor(
                selectedCompany.id,
                monitor.userId
            );
            setMembers((current) =>
                current.filter((member) => member.userId !== monitor.userId)
            );
            setCompanies((current) =>
                current.map((company) =>
                    company.id === selectedCompany.id
                        ? {
                              ...company,
                              monitorCount: Math.max(
                                  0,
                                  company.monitorCount - 1
                              ),
                          }
                        : company
                )
            );
            setSuccess("Tài khoản giám sát đã được gỡ.");
            setPendingRemoval(null);
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    }

    if (!session) return null;

    return (
        <AdminShell session={session}>
                <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0F172A]">
                                    <Building2 className="h-6 w-6 text-[#C52F00]" />
                                    Quản lý quyền truy cập công ty
                                </h1>
                                <p className="mt-1 text-sm text-[#64748B]">
                                    SuperAdmin quản lý các tài khoản giám sát được liên kết cho từng công ty.
                                </p>
                            </div>

                            <form
                                onSubmit={submitSearch}
                                className="flex gap-2"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Công ty hoặc email chủ sở hữu"
                                        className="h-10 w-64 rounded-lg border border-[#DCE3EC] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#C52F00]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DCE3EC] bg-white px-3 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Tải
                                </button>
                            </form>
                        </div>

                        {error && (
                            <Notice className="border-red-200 bg-red-50 text-red-700">
                                {error}
                            </Notice>
                        )}
                        {success && (
                            <Notice className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                {success}
                            </Notice>
                        )}

                        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                            <aside className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
                                <div className="mb-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[#475569]">
                                    Công ty ({companies.length})
                                </div>
                                <div className="space-y-1">
                                    {companies.map((company) => (
                                        <button
                                            key={company.id}
                                            type="button"
                                            onClick={() =>
                                                void selectCompany(company.id)
                                            }
                                            className={`w-full rounded-lg px-3 py-3 text-left ${
                                                selectedCompanyId === company.id
                                                    ? "bg-[#C52F00]/10"
                                                    : "hover:bg-[#F8FAFC]"
                                            }`}
                                        >
                                            <div className="truncate text-sm font-semibold text-[#0F172A]">
                                                {company.name}
                                            </div>
                                            <div className="mt-1 truncate text-xs text-[#475569]">
                                                Chủ sở hữu:{" "}
                                                {company.ownerEmail ||
                                                    "Chưa chỉ định"}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-[#475569]">
                                                <Users className="h-3 w-3" />
                                                {company.monitorCount} giám sát
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </aside>

                            <section className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
                                <div className="border-b border-[#E2E8F0] p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-[#0F172A]">
                                                {selectedCompany?.name ??
                                                    "Chọn một công ty"}
                                            </h2>
                                            {owner && (
                                                <p className="mt-1 text-xs text-[#64748B]">
                                                    Chủ sở hữu: {owner.email}
                                                </p>
                                            )}
                                        </div>
                                        {loading && (
                                            <Loader2 className="h-5 w-5 animate-spin text-[#C52F00]" />
                                        )}
                                    </div>

                                    {selectedCompany && (
                                        <form
                                            onSubmit={addMonitor}
                                            className="mt-5 flex flex-col gap-2 sm:flex-row"
                                        >
                                            <input
                                                type="email"
                                                aria-label="Email tài khoản giám sát mới"
                                                required
                                                value={newMonitorEmail}
                                                onChange={(event) =>
                                                    setNewMonitorEmail(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="monitor@company.com"
                                                className="h-10 flex-1 rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00]"
                                            />
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#C52F00] px-4 text-sm font-semibold text-white hover:bg-[#9F2600] disabled:opacity-60"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Liên kết tài khoản
                                            </button>
                                        </form>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#64748B]">
                                            <tr>
                                                <th className="px-5 py-3">
                                                    Tài khoản
                                                </th>
                                                <th className="px-5 py-3">
                                                    Email liên kết
                                                </th>
                                                <th className="px-5 py-3 text-right">
                                                    Thao tác
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E2E8F0]">
                                            {monitors.map((monitor) => (
                                                <tr key={monitor.userId}>
                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-[#0F172A]">
                                                            {monitor.fullName ??
                                                                monitor.email}
                                                        </div>
                                                        <div className="text-xs text-blue-600">
                                                            Giám sát
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <input
                                                            type="email"
                                                            aria-label={`Email liên kết của ${monitor.fullName ?? monitor.email}`}
                                                            value={
                                                                editedEmails[
                                                                    monitor
                                                                        .userId
                                                                ] ??
                                                                monitor.email
                                                            }
                                                            onChange={(event) =>
                                                                setEditedEmails(
                                                                    (
                                                                        current
                                                                    ) => ({
                                                                        ...current,
                                                                        [monitor.userId]:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            className="h-9 w-full min-w-64 rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00]"
                                                        />
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    saving ||
                                                                    editedEmails[
                                                                        monitor
                                                                            .userId
                                                                    ] ===
                                                                        monitor.email
                                                                }
                                                                onClick={() =>
                                                                    void replaceMonitor(
                                                                        monitor
                                                                    )
                                                                }
                                                                className="rounded-md bg-[#0F172A] px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                                                            >
                                                                Lưu email
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={saving}
                                                                onClick={() => setPendingRemoval(monitor)}
                                                                title="Gỡ tài khoản liên kết"
                                                                aria-label={`Gỡ tài khoản giám sát ${monitor.fullName ?? monitor.email}`}
                                                                className="rounded-md p-2 text-[#475569] hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {!loading &&
                                                selectedCompany &&
                                                monitors.length === 0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={3}
                                                            className="px-5 py-10 text-center text-sm text-[#475569]"
                                                        >
                                                            Chưa liên kết tài khoản giám sát.
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                        {pendingRemoval && selectedCompany && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
                                <div role="alertdialog" aria-modal="true" aria-labelledby="remove-monitor-title" className="w-full max-w-md rounded-md border border-line bg-surface p-6 shadow-2xl">
                                    <h2 id="remove-monitor-title" className="text-lg font-semibold text-ink">Gỡ tài khoản giám sát</h2>
                                    <p className="mt-3 text-sm leading-6 text-steel">Gỡ <strong>{editedEmails[pendingRemoval.userId] ?? pendingRemoval.email}</strong> khỏi {selectedCompany.name}? Tài khoản sẽ mất quyền truy cập công ty.</p>
                                    <div className="mt-6 flex justify-end gap-2">
                                        <button type="button" disabled={saving} onClick={() => setPendingRemoval(null)} className="min-h-11 rounded-md border border-line px-4 text-sm font-semibold text-steel">Hủy</button>
                                        <button type="button" disabled={saving} onClick={() => void removeMonitor(pendingRemoval)} className="min-h-11 rounded-md bg-danger px-4 text-sm font-semibold text-white disabled:opacity-60">Xác nhận gỡ</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
        </AdminShell>
    );
}

function Notice({
    children,
    className,
}: {
    children: React.ReactNode;
    className: string;
}) {
    return (
        <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${className}`}
        >
            {children}
        </div>
    );
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Đã xảy ra lỗi khi xử lý công ty.";
}
