"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRobotLatestState, listRobots } from "@/lib/api/robots";
import {
    mergeFleetState,
    type FleetRobotSnapshot,
} from "@/lib/operations/fleet-selectors";
import { signalRTelemetryClient } from "@/lib/realtime/signalr-client";

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
        const isInitialFetch =
            stateRef.current.companyId !== companyId ||
            stateRef.current.items.length === 0;

        if (isInitialFetch) {
            setLoading(true);
        }

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
        const interval = window.setInterval(() => void refresh(), 4000);
        return () => {
            window.clearTimeout(timer);
            window.clearInterval(interval);
            requestRef.current += 1;
        };
    }, [refresh]);

    // SignalR Real-Time Telemetry Subscription
    useEffect(() => {
        if (!companyId || state.items.length === 0) return;

        const robotIds = state.items.map((item) => item.robot.id);
        robotIds.forEach((id) => {
            void signalRTelemetryClient.joinRobotGroup(id);
        });

        const unsubscribeTelemetry = signalRTelemetryClient.onTelemetryUpdated((newState) => {
            if (!newState || !newState.robotId) return;
            const current = stateRef.current;
            if (current.companyId !== companyId) return;

            const hasRobot = current.items.some((item) => item.robot.id === newState.robotId);
            if (!hasRobot) return;

            const observedAt = new Date().toISOString();
            const updatedItems = current.items.map((item) =>
                item.robot.id === newState.robotId
                    ? {
                          ...item,
                          state: newState,
                          freshness: "current" as const,
                          observedAt,
                      }
                    : item
            );

            commit({
                ...current,
                items: updatedItems,
                updatedAt: observedAt,
            });
        });

        return () => {
            unsubscribeTelemetry();
            robotIds.forEach((id) => {
                void signalRTelemetryClient.leaveRobotGroup(id);
            });
        };
    }, [companyId, commit, state.items.length]);

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
