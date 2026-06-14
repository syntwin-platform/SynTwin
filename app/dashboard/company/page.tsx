"use client";

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Building2,
    CheckCircle2,
    Eye,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    Power,
    RefreshCw,
    Save,
    ShieldCheck,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Sidebar } from "@/components/Sidebar";
import { useSession } from "@/hooks/useSession";
import { useCompany } from "@/lib/company-context";
import {
    addCompanyMonitor,
    createCompany,
    listCompanyMembers,
    replaceCompanyMonitor,
    setCompanyMonitorStatus,
    updateCompany,
    type Company,
    type CompanyInput,
    type CompanyMember,
} from "@/lib/companies";

const EMPTY_FORM: CompanyInput = {
    name: "",
    industry: "",
    address: "",
    timezone: "Asia/Ho_Chi_Minh",
    logoUrl: "",
};

export default function CompanyPage() {
    const session = useSession();
    const {
        companies,
        selectedCompany,
        selectedCompanyId,
        isLoadingCompanies,
        companyError,
        selectCompany,
        refreshCompanies,
        clearCompanyError,
    } = useCompany();

    const [isCreating, setIsCreating] =
        useState(false);

    const displayedCompany = isCreating
        ? null
        : selectedCompany;

    function startCreating(): void {
        clearCompanyError();
        setIsCreating(true);
    }

    function handleSelectCompany(
        companyId: string
    ): void {
        if (selectCompany(companyId)) {
            setIsCreating(false);
        }
    }

    function handleCreateComplete(): void {
        setIsCreating(false);
    }

    if (!session) return null;

    const workspaceKey = isCreating
        ? "new-company"
        : selectedCompanyId ?? "no-company";

    return (
        <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#F1F5F9]">
            <div className="hidden sm:flex">
                <Sidebar />
            </div>

            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} />

                <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6">
                    <div className="mx-auto max-w-7xl">
                        <PageHeading
                            onCreate={startCreating}
                        />

                        {companyError && (
                            <Notice className="border-amber-200 bg-amber-50 text-amber-700">
                                <span className="flex-1">
                                    {companyError}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void refreshCompanies()
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2.5 py-1 text-xs font-semibold hover:bg-amber-100"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Retry
                                </button>
                            </Notice>
                        )}

                        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                            <CompanyList
                                companies={companies}
                                selectedCompanyId={
                                    isCreating
                                        ? null
                                        : selectedCompanyId
                                }
                                loading={
                                    isLoadingCompanies
                                }
                                onSelect={
                                    handleSelectCompany
                                }
                            />

                            <CompanyWorkspace
                                key={workspaceKey}
                                company={displayedCompany}
                                contextLoading={
                                    isLoadingCompanies
                                }
                                refreshCompanies={
                                    refreshCompanies
                                }
                                onCreateComplete={
                                    handleCreateComplete
                                }
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function CompanyWorkspace({
    company,
    contextLoading,
    refreshCompanies,
    onCreateComplete,
}: {
    company: Company | null;
    contextLoading: boolean;
    refreshCompanies: (
        preferredCompanyId?: string
    ) => Promise<void>;
    onCreateComplete: () => void;
}) {
    const companyId = company?.id ?? null;
    const isOwner =
        company?.currentUserRole === "Owner";

    const [form, setForm] =
        useState<CompanyInput>(() =>
            company ? toForm(company) : EMPTY_FORM
        );
    const [members, setMembers] = useState<
        CompanyMember[]
    >([]);

    const [saving, setSaving] = useState(false);
    const [memberSaving, setMemberSaving] =
        useState(false);
    const [loadingMembers, setLoadingMembers] =
        useState(isOwner);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [monitorEmail, setMonitorEmail] =
        useState("");
    const [
        editingMonitorId,
        setEditingMonitorId,
    ] = useState("");
    const [
        editingMonitorEmail,
        setEditingMonitorEmail,
    ] = useState("");

    const monitors = useMemo(
        () =>
            members
                .filter(
                    (member) =>
                        member.role === "Monitor"
                )
                .sort((first, second) => {
                    if (
                        first.isActive !==
                        second.isActive
                    ) {
                        return first.isActive
                            ? -1
                            : 1;
                    }

                    return first.email.localeCompare(
                        second.email
                    );
                }),
        [members]
    );

    const loadMembers =
        useCallback(async (): Promise<void> => {
            if (!companyId || !isOwner) {
                setMembers([]);
                setLoadingMembers(false);
                return;
            }

            setLoadingMembers(true);

            try {
                const response =
                    await listCompanyMembers(
                        companyId
                    );

                setMembers(response);
            } catch (requestError) {
                setError(
                    getErrorMessage(requestError)
                );
            } finally {
                setLoadingMembers(false);
            }
        }, [companyId, isOwner]);

    useEffect(() => {
        if (!companyId || !isOwner) return;

        const timeoutId = window.setTimeout(() => {
            void loadMembers();
        }, 0);

        return () =>
            window.clearTimeout(timeoutId);
    }, [companyId, isOwner, loadMembers]);

    function resetMessages(): void {
        setError("");
        setSuccess("");
    }

    function cancelEditingMonitor(): void {
        setEditingMonitorId("");
        setEditingMonitorEmail("");
    }

    async function saveCompany(
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();
        resetMessages();

        if (form.name.trim().length < 2) {
            setError(
                "Company name must contain at least 2 characters."
            );
            return;
        }

        if (
            form.logoUrl?.trim() &&
            !isValidHttpUrl(form.logoUrl)
        ) {
            setError(
                "Logo URL must start with http:// or https://."
            );
            return;
        }

        setSaving(true);

        try {
            if (company) {
                if (!isOwner) {
                    setError(
                        "Monitor accounts cannot edit company information."
                    );
                    return;
                }

                const updated =
                    await updateCompany(
                        company.id,
                        form
                    );

                setForm(toForm(updated));

                await refreshCompanies(
                    updated.id
                );

                setSuccess(
                    "Company information was updated."
                );
                return;
            }

            const created =
                await createCompany(form);

            await refreshCompanies(created.id);
            onCreateComplete();
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    }

    async function addMonitor(
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();

        if (!companyId || !monitorEmail.trim()) {
            return;
        }

        setMemberSaving(true);
        resetMessages();

        try {
            await addCompanyMonitor(
                companyId,
                monitorEmail
            );

            await Promise.all([
                loadMembers(),
                refreshCompanies(companyId),
            ]);

            setMonitorEmail("");
            setSuccess(
                "Monitoring account was linked and enabled."
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setMemberSaving(false);
        }
    }

    function startEditingMonitor(
        monitor: CompanyMember
    ): void {
        if (!monitor.isActive) return;

        resetMessages();
        setEditingMonitorId(monitor.userId);
        setEditingMonitorEmail(monitor.email);
    }

    async function replaceMonitor(
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> {
        event.preventDefault();

        if (
            !companyId ||
            !editingMonitorId ||
            !editingMonitorEmail.trim()
        ) {
            return;
        }

        setMemberSaving(true);
        resetMessages();

        try {
            await replaceCompanyMonitor(
                companyId,
                editingMonitorId,
                editingMonitorEmail
            );

            await Promise.all([
                loadMembers(),
                refreshCompanies(companyId),
            ]);

            cancelEditingMonitor();
            setSuccess(
                "Monitoring account was replaced."
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setMemberSaving(false);
        }
    }

    async function toggleMonitorStatus(
        monitor: CompanyMember
    ): Promise<void> {
        if (!companyId) return;

        const nextStatus = !monitor.isActive;
        const action = nextStatus
            ? "Enable"
            : "Disable";

        if (
            !window.confirm(
                `${action} monitoring access for ${monitor.email}?`
            )
        ) {
            return;
        }

        setMemberSaving(true);
        resetMessages();

        try {
            await setCompanyMonitorStatus(
                companyId,
                monitor.userId,
                nextStatus
            );

            await Promise.all([
                loadMembers(),
                refreshCompanies(companyId),
            ]);

            if (
                editingMonitorId ===
                    monitor.userId &&
                !nextStatus
            ) {
                cancelEditingMonitor();
            }

            setSuccess(
                `Monitoring account was ${
                    nextStatus
                        ? "enabled"
                        : "disabled"
                }.`
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setMemberSaving(false);
        }
    }

    return (
        <div className="space-y-6">
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

            <CompanyForm
                company={company}
                form={form}
                isOwner={isOwner}
                loading={contextLoading}
                saving={saving}
                onFormChange={setForm}
                onSubmit={saveCompany}
            />

            {company && isOwner && (
                <MonitorSection
                    monitors={monitors}
                    monitorEmail={monitorEmail}
                    editingMonitorId={
                        editingMonitorId
                    }
                    editingMonitorEmail={
                        editingMonitorEmail
                    }
                    loading={loadingMembers}
                    saving={memberSaving}
                    onMonitorEmailChange={
                        setMonitorEmail
                    }
                    onEditingEmailChange={
                        setEditingMonitorEmail
                    }
                    onAdd={addMonitor}
                    onEdit={startEditingMonitor}
                    onCancelEdit={
                        cancelEditingMonitor
                    }
                    onReplace={replaceMonitor}
                    onToggleStatus={
                        toggleMonitorStatus
                    }
                />
            )}
        </div>
    );
}

function PageHeading({
    onCreate,
}: {
    onCreate: () => void;
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0F172A]">
                    <Building2 className="h-6 w-6 text-[#FD3E06]" />
                    Company workspace
                </h1>
                <p className="mt-1 text-sm text-[#64748B]">
                    Owners manage company information and
                    monitoring access.
                </p>
            </div>

            <button
                type="button"
                onClick={onCreate}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FD3E06] px-4 text-sm font-semibold text-white hover:bg-[#E63600]"
            >
                <Plus className="h-4 w-4" />
                New company
            </button>
        </div>
    );
}

function CompanyList({
    companies,
    selectedCompanyId,
    loading,
    onSelect,
}: {
    companies: Company[];
    selectedCompanyId: string | null;
    loading: boolean;
    onSelect: (companyId: string) => void;
}) {
    return (
        <aside className="h-fit rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Your companies
                </span>

                {loading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FD3E06]" />
                )}
            </div>

            <div className="space-y-1">
                {companies.map((company) => {
                    const selected =
                        company.id ===
                        selectedCompanyId;

                    return (
                        <button
                            key={company.id}
                            type="button"
                            onClick={() =>
                                onSelect(company.id)
                            }
                            className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                                selected
                                    ? "bg-[#FD3E06]/10"
                                    : "hover:bg-[#F8FAFC]"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-semibold text-[#0F172A]">
                                    {company.name}
                                </span>

                                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] text-[#64748B]">
                                    {
                                        company.currentUserRole
                                    }
                                </span>
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
                                {company.currentUserRole ===
                                "Owner" ? (
                                    <ShieldCheck className="h-3 w-3" />
                                ) : (
                                    <Eye className="h-3 w-3" />
                                )}

                                {company.currentUserRole ===
                                "Owner"
                                    ? "Owner access"
                                    : "Monitoring access"}
                            </div>
                        </button>
                    );
                })}

                {!loading &&
                    companies.length === 0 && (
                        <div className="px-3 py-8 text-center text-sm text-[#94A3B8]">
                            No company workspace yet.
                        </div>
                    )}
            </div>
        </aside>
    );
}

function CompanyForm({
    company,
    form,
    isOwner,
    loading,
    saving,
    onFormChange,
    onSubmit,
}: {
    company: Company | null;
    form: CompanyInput;
    isOwner: boolean;
    loading: boolean;
    saving: boolean;
    onFormChange: React.Dispatch<
        React.SetStateAction<CompanyInput>
    >;
    onSubmit: (
        event: React.FormEvent<HTMLFormElement>
    ) => Promise<void>;
}) {
    const readOnly = Boolean(company) && !isOwner;

    return (
        <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-[#0F172A]">
                        {company
                            ? "Company information"
                            : "Create company"}
                    </h2>

                    {company && (
                        <p className="mt-1 text-xs text-[#64748B]">
                            Access:{" "}
                            <strong>
                                {
                                    company.currentUserRole
                                }
                            </strong>
                        </p>
                    )}
                </div>

                {loading && (
                    <Loader2 className="h-5 w-5 animate-spin text-[#FD3E06]" />
                )}
            </div>

            <form
                onSubmit={(event) =>
                    void onSubmit(event)
                }
                className="grid gap-4 sm:grid-cols-2"
            >
                <Field
                    label="Company name"
                    value={form.name}
                    required
                    disabled={readOnly}
                    onChange={(value) =>
                        onFormChange((current) => ({
                            ...current,
                            name: value,
                        }))
                    }
                />

                <Field
                    label="Industry"
                    value={form.industry ?? ""}
                    disabled={readOnly}
                    onChange={(value) =>
                        onFormChange((current) => ({
                            ...current,
                            industry: value,
                        }))
                    }
                />

                <Field
                    label="Timezone"
                    value={form.timezone}
                    disabled={readOnly}
                    onChange={(value) =>
                        onFormChange((current) => ({
                            ...current,
                            timezone: value,
                        }))
                    }
                />

                <Field
                    label="Logo URL"
                    value={form.logoUrl ?? ""}
                    type="url"
                    placeholder="https://company.com/logo.png"
                    hint="Optional. Use a complete http:// or https:// URL."
                    disabled={readOnly}
                    onChange={(value) =>
                        onFormChange((current) => ({
                            ...current,
                            logoUrl: value,
                        }))
                    }
                />

                <div className="sm:col-span-2">
                    <Field
                        label="Address"
                        value={form.address ?? ""}
                        icon={MapPin}
                        disabled={readOnly}
                        onChange={(value) =>
                            onFormChange(
                                (current) => ({
                                    ...current,
                                    address: value,
                                })
                            )
                        }
                    />
                </div>

                {(!company || isOwner) && (
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0F172A] px-4 text-sm font-semibold text-white hover:bg-[#1E293B] disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}

                            {company
                                ? "Save changes"
                                : "Create workspace"}
                        </button>
                    </div>
                )}
            </form>
        </section>
    );
}

function MonitorSection({
    monitors,
    monitorEmail,
    editingMonitorId,
    editingMonitorEmail,
    loading,
    saving,
    onMonitorEmailChange,
    onEditingEmailChange,
    onAdd,
    onEdit,
    onCancelEdit,
    onReplace,
    onToggleStatus,
}: {
    monitors: CompanyMember[];
    monitorEmail: string;
    editingMonitorId: string;
    editingMonitorEmail: string;
    loading: boolean;
    saving: boolean;
    onMonitorEmailChange: (value: string) => void;
    onEditingEmailChange: (value: string) => void;
    onAdd: (
        event: React.FormEvent<HTMLFormElement>
    ) => Promise<void>;
    onEdit: (monitor: CompanyMember) => void;
    onCancelEdit: () => void;
    onReplace: (
        event: React.FormEvent<HTMLFormElement>
    ) => Promise<void>;
    onToggleStatus: (
        monitor: CompanyMember
    ) => Promise<void>;
}) {
    return (
        <section className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                            <Users className="h-5 w-5 text-[#FD3E06]" />
                            Linked monitoring accounts
                        </h2>

                        <p className="mt-1 text-xs text-[#64748B]">
                            Disabled accounts remain
                            visible but lose Company and
                            Robot access.
                        </p>
                    </div>

                    {loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-[#FD3E06]" />
                    )}
                </div>

                <form
                    onSubmit={(event) =>
                        void onAdd(event)
                    }
                    className="mt-4 flex flex-col gap-2 sm:flex-row"
                >
                    <input
                        type="email"
                        required
                        value={monitorEmail}
                        onChange={(event) =>
                            onMonitorEmailChange(
                                event.target.value
                            )
                        }
                        placeholder="monitor@company.com"
                        disabled={saving}
                        className="h-10 flex-1 rounded-lg border border-[#CBD5E1] px-3 text-sm outline-none focus:border-[#FD3E06] disabled:bg-[#F8FAFC]"
                    />

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            !monitorEmail.trim()
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FD3E06] px-4 text-sm font-semibold text-white hover:bg-[#E63705] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}

                        Link monitor
                    </button>
                </form>
            </div>

            <div className="divide-y divide-[#E2E8F0]">
                {monitors.map((monitor) => (
                    <div
                        key={monitor.userId}
                        className={`px-5 py-4 ${
                            monitor.isActive
                                ? "bg-white"
                                : "bg-[#F8FAFC]"
                        }`}
                    >
                        {editingMonitorId ===
                        monitor.userId ? (
                            <form
                                onSubmit={(event) =>
                                    void onReplace(
                                        event
                                    )
                                }
                                className="flex flex-col gap-2 sm:flex-row"
                            >
                                <input
                                    type="email"
                                    required
                                    autoFocus
                                    value={
                                        editingMonitorEmail
                                    }
                                    onChange={(event) =>
                                        onEditingEmailChange(
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                    className="h-10 flex-1 rounded-lg border border-[#CBD5E1] px-3 text-sm outline-none focus:border-[#FD3E06] disabled:bg-[#F8FAFC]"
                                />

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !editingMonitorEmail.trim()
                                    }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-4 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save
                                </button>

                                <button
                                    type="button"
                                    title="Cancel"
                                    disabled={saving}
                                    onClick={
                                        onCancelEdit
                                    }
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#CBD5E1] px-3 text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-60"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-[#0F172A]">
                                        {monitor.fullName ??
                                            monitor.email}
                                    </div>
                                    <div className="truncate text-xs text-[#64748B]">
                                        {monitor.email}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        Monitor
                                    </span>

                                    <MonitorStatusBadge
                                        isActive={
                                            monitor.isActive
                                        }
                                    />

                                    <button
                                        type="button"
                                        title={
                                            monitor.isActive
                                                ? "Replace monitor"
                                                : "Enable before replacing"
                                        }
                                        disabled={
                                            saving ||
                                            !monitor.isActive
                                        }
                                        onClick={() =>
                                            onEdit(monitor)
                                        }
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        disabled={saving}
                                        onClick={() =>
                                            void onToggleStatus(
                                                monitor
                                            )
                                        }
                                        className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold disabled:cursor-wait disabled:opacity-50 ${
                                            monitor.isActive
                                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                        }`}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Power className="h-3.5 w-3.5" />
                                        )}

                                        {monitor.isActive
                                            ? "Disable"
                                            : "Enable"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {!loading &&
                    monitors.length === 0 && (
                        <div className="px-5 py-8 text-center text-sm text-[#94A3B8]">
                            No monitoring account is
                            linked.
                        </div>
                    )}
            </div>
        </section>
    );
}

function MonitorStatusBadge({
    isActive,
}: {
    isActive: boolean;
}) {
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-200 text-slate-600"
            }`}
        >
            {isActive ? "Active" : "Disabled"}
        </span>
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

function Field({
    label,
    value,
    type = "text",
    placeholder,
    hint,
    required,
    disabled,
    icon: Icon,
    onChange,
}: {
    label: string;
    value: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#334155]">
                {label}
            </span>

            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                )}

                <input
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`h-10 w-full rounded-lg border border-[#DCE3EC] bg-white px-3 text-sm text-[#0F172A] outline-none focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10 disabled:bg-[#F8FAFC] disabled:text-[#64748B] ${
                        Icon ? "pl-9" : ""
                    }`}
                />
            </div>

            {hint && (
                <span className="mt-1 block text-[11px] text-[#94A3B8]">
                    {hint}
                </span>
            )}
        </label>
    );
}

function toForm(company: Company): CompanyInput {
    return {
        name: company.name,
        industry: company.industry ?? "",
        address: company.address ?? "",
        timezone: company.timezone,
        logoUrl: company.logoUrl ?? "",
    };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "An unexpected company request error occurred.";
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