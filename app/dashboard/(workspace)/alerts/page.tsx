"use client";

import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    RefreshCw,
    X,
    XCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { DataState } from "@/components/shared/DataState";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { SourceContext } from "@/components/shared/SourceContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useFleetSnapshot } from "@/hooks/useFleetSnapshot";
import { useSession } from "@/hooks/useSession";
import {
    listRobotCommands,
    type RobotCommand,
} from "@/lib/api/robots";
import {
    COMPANY_SELECTION_CHANGED_EVENT,
    useCompany,
} from "@/lib/company-context";
import {
    formatCommandStatus,
    formatCommandType,
    formatRobotStatus,
} from "@/lib/display-labels";
import {
    getRobotConditionTone,
    type ConditionTone,
} from "@/lib/operations/condition-severity";
import { cn } from "@/lib/utils";

type ConditionFilter = "all" | ConditionTone;

interface CurrentCondition {
    id: string;
    robotName: string;
    tone: ConditionTone;
    title: string;
    detail: string;
    timestamp: string | null;
    source: string;
}

const toneConfig = {
    info: {
        label: "Thông tin",
        icon: Info,
        badge: "neutral" as const,
    },
    warning: {
        label: "Cần chú ý",
        icon: AlertTriangle,
        badge: "warning" as const,
    },
    error: {
        label: "Bất thường",
        icon: XCircle,
        badge: "danger" as const,
    },
};

export default function AlertsPage() {
    const session = useSession();
    const { selectedCompany, companyError } = useCompany();
    const fleet = useFleetSnapshot(selectedCompany?.id ?? null);
    const [filter, setFilter] = useState<ConditionFilter>("all");
    const [selected, setSelected] = useState<CurrentCondition | null>(null);
    const [commandState, setCommandState] = useState<{
        companyId: string;
        commands: Array<{ robotName: string; command: RobotCommand }>;
        error: string;
    }>({ companyId: "", commands: [], error: "" });

    useEffect(() => {
        const resetSelection = (): void => {
            setSelected(null);
        };

        window.addEventListener(
            COMPANY_SELECTION_CHANGED_EVENT,
            resetSelection
        );
        return () => {
            window.removeEventListener(
                COMPANY_SELECTION_CHANGED_EVENT,
                resetSelection
            );
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        if (!selectedCompany || fleet.items.length === 0) return;

        void Promise.allSettled(
            fleet.items.map(async ({ robot }) => ({
                robotName: robot.robotName,
                commands: await listRobotCommands(robot.id),
            }))
        ).then((results) => {
            if (cancelled) return;
            const commands = results.flatMap((result) =>
                result.status === "fulfilled"
                    ? result.value.commands.map((command) => ({
                          robotName: result.value.robotName,
                          command,
                      }))
                    : []
            );
            const failures = results.filter(
                (result) => result.status === "rejected"
            ).length;
            setCommandState({
                companyId: selectedCompany.id,
                commands,
                error:
                    failures > 0
                        ? `Không thể đọc lịch sử lệnh của ${failures} robot.`
                        : "",
            });
        });

        return () => {
            cancelled = true;
        };
    }, [fleet.items, selectedCompany]);

    const conditions = useMemo(() => {
        const current = fleet.items.map(
            ({ robot, state, freshness, observedAt }): CurrentCondition => {
                if (!state) {
                    return {
                        id: `state-${robot.id}`,
                        robotName: robot.robotName,
                        tone: "warning",
                        title: "Chưa xác định trạng thái",
                        detail:
                            "Không thể đọc trạng thái mới nhất của robot tại thời điểm này.",
                        timestamp: observedAt,
                        source: "API trạng thái robot",
                    };
                }
                if (state.collisionWarning) {
                    return {
                        id: `collision-${robot.id}`,
                        robotName: robot.robotName,
                        tone: "error",
                        title: "Có cảnh báo va chạm",
                        detail:
                            "Trạng thái mới nhất từ robot đang bật cờ cảnh báo va chạm.",
                        timestamp: state.timestamp ?? observedAt,
                        source:
                            freshness === "stale"
                                ? "API trạng thái robot · dữ liệu cũ"
                                : "API trạng thái robot",
                    };
                }
                const conditionTone = getRobotConditionTone(state);
                if (conditionTone === "error") {
                    return {
                        id: `status-error-${robot.id}`,
                        robotName: robot.robotName,
                        tone: "error",
                        title: `Robot báo ${formatRobotStatus(state.status)}`,
                        detail:
                            "Trạng thái mới nhất của robot cho biết thiết bị đang gặp lỗi cần kiểm tra.",
                        timestamp: state.timestamp ?? observedAt,
                        source:
                            freshness === "stale"
                                ? "API trạng thái robot · dữ liệu cũ"
                                : "API trạng thái robot",
                    };
                }
                if (conditionTone === "warning" && state.isOnline) {
                    return {
                        id: `status-warning-${robot.id}`,
                        robotName: robot.robotName,
                        tone: "warning",
                        title: `Robot báo ${formatRobotStatus(state.status)}`,
                        detail:
                            "Trạng thái mới nhất của robot đang yêu cầu người vận hành chú ý.",
                        timestamp: state.timestamp ?? observedAt,
                        source:
                            freshness === "stale"
                                ? "API trạng thái robot · dữ liệu cũ"
                                : "API trạng thái robot",
                    };
                }
                if (!state.isOnline) {
                    return {
                        id: `offline-${robot.id}`,
                        robotName: robot.robotName,
                        tone: "warning",
                        title: "Robot ngoại tuyến",
                        detail:
                            "Trạng thái mới nhất cho biết robot không kết nối.",
                        timestamp:
                            state.lastSeenAt ?? state.timestamp ?? observedAt,
                        source: "API trạng thái robot",
                    };
                }
                return {
                    id: `online-${robot.id}`,
                    robotName: robot.robotName,
                    tone: "info",
                    title: "Robot đang trực tuyến",
                    detail: `Trạng thái hiện tại: ${formatRobotStatus(state.status)}.`,
                    timestamp: state.timestamp ?? observedAt,
                    source: "API trạng thái robot",
                };
            }
        );

        const commandConditions =
            commandState.companyId === selectedCompany?.id
                ? commandState.commands.map(
                      ({ robotName, command }): CurrentCondition => {
                          const failed = /fail|error|reject/i.test(
                              command.status
                          );
                          const pending = /pending|queue|process/i.test(
                              command.status
                          );
                          return {
                              id: `command-${command.id}`,
                              robotName,
                              tone: failed
                                  ? "error"
                                  : pending
                                    ? "warning"
                                    : "info",
                              title: `Lệnh ${formatCommandType(command.commandType)}: ${formatCommandStatus(command.status)}`,
                              detail:
                                  command.failureReason ||
                                  "Trạng thái lệnh được trả về từ hệ thống robot.",
                              timestamp: command.completedAt ?? command.createdAt,
                              source: "API lịch sử lệnh robot",
                          };
                      }
                  )
                : [];

        return [...current, ...commandConditions].sort((left, right) =>
            (right.timestamp ?? "").localeCompare(left.timestamp ?? "")
        );
    }, [commandState, fleet.items, selectedCompany?.id]);

    const visibleConditions = conditions.filter(
        (condition) => filter === "all" || condition.tone === filter
    );

    if (!session) return null;

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
            <div className="hidden sm:block">
                <Sidebar />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session} />
                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-20 sm:px-6 sm:pb-6">
                    <div className="mx-auto max-w-[1500px] space-y-5">
                        <header className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">
                                    Điều kiện hiện tại
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                                    Cảnh báo và trạng thái
                                </h1>
                                <p className="mt-1 text-sm text-subtle">
                                    {selectedCompany?.name ??
                                        "Chọn công ty để xem điều kiện robot."}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(["all", "error", "warning", "info"] as const).map(
                                    (value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            aria-pressed={filter === value}
                                            onClick={() => {
                                                setFilter(value);
                                                setSelected(null);
                                            }}
                                            className={cn(
                                                "min-h-10 rounded-md border px-3 text-xs font-semibold",
                                                filter === value
                                                    ? "border-brand bg-brand text-white"
                                                    : "border-line bg-surface text-steel hover:border-brand/40"
                                            )}
                                        >
                                            {value === "all"
                                                ? "Tất cả"
                                                : toneConfig[value].label}
                                        </button>
                                    )
                                )}
                                <button
                                    type="button"
                                    onClick={() => void fleet.refresh()}
                                    disabled={fleet.loading || !selectedCompany}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-surface px-3 text-xs font-semibold text-steel disabled:opacity-50"
                                >
                                    <RefreshCw className={cn("size-4", fleet.loading && "animate-spin")} />
                                    Làm mới
                                </button>
                            </div>
                        </header>

                        <FeedbackBanner tone="warning" title="Phạm vi dữ liệu">
                            Đây là điều kiện hiện tại và hoạt động lệnh, không phải
                            nhật ký cảnh báo lịch sử. Hệ thống máy chủ chưa có API
                            xác nhận hoặc vòng đời cảnh báo.
                        </FeedbackBanner>
                        {companyError && <FeedbackBanner tone="error">{companyError}</FeedbackBanner>}
                        {fleet.error && <FeedbackBanner tone={fleet.stale ? "warning" : "error"}>{fleet.error}</FeedbackBanner>}
                        {commandState.companyId === selectedCompany?.id && commandState.error && (
                            <FeedbackBanner tone="warning">{commandState.error}</FeedbackBanner>
                        )}

                        {fleet.loading ? (
                            <DataState state="loading" title="Đang đọc điều kiện robot" />
                        ) : !selectedCompany ? (
                            <DataState state="empty" title="Chưa có công ty được chọn" description="Chọn công ty ở thanh trên để tiếp tục." />
                        ) : fleet.items.length === 0 ? (
                            <DataState state="empty" title="Chưa có robot" description="Công ty này chưa đăng ký robot nào." />
                        ) : (
                            <div className="grid min-h-[480px] overflow-hidden border border-line bg-surface lg:grid-cols-[minmax(0,1fr)_420px]">
                                <section aria-label="Danh sách điều kiện hiện tại">
                                    <div className="grid grid-cols-3 gap-px border-b border-line bg-line">
                                        <SummaryCell label="Bất thường" value={conditions.filter((item) => item.tone === "error").length} tone="danger" />
                                        <SummaryCell label="Cần chú ý" value={conditions.filter((item) => item.tone === "warning").length} tone="warning" />
                                        <SummaryCell label="Thông tin" value={conditions.filter((item) => item.tone === "info").length} />
                                    </div>
                                    <div className="divide-y divide-line">
                                        {visibleConditions.map((condition) => {
                                            const config = toneConfig[condition.tone];
                                            const Icon = config.icon;
                                            return (
                                                <button
                                                    key={condition.id}
                                                    type="button"
                                                    onClick={() => setSelected(condition)}
                                                    className={cn(
                                                        "grid w-full grid-cols-[32px_1fr_auto] gap-3 px-4 py-4 text-left hover:bg-canvas",
                                                        selected?.id === condition.id && "border-l-2 border-brand bg-brand-soft"
                                                    )}
                                                >
                                                    <Icon className={cn("mt-0.5 size-4", condition.tone === "error" ? "text-danger" : condition.tone === "warning" ? "text-warning" : "text-subtle")} />
                                                    <span>
                                                        <span className="block text-xs font-semibold text-ink">{condition.robotName} · {condition.title}</span>
                                                        <span className="mt-1 block text-xs leading-5 text-subtle">{condition.detail}</span>
                                                    </span>
                                                    <span className="font-telemetry text-[10px] text-subtle">
                                                        {formatTimestamp(condition.timestamp)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {visibleConditions.length === 0 && (
                                            <p className="px-4 py-12 text-center text-sm text-subtle">
                                                Không có điều kiện phù hợp bộ lọc.
                                            </p>
                                        )}
                                    </div>
                                </section>
                                <aside className="border-t border-line bg-canvas p-5 lg:border-l lg:border-t-0">
                                    {selected ? (
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <StatusBadge tone={toneConfig[selected.tone].badge}>
                                                    {toneConfig[selected.tone].label}
                                                </StatusBadge>
                                                <button type="button" onClick={() => setSelected(null)} aria-label="Đóng chi tiết" className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-surface text-subtle">
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                            <h2 className="mt-5 text-lg font-semibold text-ink">{selected.title}</h2>
                                            <p className="mt-1 font-telemetry text-xs text-brand">{selected.robotName}</p>
                                            <p className="mt-5 text-sm leading-6 text-steel">{selected.detail}</p>
                                            <dl className="mt-6 space-y-4 border-t border-line pt-5 text-xs">
                                                <div><dt className="text-subtle">Thời điểm</dt><dd className="mt-1 font-telemetry text-ink">{formatTimestamp(selected.timestamp, true)}</dd></div>
                                                <div><dt className="text-subtle">Nguồn</dt><dd className="mt-1 text-ink">{selected.source}</dd></div>
                                            </dl>
                                        </div>
                                    ) : (
                                        <div className="flex h-full min-h-52 flex-col items-center justify-center text-center">
                                            <CheckCircle2 className="size-6 text-success" />
                                            <h2 className="mt-3 text-sm font-semibold text-ink">Chọn một điều kiện</h2>
                                            <p className="mt-1 max-w-xs text-xs leading-5 text-subtle">Chi tiết thời điểm và nguồn dữ liệu sẽ xuất hiện tại đây.</p>
                                        </div>
                                    )}
                                </aside>
                            </div>
                        )}
                        <SourceContext source="API trạng thái và lịch sử lệnh robot" updatedAt={fleet.updatedAt} scope="Điều kiện hiện tại, không có xác nhận cảnh báo" />
                    </div>
                </main>
                <MobileBottomNav />
            </div>
        </div>
    );
}

function SummaryCell({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "warning" | "danger" }) {
    return (
        <div className="bg-surface p-4">
            <p className="text-xs text-subtle">{label}</p>
            <p className={cn("mt-1 font-telemetry text-xl font-semibold", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-ink")}>{value}</p>
        </div>
    );
}

function formatTimestamp(value: string | null, full = false) {
    if (!value) return "Chưa có thời điểm";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return full
        ? date.toLocaleString("vi-VN")
        : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}
