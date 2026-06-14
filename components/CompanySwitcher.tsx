"use client";

import Link from "next/link";
import {
    Building2,
    ChevronDown,
    Loader2,
    RefreshCw,
    ShieldCheck,
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

    function handleSelection(
        event: React.ChangeEvent<HTMLSelectElement>
    ): void {
        clearCompanyError();
        selectCompany(event.target.value);
    }

    if (isLoadingCompanies) {
        return (
            <div className="flex h-9 min-w-40 items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs text-[#64748B]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FD3E06]" />
                Loading companies...
            </div>
        );
    }

    if (companyError) {
        return (
            <div className="flex items-center gap-2">
                <div
                    className="hidden max-w-52 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 lg:flex"
                    title={companyError}
                >
                    <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                        Company unavailable
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        void refreshCompanies()
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#FD3E06]"
                    title="Retry loading companies"
                    aria-label="Retry loading companies"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (!selectedCompany || companies.length === 0) {
        return (
            <Link
                href="/dashboard/company"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] px-3 text-xs font-medium text-[#64748B] transition-colors hover:border-[#FD3E06] hover:text-[#FD3E06]"
            >
                <Building2 className="h-4 w-4" />
                Create company
            </Link>
        );
    }

    return (
        <div className="flex min-w-0 items-center gap-2">
            <div className="hidden min-w-0 items-center gap-2 xl:flex">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FD3E06]/10 text-[#FD3E06]">
                    <Building2 className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                    <div className="max-w-36 truncate text-xs font-semibold text-[#0F172A]">
                        {selectedCompany.name}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        {selectedCompany.currentUserRole}
                    </div>
                </div>
            </div>

            <div className="relative">
                <select
                    aria-label="Selected company"
                    value={selectedCompanyId ?? ""}
                    onChange={handleSelection}
                    className="h-9 max-w-44 appearance-none rounded-lg border border-[#DCE3EC] bg-white py-0 pl-3 pr-8 text-xs font-medium text-[#334155] outline-none transition-colors hover:border-[#CBD5E1] focus:border-[#FD3E06] focus:ring-2 focus:ring-[#FD3E06]/10"
                >
                    {companies.map((company) => (
                        <option
                            key={company.id}
                            value={company.id}
                        >
                            {company.name} ·{" "}
                            {company.currentUserRole}
                        </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
            </div>
        </div>
    );
}