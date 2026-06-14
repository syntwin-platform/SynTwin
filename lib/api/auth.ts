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
    try {
        await getCurrentUser();

        const refreshToken = getSession()?.refreshToken;

        if (!refreshToken) {
            return;
        }

        await apiRequest<void>("/api/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
        });
    } catch {
        // Local logout must still finish if the Backend is unavailable.
    } finally {
        clearSession();
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
