"use client";

import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "@/lib/auth";
import type { RobotLatestState } from "@/lib/api/robots";

export interface RobotStatusChangedEvent {
    robotId: string;
    status: string;
    previousStatus: string;
    timestamp: string;
}

export interface CommandCompletedEvent {
    robotId: string;
    commandId: string;
    commandType: string;
    status: string;
    completedAt: string;
    failureReason?: string | null;
}

export interface ProgramUpdatedEvent {
    robotId: string;
    programId: string;
    name: string;
    updatedAt: string;
}

type TelemetryUpdatedHandler = (state: RobotLatestState) => void;
type RobotStatusChangedHandler = (event: RobotStatusChangedEvent) => void;
type CommandCompletedHandler = (event: CommandCompletedEvent) => void;

class SignalRTelemetryClient {
    private connection: signalR.HubConnection | null = null;
    private telemetryHandlers: Set<TelemetryUpdatedHandler> = new Set();
    private statusHandlers: Set<RobotStatusChangedHandler> = new Set();
    private commandHandlers: Set<CommandCompletedHandler> = new Set();
    private activeRobotGroups: Set<string> = new Set();
    private isConnecting = false;

    private get baseUrl(): string {
        return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
    }

    public async connect(): Promise<signalR.HubConnection | null> {
        if (typeof window === "undefined") return null;
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return this.connection;
        }
        if (this.isConnecting) return null;

        const token = getAccessToken();
        if (!token) return null;

        this.isConnecting = true;
        try {
            if (!this.connection) {
                this.connection = new signalR.HubConnectionBuilder()
                    .withUrl(`${this.baseUrl}/hubs/telemetry`, {
                        accessTokenFactory: () => getAccessToken() || "",
                        skipNegotiation: false,
                        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                    })
                    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
                    .configureLogging(signalR.LogLevel.None)
                    .build();

                this.registerServerEvents(this.connection);
            }

            if (this.connection.state === signalR.HubConnectionState.Disconnected) {
                try {
                    await this.connection.start();
                    // Re-join active robot groups after connect / reconnect
                    for (const robotId of this.activeRobotGroups) {
                        await this.connection.invoke("JoinRobotGroup", robotId).catch(() => {});
                    }
                } catch {
                    // Suppress connection failure and allow HTTP polling fallback
                    this.connection = null;
                    return null;
                }
            }

            return this.connection;
        } catch {
            this.connection = null;
            return null;
        } finally {
            this.isConnecting = false;
        }
    }

    public async joinRobotGroup(robotId: string): Promise<void> {
        this.activeRobotGroups.add(robotId);
        const conn = await this.connect();
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            await conn.invoke("JoinRobotGroup", robotId).catch(() => {});
        }
    }

    public async leaveRobotGroup(robotId: string): Promise<void> {
        this.activeRobotGroups.delete(robotId);
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            await this.connection.invoke("LeaveRobotGroup", robotId).catch(() => {});
        }
    }

    public onTelemetryUpdated(handler: TelemetryUpdatedHandler): () => void {
        this.telemetryHandlers.add(handler);
        return () => {
            this.telemetryHandlers.delete(handler);
        };
    }

    public onRobotStatusChanged(handler: RobotStatusChangedHandler): () => void {
        this.statusHandlers.add(handler);
        return () => {
            this.statusHandlers.delete(handler);
        };
    }

    public onCommandCompleted(handler: CommandCompletedHandler): () => void {
        this.commandHandlers.add(handler);
        return () => {
            this.commandHandlers.delete(handler);
        };
    }

    public async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
            } catch {
                // Ignore stop error on teardown
            }
            this.connection = null;
        }
        this.activeRobotGroups.clear();
    }

    private registerServerEvents(connection: signalR.HubConnection): void {
        connection.on("TelemetryUpdated", (state: RobotLatestState) => {
            this.telemetryHandlers.forEach((handler) => handler(state));
        });

        connection.on("RobotStatusChanged", (event: RobotStatusChangedEvent) => {
            this.statusHandlers.forEach((handler) => handler(event));
        });

        connection.on("CommandCompleted", (event: CommandCompletedEvent) => {
            this.commandHandlers.forEach((handler) => handler(event));
        });
    }
}

export const signalRTelemetryClient = new SignalRTelemetryClient();
