"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRobotLatestState, listRobots } from "@/lib/api/robots";
import {
    mergeFleetState,
    type FleetRobotSnapshot,
} from "@/lib/operations/fleet-selectors";

interface FleetState {
    companyId: string | null;
    items: FleetRobotSnapshot[];
    error: string;
    stale: boolean;
    updatedAt: string | null;
}

const emptyState: FleetState = {
    companyId: null,
    items: [],
    error: "",
    stale: false,
    updatedAt: null,
};

export function useFleetSnapshot(companyId: string | null) {
    const [state, setState] = useState<FleetState>(emptyState);
    const [loading, setLoading] = useState(true);
    const stateRef = useRef<FleetState>(emptyState);
    const requestRef = useRef(0);

    const commit = useCallback((next: FleetState) => {
        stateRef.current = next;
        setState(next);
    }, []);

    const refresh = useCallback(async () => {
        const requestId = ++requestRef.current;
        setLoading(true);

        if (!companyId) {
            commit(emptyState);
            setLoading(false);
            return;
        }

        try {
            const robots = await listRobots(companyId);
            const settledStates = await Promise.allSettled(
                robots.map((robot) => getRobotLatestState(robot.id))
            );
            if (requestId !== requestRef.current) return;

            const previous =
                stateRef.current.companyId === companyId
                    ? stateRef.current.items
                    : [];
            const observedAt = new Date().toISOString();
            const merged = mergeFleetState({
                robots,
                settledStates,
                previousByRobotId: new Map(
                    previous.map((item) => [item.robot.id, item])
                ),
                observedAt,
            });
            commit({
                companyId,
                items: merged.snapshots,
                error:
                    merged.failureCount === 0
                        ? ""
                        : merged.allFailed
                          ? "Không thể đọc trạng thái của đội robot."
                          : `Không thể đọc trạng thái của ${merged.failureCount} robot.`,
                stale: merged.failureCount > 0,
                updatedAt: observedAt,
            });
        } catch (error) {
            if (requestId !== requestRef.current) return;
            const sameCompany = stateRef.current.companyId === companyId;
            commit({
                companyId,
                items: sameCompany ? stateRef.current.items : [],
                error:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải đội robot.",
                stale: sameCompany && stateRef.current.items.length > 0,
                updatedAt: sameCompany
                    ? stateRef.current.updatedAt
                    : null,
            });
        } finally {
            if (requestId === requestRef.current) setLoading(false);
        }
    }, [commit, companyId]);

    useEffect(() => {
        const timer = window.setTimeout(() => void refresh(), 0);
        return () => {
            window.clearTimeout(timer);
            requestRef.current += 1;
        };
    }, [refresh]);

    const visible =
        state.companyId === companyId
            ? state
            : { ...emptyState, companyId };

    return {
        items: visible.items,
        loading,
        error: visible.error,
        stale: visible.stale,
        updatedAt: visible.updatedAt,
        refresh,
    };
}
