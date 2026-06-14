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
import { AdminHeader } from "@/components/AdminHeader";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useSession } from "@/hooks/useSession";
import {
    addAdminCompanyMonitor,
    listAdminCompanies,
    listAdminCompanyMembers,
    removeAdminCompanyMonitor,
    replaceAdminCompanyMonitor,
    type AdminCompany,
    type AdminCompanyMember,
} from "@/lib/admin-companies";

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

    const selectedCompany = useMemo(
        () =>
            companies.find((company) => company.id === selectedCompanyId) ??
            null,
        [companies, selectedCompanyId]
    );

    const owner = members.find((member) => member.role === "Owner");
    const monitors = members.filter((member) => member.role === "Monitor");

    const loadMembers = useCallback(async (companyId: string) => {
        const response = await listAdminCompanyMembers(companyId);
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
                const response = await listAdminCompanies(searchValue);
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
            const monitor = await addAdminCompanyMonitor(
                selectedCompany.id,
                newMonitorEmail
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
            setSuccess("Monitoring account was linked.");
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
            const replacement = await replaceAdminCompanyMonitor(
                selectedCompany.id,
                monitor.userId,
                email
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
            setSuccess("Linked email was replaced.");
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

        const confirmed = window.confirm(
            `Remove ${monitor.email} from ${selectedCompany.name}?`
        );
        if (!confirmed) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await removeAdminCompanyMonitor(
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
            setSuccess("Monitoring account was removed.");
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    }

    if (!session) return null;

    return (
        <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
            <div className="hidden sm:flex">
                <AdminSidebar />
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader session={session} />

                <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0F172A]">
                                    <Building2 className="h-6 w-6 text-[#FD3E06]" />
                                    Company access management
                                </h1>
                                <p className="mt-1 text-sm text-[#64748B]">
                                    SuperAdmin controls linked monitoring
                                    accounts for every company.
                                </p>
                            </div>

                            <form
                                onSubmit={submitSearch}
                                className="flex gap-2"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Company or owner email"
                                        className="h-10 w-64 rounded-lg border border-[#DCE3EC] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#FD3E06]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DCE3EC] bg-white px-3 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Load
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
                                <div className="mb-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                                    Companies ({companies.length})
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
                                                    ? "bg-[#FD3E06]/10"
                                                    : "hover:bg-[#F8FAFC]"
                                            }`}
                                        >
                                            <div className="truncate text-sm font-semibold text-[#0F172A]">
                                                {company.name}
                                            </div>
                                            <div className="mt-1 truncate text-xs text-[#64748B]">
                                                Owner:{" "}
                                                {company.ownerEmail ||
                                                    "Not assigned"}
                                            </div>
                                            <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
                                                <Users className="h-3 w-3" />
                                                {company.monitorCount} monitors
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
                                                    "Select a company"}
                                            </h2>
                                            {owner && (
                                                <p className="mt-1 text-xs text-[#64748B]">
                                                    Owner: {owner.email}
                                                </p>
                                            )}
                                        </div>
                                        {loading && (
                                            <Loader2 className="h-5 w-5 animate-spin text-[#FD3E06]" />
                                        )}
                                    </div>

                                    {selectedCompany && (
                                        <form
                                            onSubmit={addMonitor}
                                            className="mt-5 flex flex-col gap-2 sm:flex-row"
                                        >
                                            <input
                                                type="email"
                                                required
                                                value={newMonitorEmail}
                                                onChange={(event) =>
                                                    setNewMonitorEmail(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="monitor@company.com"
                                                className="h-10 flex-1 rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#FD3E06]"
                                            />
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FD3E06] px-4 text-sm font-semibold text-white hover:bg-[#E63600] disabled:opacity-60"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                Link monitor
                                            </button>
                                        </form>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#64748B]">
                                            <tr>
                                                <th className="px-5 py-3">
                                                    Account
                                                </th>
                                                <th className="px-5 py-3">
                                                    Linked email
                                                </th>
                                                <th className="px-5 py-3 text-right">
                                                    Actions
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
                                                            Monitor
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <input
                                                            type="email"
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
                                                            className="h-9 w-full min-w-64 rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#FD3E06]"
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
                                                                Save email
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={saving}
                                                                onClick={() =>
                                                                    void removeMonitor(
                                                                        monitor
                                                                    )
                                                                }
                                                                title="Remove linked account"
                                                                className="rounded-md p-2 text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
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
                                                            className="px-5 py-10 text-center text-sm text-[#94A3B8]"
                                                        >
                                                            No monitoring
                                                            account is linked.
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
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
        : "An unexpected admin company request error occurred.";
}
