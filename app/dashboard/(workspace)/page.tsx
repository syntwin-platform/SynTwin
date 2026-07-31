"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ChartPanel } from "@/components/shared/ChartPanel";
import { DataState } from "@/components/shared/DataState";
import { FeedbackBanner } from "@/components/shared/FeedbackBanner";
import { MetricCell } from "@/components/shared/MetricCell";
import { SourceContext } from "@/components/shared/SourceContext";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useSession } from "@/hooks/useSession";
import { useFleetSnapshot } from "@/hooks/useFleetSnapshot";
import { useCompany } from "@/lib/company-context";
import { getRobotTelemetryHistory, type TelemetryHistoryPoint } from "@/lib/api/telemetry";
import { listRobotCommands, type RobotCommand } from "@/lib/api/robots";
import {
    formatCollisionWarning,
    formatCommandStatus,
    formatCommandType,
    formatRobotStatus,
} from "@/lib/display-labels";
import { selectFleetSummary } from "@/lib/operations/fleet-selectors";

export default function DashboardOverviewPage() {
    const session = useSession();
    const { selectedCompany, isLoadingCompanies, companyError } = useCompany();
    const fleet = useFleetSnapshot(selectedCompany?.id ?? null);
    const summary = selectFleetSummary(fleet.items);
    const selectedRobot = fleet.items[0]?.robot ?? null;
    const [robotContext, setRobotContext] = useState<{
        robotId: string;
        history: TelemetryHistoryPoint[] | null;
        commands: RobotCommand[] | null;
        error: string;
    }>({ robotId: "", history: null, commands: null, error: "" });
    const history =
        robotContext.robotId === selectedRobot?.id
            ? robotContext.history
            : null;
    const commands =
        robotContext.robotId === selectedRobot?.id
            ? robotContext.commands
            : null;
    const contextError =
        robotContext.robotId === selectedRobot?.id
            ? robotContext.error
            : "";

    useEffect(() => {
        let cancelled = false;
        if (!selectedRobot) return;
        void Promise.allSettled([
            getRobotTelemetryHistory(selectedRobot.id, {
                limit: 240,
                fields: [
                    "temperature",
                    "latency_ms",
                    "status_code",
                    "collision_warning",
                    "joint1",
                    "joint2",
                    "joint3",
                    "joint4",
                    "joint5",
                    "joint6",
                    "tcp_x",
                    "tcp_y",
                    "tcp_z",
                    "tcp_rx",
                    "tcp_ry",
                    "tcp_rz",
                ],
            }),
            listRobotCommands(selectedRobot.id),
        ]).then(([historyResult, commandResult]) => {
            if (cancelled) return;
            const errors = [
                historyResult.status === "rejected"
                    ? "Không thể tải lịch sử đo đạc của robot."
                    : "",
                commandResult.status === "rejected"
                    ? "Không thể tải hoạt động lệnh gần đây."
                    : "",
            ].filter(Boolean);
            setRobotContext({
                robotId: selectedRobot.id,
                history:
                    historyResult.status === "fulfilled"
                        ? historyResult.value
                        : null,
                commands:
                    commandResult.status === "fulfilled"
                        ? commandResult.value
                        : null,
                error: errors.join(" "),
            });
        });

        return () => {
            cancelled = true;
        };
    }, [selectedRobot]);

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
            <div className="hidden sm:block"><Sidebar /></div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <DashboardHeader session={session ?? undefined} />
                <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-20 sm:px-6 sm:pb-6">
                    <div className="mx-auto max-w-[1600px] space-y-6">
                        <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                            <div><p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">Không gian trả phí</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Tổng quan vận hành</h1><p className="mt-1 text-sm text-subtle">{selectedCompany ? `${selectedCompany.name} · Trạng thái đội robot` : "Chọn công ty để xem dữ liệu vận hành thật."}</p></div>
                            <button type="button" onClick={()=>void fleet.refresh()} disabled={fleet.loading || !selectedCompany} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-steel disabled:opacity-50"><RefreshCw className={`size-4 ${fleet.loading?"animate-spin":""}`}/>Làm mới</button>
                        </header>
                        {companyError && <FeedbackBanner tone="error">{companyError}</FeedbackBanner>}
                        {fleet.error && <FeedbackBanner tone={fleet.stale?"warning":"error"} title={fleet.stale?"Đang hiển thị dữ liệu cũ":"Không thể tải dữ liệu"}>{fleet.error}</FeedbackBanner>}
                        {contextError && <FeedbackBanner tone="warning">{contextError}</FeedbackBanner>}
                        {isLoadingCompanies || fleet.loading ? <DataState state="loading"/> : !selectedCompany ? <DataState state="empty" title="Chưa có công ty được chọn" description="Tạo hoặc chọn công ty trước khi theo dõi robot." action={<Link href="/dashboard/company" className="mt-4 inline-flex min-h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-white">Quản lý công ty</Link>}/> : fleet.items.length===0 ? <DataState state="empty" title="Chưa có robot" description="Công ty này chưa đăng ký robot nào." action={<Link href="/dashboard/robots" className="mt-4 inline-flex min-h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-white">Thêm robot</Link>}/> : <>
                            <section className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
                                <MetricCell label="Robot trực tuyến" value={`${summary.online}/${summary.total}`} tone="success"/>
                                <MetricCell label="Cảnh báo va chạm" value={summary.collisionWarnings} tone={summary.collisionWarnings?"danger":"default"}/>
                                <MetricCell label="Nhiệt độ trung bình" value={summary.averageTemperatureCelsius ?? "—"} unit={summary.averageTemperatureCelsius!==null?"°C":undefined}/>
                                <MetricCell label="Chưa xác định" value={summary.unknown} tone={summary.unknown?"warning":"default"}/>
                            </section>
                            <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                                <ChartPanel title="Nhiệt độ hiện tại theo robot" description="Ảnh chụp trạng thái mới nhất; không phải dữ liệu lịch sử" meta={`${fleet.items.length} robot`}>
                                    <div className="space-y-4 py-2">{fleet.items.map(({robot,state,error})=>{const value=state?.temperature; return <div key={robot.id} className="grid grid-cols-[90px_1fr_62px] items-center gap-3"><span className="truncate font-telemetry text-xs font-semibold">{robot.robotName}</span><div className="h-2 bg-line"><div className={`h-full ${typeof value==="number"&&value>=70?"bg-danger":"bg-brand"}`} style={{width:`${Math.min(100,Math.max(0,value??0))}%`}}/></div><span className="text-right font-telemetry text-xs">{typeof value==="number"?`${value} °C`:"—"}</span>{error&&<span className="col-span-3 text-xs text-danger">{error}</span>}</div>})}</div>
                                    <SourceContext source="API trạng thái robot mới nhất" updatedAt={fleet.updatedAt} scope="Ảnh chụp hiện tại"/>
                                </ChartPanel>
                                <div className="border border-line bg-surface"><div className="border-b border-line px-4 py-3"><h2 className="text-sm font-semibold">Điều kiện hiện tại</h2></div><ul className="divide-y divide-line">{fleet.items.map(({robot,state})=><li key={robot.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="font-telemetry text-xs font-semibold">{robot.robotName}</p><p className="mt-1 text-xs text-subtle">{state?.lastSeenAt ? new Date(state.lastSeenAt).toLocaleString("vi-VN") : "Chưa có thời điểm"} · Nguồn: {state?.source ?? "chưa xác định"}</p></div><StatusBadge tone={!state?"warning":state.collisionWarning?"danger":state.isOnline?"success":"neutral"}>{!state?"Không có dữ liệu":state.collisionWarning?"Cảnh báo va chạm":state.isOnline?"Trực tuyến":"Ngoại tuyến"}</StatusBadge></li>)}</ul></div>
                            </section>
                            <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                                <ChartPanel title="Lịch sử nhiệt độ" description={selectedRobot ? `Dữ liệu đo đạc của ${selectedRobot.robotName}` : "Chọn robot để xem lịch sử"} meta={history ? `${history.length} điểm` : "Chưa khả dụng"}>
                                    {history && history.length > 0 ? <div className="space-y-3 py-2">{history.slice(-8).map((point)=><div key={point.timestamp} className="grid grid-cols-[76px_1fr_auto] items-center gap-3"><span className="font-telemetry text-[10px] text-subtle">{new Date(point.timestamp).toLocaleTimeString("vi-VN")}</span><div><div className="h-2 bg-line"><div className="h-full bg-brand" style={{width:`${Math.min(100,Math.max(0,point.temperature ?? 0))}%`}}/></div><p className="mt-1 truncate text-[10px] text-subtle">{formatRobotStatus(point.status)} · {formatCollisionWarning(point.collisionWarning).label}</p></div><span className="text-right font-telemetry text-[10px] leading-5">{typeof point.temperature==="number"?`${point.temperature} °C`:"—"}<br/>{typeof point.latencyMilliseconds==="number"?`${point.latencyMilliseconds} ms`:"—"}</span></div>)}</div> : <p className="py-12 text-center text-sm text-subtle">Chưa có dữ liệu lịch sử từ hệ thống telemetry.</p>}
                                    {history?.at(-1) && <div className="mt-4 grid gap-3 border-t border-line pt-4 text-xs sm:grid-cols-2"><p><span className="text-subtle">Góc khớp mới nhất:</span><br/><span className="font-telemetry text-ink">{history.at(-1)?.jointAngles.length ? history.at(-1)?.jointAngles.map((value,index)=>`J${index+1} ${value}°`).join(" · ") : "Chưa có dữ liệu"}</span></p><p><span className="text-subtle">Tọa độ TCP mới nhất:</span><br/><span className="font-telemetry text-ink">{history.at(-1)?.tcpPose ? `X ${history.at(-1)?.tcpPose?.x}, Y ${history.at(-1)?.tcpPose?.y}, Z ${history.at(-1)?.tcpPose?.z}` : "Chưa có dữ liệu"}</span></p></div>}
                                    <SourceContext source="API lịch sử đo đạc robot" updatedAt={history?.at(-1)?.timestamp ?? null} scope="Tối đa 240 điểm gần nhất"/>
                                </ChartPanel>
                                <article className="border border-line bg-surface">
                                    <div className="border-b border-line px-4 py-3"><h2 className="text-sm font-semibold">Hoạt động lệnh gần đây</h2><p className="mt-1 text-xs text-subtle">Dữ liệu lệnh thật từ robot đang chọn</p></div>
                                    {commands && commands.length > 0 ? <ul className="divide-y divide-line">{commands.slice(0,6).map((command)=><li key={command.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="font-telemetry text-xs font-semibold">{formatCommandType(command.commandType)}</p><p className="mt-1 text-xs text-subtle">{new Date(command.createdAt).toLocaleString("vi-VN")}</p></div><StatusBadge tone={/complete|success/i.test(command.status)?"success":/fail|error/i.test(command.status)?"danger":"neutral"}>{formatCommandStatus(command.status)}</StatusBadge></li>)}</ul> : <p className="px-4 py-10 text-center text-sm text-subtle">Chưa có lệnh gần đây.</p>}
                                </article>
                            </section>
                            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {[
                                    ["Tải robot","Hệ thống máy chủ chưa cung cấp trường tải vận hành."],
                                    ["Sản lượng và chu kỳ","Hệ thống máy chủ chưa có API tổng hợp sản lượng hoặc chu kỳ."],
                                    ["Vòng đời cảnh báo","Hệ thống máy chủ chưa có vòng đời cảnh báo và mức độ nghiêm trọng."],
                                    ["Bảo trì dự đoán","Chưa có dữ liệu hoặc mô hình máy chủ hỗ trợ chỉ số này."],
                                    ["OEE","Hệ thống máy chủ chưa có dữ liệu tổng hợp hiệu suất thiết bị."],
                                    ["Lịch sử ca sản xuất","Factory run đã có nghiệp vụ ghi nhận nhưng chưa có API danh sách để hiển thị."],
                                ].map(([title,description])=><div key={title} className="border border-dashed border-line bg-surface p-4"><AlertTriangle className="size-4 text-warning"/><h2 className="mt-3 text-sm font-semibold">{title}</h2><p className="mt-2 text-xs leading-5 text-subtle">{description}</p><p className="mt-3 font-telemetry text-[10px] uppercase tracking-[.12em] text-subtle">Chưa khả dụng</p></div>)}
                            </section>
                        </>}
                    </div>
                </main>
                <MobileBottomNav/>
            </div>
        </div>
    );
}
