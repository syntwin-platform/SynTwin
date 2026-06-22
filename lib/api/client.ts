import {
    clearSession,
    getAccessToken,
    getSession,
    storeAuthResponse,
    type BackendAuthResponse,
} from "@/lib/auth";
import {
    ApiRequestError,
    type ApiErrorResponse,
} from "@/lib/api/types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface ApiRequestOptions extends RequestInit {
    authenticated?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

export function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    return executeRequest<T>(path, options, false);
}

async function executeRequest<T>(
    path: string,
    options: ApiRequestOptions,
    hasRetried: boolean
): Promise<T> {
    const {
        authenticated = true,
        headers: initialHeaders,
        ...requestInit
    } = options;

    const headers = createHeaders(
        initialHeaders,
        requestInit.body,
        authenticated
    );

    const response = await sendRequest(path, requestInit, headers);

    if (
        response.status === 401 &&
        authenticated &&
        !hasRetried
    ) {
        const refreshed = await refreshSession();

        if (refreshed) {
            return executeRequest<T>(path, options, true);
        }

        throw new ApiRequestError(
            401,
            "Your session has expired. Please sign in again."
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const body = await parseResponseBody(response);

    if (!response.ok) {
        const errorBody = toApiErrorResponse(body);

        throw new ApiRequestError(
            response.status,
            getErrorMessage(errorBody, response.status),
            errorBody?.errors
        );
    }

    return body as T;
}

function createHeaders(
    initialHeaders: HeadersInit | undefined,
    body: BodyInit | null | undefined,
    authenticated: boolean
): Headers {
    const headers = new Headers(initialHeaders);

    if (
        body !== undefined &&
        body !== null &&
        !headers.has("Content-Type") &&
        !isFormData(body)
    ) {
        headers.set("Content-Type", "application/json");
    }

    if (authenticated) {
        const accessToken = getAccessToken();

        if (!accessToken) {
            handleExpiredSession();

            throw new ApiRequestError(
                401,
                "Your login session is missing. Please sign in again."
            );
        }

        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
}

async function sendRequest(
    path: string,
    requestInit: RequestInit,
    headers: Headers
): Promise<Response> {
    try {
        return await fetch(`${API_BASE_URL}${path}`, {
            ...requestInit,
            headers,
        });
    } catch (error) {
        throw new ApiRequestError(
            0,
            error instanceof Error
                ? `Cannot connect to SynTwin Backend: ${error.message}`
                : "Cannot connect to SynTwin Backend."
        );
    }
}

function refreshSession(): Promise<boolean> {
    if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

async function performRefresh(): Promise<boolean> {
    const refreshToken = getSession()?.refreshToken;

    if (!refreshToken) {
        handleExpiredSession();
        return false;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/auth/refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            }
        );

        if (!response.ok) {
            handleExpiredSession();
            return false;
        }

        const body = await parseResponseBody(response);
        const session = storeAuthResponse(
            body as BackendAuthResponse
        );

        if (!session) {
            handleExpiredSession();
            return false;
        }

        return true;
    } catch {
        handleExpiredSession();
        return false;
    }
}

function handleExpiredSession(): void {
    clearSession();

    if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
    ) {
        window.location.replace("/login");
    }
}

async function parseResponseBody(
    response: Response
): Promise<unknown> {
    const text = await response.text();

    if (!text) {
        return undefined;
    }

    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

function toApiErrorResponse(
    body: unknown
): ApiErrorResponse | null {
    if (!body || typeof body !== "object") {
        return null;
    }

    return body as ApiErrorResponse;
}

function getErrorMessage(
    body: ApiErrorResponse | null,
    status: number
): string {
    const validationMessages = body?.errors
        ? Object.entries(body.errors).flatMap(
            ([field, messages]) =>
                messages.map(
                    (message) => `${field}: ${message}`
                )
        )
        : [];

    if (validationMessages.length > 0) {
        return validationMessages.join(" ");
    }

    return body?.message ??
        `API request failed with HTTP ${status}.`;
}

function isFormData(body: BodyInit): boolean {
    return (
        typeof FormData !== "undefined" &&
        body instanceof FormData
    );
}
