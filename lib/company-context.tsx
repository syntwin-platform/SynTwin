"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useSession } from "@/hooks/useSession";
import {
    listCompanies,
    type Company,
} from "@/lib/companies";

const STORAGE_KEY_PREFIX =
    "syntwin.selectedCompanyId";

export const COMPANY_SELECTION_CHANGED_EVENT =
    "syntwin-company-selection-changed";

export type CompanySelectionChangeReason =
    | "initial"
    | "user"
    | "refresh"
    | "access-revoked"
    | "session-changed"
    | "logout";

export interface CompanySelectionChangedDetail {
    previousCompanyId: string | null;
    companyId: string | null;
    reason: CompanySelectionChangeReason;
}

interface CompanyContextValue {
    companies: Company[];
    selectedCompany: Company | null;
    selectedCompanyId: string | null;
    isLoadingCompanies: boolean;
    companyError: string;
    selectCompany: (companyId: string) => boolean;
    refreshCompanies: (
        preferredCompanyId?: string
    ) => Promise<void>;
    clearCompanyError: () => void;
}

const CompanyContext =
    createContext<CompanyContextValue | null>(null);

export function CompanyProvider({
    children,
}: {
    children: ReactNode;
}) {
    const session = useSession();
    const userId = session?.userId ?? null;

    const [companies, setCompanies] = useState<
        Company[]
    >([]);
    const [
        selectedCompanyId,
        setSelectedCompanyId,
    ] = useState<string | null>(null);
    const [
        isLoadingCompanies,
        setIsLoadingCompanies,
    ] = useState(true);
    const [companyError, setCompanyError] =
        useState("");

    const selectedCompanyIdRef =
        useRef<string | null>(null);
    const loadedUserIdRef =
        useRef<string | null>(null);
    const refreshRequestRef = useRef(0);

    const selectedCompany = useMemo(
        () =>
            companies.find(
                (company) =>
                    company.id === selectedCompanyId
            ) ?? null,
        [companies, selectedCompanyId]
    );

    const changeSelection = useCallback(
        (
            nextCompanyId: string | null,
            reason: CompanySelectionChangeReason,
            currentUserId: string | null,
            persist: boolean
        ): void => {
            const previousCompanyId =
                selectedCompanyIdRef.current;

            selectedCompanyIdRef.current =
                nextCompanyId;
            setSelectedCompanyId(nextCompanyId);

            if (
                persist &&
                currentUserId &&
                typeof window !== "undefined"
            ) {
                const storageKey =
                    getCompanyStorageKey(
                        currentUserId
                    );

                if (nextCompanyId) {
                    window.localStorage.setItem(
                        storageKey,
                        nextCompanyId
                    );
                } else {
                    window.localStorage.removeItem(
                        storageKey
                    );
                }
            }

            if (
                previousCompanyId !== nextCompanyId &&
                typeof window !== "undefined"
            ) {
                const detail: CompanySelectionChangedDetail =
                    {
                        previousCompanyId,
                        companyId: nextCompanyId,
                        reason,
                    };

                window.dispatchEvent(
                    new CustomEvent<CompanySelectionChangedDetail>(
                        COMPANY_SELECTION_CHANGED_EVENT,
                        { detail }
                    )
                );
            }
        },
        []
    );

    const refreshCompanies = useCallback(
        async (
            preferredCompanyId?: string
        ): Promise<void> => {
            const requestId =
                refreshRequestRef.current + 1;

            refreshRequestRef.current = requestId;
            setIsLoadingCompanies(true);
            setCompanyError("");

            if (!userId) {
                setCompanies([]);
                loadedUserIdRef.current = null;

                changeSelection(
                    null,
                    "logout",
                    null,
                    false
                );

                setIsLoadingCompanies(false);
                return;
            }

            const previousUserId =
                loadedUserIdRef.current;

            if (
                previousUserId &&
                previousUserId !== userId
            ) {
                setCompanies([]);

                changeSelection(
                    null,
                    "session-changed",
                    userId,
                    false
                );
            }

            try {
                const response =
                    await listCompanies();

                if (
                    requestId !==
                    refreshRequestRef.current
                ) {
                    return;
                }

                const currentCompanyId =
                    selectedCompanyIdRef.current;
                const persistedCompanyId =
                    readPersistedCompanyId(userId);

                const candidateCompanyId =
                    preferredCompanyId ??
                    (previousUserId === userId
                        ? currentCompanyId ??
                          persistedCompanyId
                        : persistedCompanyId);

                const candidateCompany =
                    response.find(
                        (company) =>
                            company.id ===
                            candidateCompanyId
                    ) ?? null;

                const nextCompany =
                    candidateCompany ??
                    response[0] ??
                    null;

                const lostPreviousAccess =
                    Boolean(candidateCompanyId) &&
                    !candidateCompany;

                let reason: CompanySelectionChangeReason;

                if (
                    previousUserId &&
                    previousUserId !== userId
                ) {
                    reason = "session-changed";
                } else if (lostPreviousAccess) {
                    reason = "access-revoked";
                } else if (preferredCompanyId) {
                    reason = "user";
                } else if (!previousUserId) {
                    reason = "initial";
                } else {
                    reason = "refresh";
                }

                setCompanies(response);
                loadedUserIdRef.current = userId;

                changeSelection(
                    nextCompany?.id ?? null,
                    reason,
                    userId,
                    true
                );
            } catch (requestError) {
                if (
                    requestId !==
                    refreshRequestRef.current
                ) {
                    return;
                }

                setCompanyError(
                    getErrorMessage(requestError)
                );
            } finally {
                if (
                    requestId ===
                    refreshRequestRef.current
                ) {
                    setIsLoadingCompanies(false);
                }
            }
        },
        [changeSelection, userId]
    );

    const selectCompany = useCallback(
        (companyId: string): boolean => {
            const companyExists = companies.some(
                (company) =>
                    company.id === companyId
            );

            if (!companyExists || !userId) {
                setCompanyError(
                    "This company is no longer available."
                );
                return false;
            }

            setCompanyError("");

            changeSelection(
                companyId,
                "user",
                userId,
                true
            );

            return true;
        },
        [
            changeSelection,
            companies,
            userId,
        ]
    );

    const clearCompanyError =
        useCallback((): void => {
            setCompanyError("");
        }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void refreshCompanies();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
            refreshRequestRef.current += 1;
        };
    }, [refreshCompanies]);

    useEffect(() => {
        if (!userId) return;

        const storageKey =
            getCompanyStorageKey(userId);

        function handleStorage(
            event: StorageEvent
        ): void {
            if (event.key !== storageKey) return;

            const nextCompanyId =
                event.newValue;

            if (!nextCompanyId) {
                void refreshCompanies();
                return;
            }

            const companyExists = companies.some(
                (company) =>
                    company.id === nextCompanyId
            );

            if (!companyExists) {
                void refreshCompanies(
                    nextCompanyId
                );
                return;
            }

            changeSelection(
                nextCompanyId,
                "user",
                userId,
                false
            );
        }

        window.addEventListener(
            "storage",
            handleStorage
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorage
            );
        };
    }, [
        changeSelection,
        companies,
        refreshCompanies,
        userId,
    ]);

    const value = useMemo<CompanyContextValue>(
        () => ({
            companies,
            selectedCompany,
            selectedCompanyId,
            isLoadingCompanies,
            companyError,
            selectCompany,
            refreshCompanies,
            clearCompanyError,
        }),
        [
            clearCompanyError,
            companies,
            companyError,
            isLoadingCompanies,
            refreshCompanies,
            selectCompany,
            selectedCompany,
            selectedCompanyId,
        ]
    );

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany(): CompanyContextValue {
    const context = useContext(CompanyContext);

    if (!context) {
        throw new Error(
            "useCompany must be used inside CompanyProvider."
        );
    }

    return context;
}

function getCompanyStorageKey(
    userId: string
): string {
    return `${STORAGE_KEY_PREFIX}.${userId}`;
}

function readPersistedCompanyId(
    userId: string
): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.localStorage.getItem(
        getCompanyStorageKey(userId)
    );
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "Unable to load your company workspaces.";
}