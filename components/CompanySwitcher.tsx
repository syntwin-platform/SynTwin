"use client";

import Link from "next/link";
import {
    Building2,
    ChevronDown,
    Loader2,
    RefreshCw,
    TriangleAlert,
} from "lucide-react";
import { useCompany } from "@/lib/company-context";

export function CompanySwitcher() {
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

    if (isLoadingCompanies) {
        return (
            <div className="flex min-h-10 max-w-52 items-center gap-2 border border-line bg-canvas px-3 text-xs text-subtle">
                <Loader2 className="size-3.5 animate-spin text-brand" />
                Đang tải công ty…
            </div>
        );
    }

    if (companyError) {
        return (
            <div className="flex items-center gap-2">
                <div className="hidden max-w-52 items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 lg:flex" title={companyError}>
                    <TriangleAlert className="size-3.5 shrink-0" />
                    <span className="truncate">Không thể tải công ty</span>
                </div>
                <button
                    type="button"
                    onClick={() => void refreshCompanies()}
                    className="inline-flex size-10 items-center justify-center rounded-md border border-line text-steel hover:border-brand/40 hover:text-brand"
                    title="Tải lại danh sách công ty"
                    aria-label="Tải lại danh sách công ty"
                >
                    <RefreshCw className="size-4" />
                </button>
            </div>
        );
    }

    if (!selectedCompany || companies.length === 0) {
        return (
            <Link
                href="/dashboard/company"
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-dashed border-line px-3 text-xs font-medium text-steel hover:border-brand hover:text-brand"
            >
                <Building2 className="size-4" />
                Tạo công ty
            </Link>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="hidden size-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand md:flex">
                <Building2 className="size-4" />
            </div>
            <div className="relative min-w-0">
                <label htmlFor="company-switcher" className="sr-only">
                    Công ty đang chọn
                </label>
                <select
                    id="company-switcher"
                    value={selectedCompanyId ?? ""}
                    onChange={(event) => {
                        clearCompanyError();
                        selectCompany(event.target.value);
                    }}
                    className="h-10 max-w-[58vw] appearance-none rounded-md border border-line bg-surface py-0 pl-3 pr-9 text-xs font-semibold text-ink outline-none hover:border-brand/40 focus:border-brand sm:max-w-64"
                >
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                            {company.name} · {company.currentUserRole === "Owner" ? "Chủ sở hữu" : "Giám sát"}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-subtle" />
            </div>
        </div>
    );
}
