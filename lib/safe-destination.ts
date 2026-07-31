const CUSTOMER_PATHS = new Set([
    "/dashboard",
    "/dashboard/demo",
    "/dashboard/robots",
    "/dashboard/alerts",
    "/dashboard/analytics",
    "/dashboard/company",
    "/dashboard/user",
    "/dashboard/settings",
]);

const ADMIN_PATHS = new Set([
    "/admin/dashboard",
    "/admin/users",
    "/admin/companies",
]);

export function isSafeDestination(
    value: string | null | undefined
): value is string {
    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.includes("\\") ||
        /[\u0000-\u001F\u007F]/.test(value)
    ) {
        return false;
    }

    let parsed: URL;

    try {
        parsed = new URL(value, "https://syntwin.local");
    } catch {
        return false;
    }

    if (
        parsed.origin !== "https://syntwin.local" ||
        parsed.hash ||
        `${parsed.pathname}${parsed.search}` !== value
    ) {
        return false;
    }

    if (CUSTOMER_PATHS.has(parsed.pathname)) {
        return true;
    }

    if (ADMIN_PATHS.has(parsed.pathname)) {
        return true;
    }

    if (parsed.pathname === "/payment/vnpay-return") {
        const entries = [...parsed.searchParams.entries()];
        const hasValidTransactionReference =
            /^[A-Za-z0-9._-]{1,128}$/.test(
                parsed.searchParams.get("txnRef") ?? ""
            );

        if (
            entries.length === 1 &&
            entries[0][0] === "txnRef" &&
            hasValidTransactionReference
        ) {
            return true;
        }

        const expectedParameters = new Set([
            "responseCode",
            "signatureValid",
            "status",
            "transactionStatus",
            "txnRef",
        ]);
        const hasExactBackendParameters =
            entries.length === expectedParameters.size &&
            entries.every(([key]) => expectedParameters.has(key));

        return (
            hasExactBackendParameters &&
            hasValidTransactionReference &&
            /^[A-Za-z0-9_-]{1,16}$/.test(
                parsed.searchParams.get("responseCode") ?? ""
            ) &&
            /^(true|false)$/.test(
                parsed.searchParams.get("signatureValid") ?? ""
            ) &&
            /^(success|failed)$/.test(
                parsed.searchParams.get("status") ?? ""
            ) &&
            /^[A-Za-z0-9_-]{1,16}$/.test(
                parsed.searchParams.get("transactionStatus") ?? ""
            )
        );
    }

    return getEligiblePricingDestination(value) !== null;
}

export function getSafeDestination(
    value: string | null | undefined,
    fallback = "/"
): string {
    return isSafeDestination(value) ? value : fallback;
}

export function getEligiblePricingDestination(
    value: string | null | undefined
): string | null {
    if (!value || value.includes("\\") || !value.startsWith("/")) {
        return null;
    }

    let parsed: URL;

    try {
        parsed = new URL(value, "https://syntwin.local");
    } catch {
        return null;
    }

    if (
        parsed.origin !== "https://syntwin.local" ||
        parsed.pathname !== "/pricing" ||
        parsed.hash
    ) {
        return null;
    }

    if (!parsed.search) {
        return "/pricing";
    }

    const entries = [...parsed.searchParams.entries()];

    if (
        entries.length !== 1 ||
        entries[0][0] !== "plan" ||
        !["Basic", "Premium"].includes(entries[0][1])
    ) {
        return null;
    }

    return `/pricing?plan=${entries[0][1]}`;
}
