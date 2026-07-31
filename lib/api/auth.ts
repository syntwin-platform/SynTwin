import { apiRequest } from "@/lib/api/client";
import {
    clearSession,
    getSession,
    storeAuthResponse,
    updateSessionUser,
    type BackendAuthResponse,
    type BackendUser,
    type Session,
} from "@/lib/auth";

export interface RegisterInput {
    email: string;
    password: string;
    fullName?: string;
    timezone: string;
}

export interface MessageResponse {
    message: string;
}

export function registerUser(
    input: RegisterInput
): Promise<BackendAuthResponse> {
    return apiRequest<BackendAuthResponse>("/api/auth/register", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({
            email: input.email.trim(),
            password: input.password,
            fullName: input.fullName?.trim() || undefined,
            timezone: input.timezone.trim(),
        }),
    });
}

export function loginUser(
    email: string,
    password: string
): Promise<BackendAuthResponse> {
    return apiRequest<BackendAuthResponse>("/api/auth/login", {
        method: "POST",
        authenticated: false,
        body: JSON.stringify({
            email: email.trim(),
            password,
        }),
    });
}

export function requestLoginCode(
    email: string
): Promise<MessageResponse> {
    return apiRequest<MessageResponse>(
        "/api/auth/login-code/request",
        {
            method: "POST",
            authenticated: false,
            body: JSON.stringify({ email: email.trim() }),
        }
    );
}

export function confirmLoginCode(
    email: string,
    code: string
): Promise<BackendAuthResponse> {
    return apiRequest<BackendAuthResponse>(
        "/api/auth/login-code/confirm",
        {
            method: "POST",
            authenticated: false,
            body: JSON.stringify({
                email: email.trim(),
                code: code.trim(),
            }),
        }
    );
}

export function getCurrentUser(): Promise<BackendUser> {
    return apiRequest<BackendUser>("/api/auth/me");
}

export async function restoreSession(): Promise<Session> {
    const user = await getCurrentUser();

    if (user.status !== "Active") {
        clearSession();
        throw new Error("Your account is not active.");
    }

    const session = updateSessionUser(user);

    if (!session) {
        clearSession();
        throw new Error("Your login session is invalid.");
    }

    return session;
}

export async function logoutUser(): Promise<void> {
    const refreshToken = getSession()?.refreshToken;

    // 1. Clear session immediately to guarantee UI never freezes or hangs
    clearSession();

    // 2. Notify backend in background if token exists
    if (refreshToken) {
        void apiRequest<void>("/api/auth/logout", {
            method: "POST",
            authenticated: false,
            body: JSON.stringify({ refreshToken }),
        }).catch(() => {
            // Ignore backend errors during logout
        });
    }

    // 3. Force clean browser redirect to login
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
}

export function storeAuthenticatedSession(
    auth: BackendAuthResponse
): Session {
    const session = storeAuthResponse(auth);

    if (!session) {
        throw new Error("Backend returned an invalid authentication response.");
    }

    return session;
}
