"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
    getSessionSnapshot,
    subscribeToSession,
    type Session,
} from "@/lib/auth";

export function useSession(): Session | null {
    const snapshot = useSyncExternalStore(
        subscribeToSession,
        getSessionSnapshot,
        () => null
    );

    return useMemo(() => {
        if (!snapshot) return null;

        try {
            return JSON.parse(snapshot) as Session;
        } catch {
            return null;
        }
    }, [snapshot]);
}
