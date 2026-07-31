"use client";

// Paid workspace route. Access is enforced before CompanyProvider mounts.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Check,
  Clock,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useSession } from "@/hooks/useSession";
import { useCompany } from "@/lib/company-context";
import {
  createRobot,
  deleteRobot,
  getRobotLatestState,
  listRobots,
  resetRobotDeviceSecret,
  updateRobot,
  type CreateRobotInput,
  type Robot,
  type RobotLatestState,
  type UpdateRobotInput,
} from "@/lib/api/robots";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;
const CONNECTION_TYPES = ["HTTP", "MQTT"] as const;

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface RobotWithState {
  robot: Robot;
  state: RobotLatestState | null;
  stateLoading: boolean;
}

type ModalMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; robot: Robot }
  | {
      kind: "secret";
      robotId: string;
      robotName: string;
      secret: string;
    };

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function RobotManagementPage() {
  const session = useSession();
  const {
    selectedCompany,
    isLoadingCompanies,
    companyError,
    refreshCompanies,
  } = useCompany();

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-canvas">
      <div className="hidden sm:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader session={session} />

        {isLoadingCompanies ? (
          <CompanyLoadingState />
        ) : selectedCompany ? (
          <RobotWorkspace
            key={selectedCompany.id}
            companyId={selectedCompany.id}
            companyName={selectedCompany.name}
            canSendCommand={selectedCompany.canSendCommand}
            isOwner={selectedCompany.currentUserRole === "Owner"}
          />
        ) : (
          <NoCompanyState
            error={companyError}
            onRetry={() => void refreshCompanies()}
          />
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RobotWorkspace
// ─────────────────────────────────────────────────────────────

function RobotWorkspace({
  companyId,
  companyName,
  canSendCommand,
  isOwner,
}: {
  companyId: string;
  companyName: string;
  canSendCommand: boolean;
  isOwner: boolean;
}) {
  const [rows, setRows] = useState<RobotWithState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalMode>({
    kind: "closed",
  });
  const [actionError, setActionError] = useState("");
  const [actionSaving, setActionSaving] = useState(false);

  // ── Load robot list ──────────────────────────────
  const loadRobots = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const robots = await listRobots(companyId);
      setRows(
        robots.map((robot) => ({
          robot,
          state: null,
          stateLoading: true,
        }))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRobots(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRobots]);

  // ── Poll latest states ──────────────────────────
  useEffect(() => {
    if (rows.length === 0 || loading) return;

    let cancelled = false;

    async function fetchStates(): Promise<void> {
      const robotIds = rows.map((r) => r.robot.id);

      const results = await Promise.allSettled(
        robotIds.map((id) => getRobotLatestState(id))
      );

      if (cancelled) return;

      setRows((current) =>
        current.map((row, i) => ({
          ...row,
          state:
            results[i]?.status === "fulfilled"
              ? results[i].value
              : row.state,
          stateLoading: false,
        }))
      );
    }

    void fetchStates();

    const intervalId = window.setInterval(() => {
      void fetchStates();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rows.length]);

  // ── Create robot ───────────────────────────────
  async function handleCreate(
    input: CreateRobotInput | UpdateRobotInput
  ): Promise<void> {
    const createInput = input as CreateRobotInput;
    setActionSaving(true);
    setActionError("");

    try {
      const { robot, deviceSecret } =
        await createRobot(createInput);

      setRows((current) => [
        ...current,
        { robot, state: null, stateLoading: false },
      ]);

      setModal({
        kind: "secret",
        robotId: robot.id,
        robotName: robot.robotName,
        secret: deviceSecret,
      });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionSaving(false);
    }
  }

  // ── Update robot ──────────────────────────────
  async function handleUpdate(
    robotId: string,
    input: CreateRobotInput | UpdateRobotInput
  ): Promise<void> {
    const updateInput: UpdateRobotInput = {
      robotName: input.robotName,
      model: input.model,
      connectionType: input.connectionType,
      ipAddress: input.ipAddress,
      port: input.port,
    };
    setActionSaving(true);
    setActionError("");

    try {
      const updated = await updateRobot(robotId, updateInput);

      setRows((current) =>
        current.map((row) =>
          row.robot.id === robotId
            ? { ...row, robot: updated }
            : row
        )
      );

      setModal({ kind: "closed" });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionSaving(false);
    }
  }

  // ── Delete robot ──────────────────────────────
  async function handleDelete(robot: Robot): Promise<void> {
    if (
      !window.confirm(
        `Xóa robot "${robot.robotName}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      await deleteRobot(robot.id);
      setRows((current) =>
        current.filter((row) => row.robot.id !== robot.id)
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // ── Reset device secret ───────────────────────
  async function handleResetSecret(
    robot: Robot
  ): Promise<void> {
    if (
      !window.confirm(
        `Đặt lại khóa thiết bị cho "${robot.robotName}"? Khóa hiện tại sẽ ngừng hoạt động ngay lập tức.`
      )
    ) {
      return;
    }

    try {
      const result = await resetRobotDeviceSecret(robot.id);

      setModal({
        kind: "secret",
        robotId: robot.id,
        robotName: robot.robotName,
        secret: result.deviceSecret,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const activeCount = rows.filter(
    (r) => r.state?.isOnline
  ).length;
  const offlineCount = rows.filter(
    (r) => r.state && !r.state.isOnline
  ).length;

  return (
    <main className="flex-1 overflow-y-auto bg-canvas p-4 pb-20 sm:p-6 sm:pb-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="font-telemetry text-[11px] font-semibold uppercase tracking-[.16em] text-brand">Thiết bị nhà máy</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Quản lý robot
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            {companyName} — {rows.length} robot
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadRobots()}
            disabled={loading}
            aria-label="Làm mới danh sách robot"
            className="flex size-11 items-center justify-center rounded-md border border-line bg-surface text-steel hover:border-brand/40 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={() => {
                setActionError("");
                setModal({ kind: "create" });
              }}
              className="flex min-h-11 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              <Plus size={15} /> Thêm robot
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="Tổng số"
          value={rows.length}
          color="#C52F00"
          icon={Activity}
        />
        <SummaryCard
          label="Trực tuyến"
          value={activeCount}
          color="#22C55E"
          icon={Activity}
        />
        <SummaryCard
          label="Ngoại tuyến"
          value={offlineCount}
          color="#475569"
          icon={Clock}
        />
        <SummaryCard
          label="Chưa xác định"
          value={
            rows.length - activeCount - offlineCount
          }
          color="#FACC15"
          icon={Clock}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Robot table */}
      <div className="overflow-hidden border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">
            Đội robot
          </h2>
          <span className="text-xs text-[#475569]">
            Trạng thái cập nhật mỗi {POLL_INTERVAL_MS / 1000} giây
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#475569]">
            <Loader2 className="h-4 w-4 animate-spin text-[#C52F00]" />
            Đang tải robot…
          </div>
        ) : (
          <>
          <div className="divide-y divide-line md:hidden">
            {rows.map(({ robot, state, stateLoading }) => (
              <RobotMobileCard
                key={robot.id}
                robot={robot}
                state={state}
                stateLoading={stateLoading}
                isOwner={isOwner}
                onEdit={() => {
                  setActionError("");
                  setModal({ kind: "edit", robot });
                }}
                onDelete={() => void handleDelete(robot)}
                onResetSecret={() => void handleResetSecret(robot)}
              />
            ))}
            {rows.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-subtle">
                {isOwner
                  ? "Chưa có robot. Hãy thêm robot đầu tiên."
                  : "Công ty này chưa có robot."}
              </p>
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Robot
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Mẫu máy
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Kết nối
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Nhiệt độ
                  </th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    Lần cuối ghi nhận
                  </th>
                  {isOwner && (
                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {rows.map(({ robot, state, stateLoading }) => (
                  <RobotRow
                    key={robot.id}
                    robot={robot}
                    state={state}
                    stateLoading={stateLoading}
                    isOwner={isOwner}
                    canSendCommand={canSendCommand}
                    onEdit={() => {
                      setActionError("");
                      setModal({ kind: "edit", robot });
                    }}
                    onDelete={() => void handleDelete(robot)}
                    onResetSecret={() =>
                      void handleResetSecret(robot)
                    }
                  />
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={isOwner ? 7 : 6}
                      className="py-16 text-center text-sm text-[#475569]"
                    >
                      {isOwner
                        ? "Chưa có robot. Hãy thêm robot đầu tiên."
                        : "Công ty này chưa có robot."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Modals */}
      {modal.kind === "create" && (
        <RobotFormModal
          mode="create"
          companyId={companyId}
          saving={actionSaving}
          error={actionError}
          onSubmit={(input) => void handleCreate(input)}
          onClose={() => setModal({ kind: "closed" })}
        />
      )}

      {modal.kind === "edit" && (
        <RobotFormModal
          mode="edit"
          companyId={companyId}
          robot={modal.robot}
          saving={actionSaving}
          error={actionError}
          onSubmit={(input) =>
            void handleUpdate(modal.robot.id, input)
          }
          onClose={() => setModal({ kind: "closed" })}
        />
      )}

      {modal.kind === "secret" && (
        <DeviceSecretModal
          robotName={modal.robotName}
          secret={modal.secret}
          onClose={() => setModal({ kind: "closed" })}
        />
      )}
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// RobotRow
// ─────────────────────────────────────────────────────────────

function RobotMobileCard({
  robot,
  state,
  stateLoading,
  isOwner,
  onEdit,
  onDelete,
  onResetSecret,
}: {
  robot: Robot;
  state: RobotLatestState | null;
  stateLoading: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onResetSecret: () => void;
}) {
  const isOnline = state?.isOnline ?? null;
  const temperature = state?.temperature;

  return (
    <article className="p-4" aria-label={`Robot ${robot.robotName}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-telemetry text-base font-semibold text-ink">
            {robot.robotName}
          </h3>
          <p className="mt-1 text-xs text-subtle">{robot.model}</p>
        </div>
        {stateLoading ? (
          <span className="inline-flex items-center gap-1 text-xs text-subtle">
            <Loader2 className="size-3 animate-spin" /> Đang tải
          </span>
        ) : (
          <StatusBadge
            tone={isOnline === null ? "neutral" : isOnline ? "success" : "warning"}
          >
            {isOnline === null ? "Chưa xác định" : isOnline ? "Trực tuyến" : "Ngoại tuyến"}
          </StatusBadge>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 text-xs">
        <div className="col-span-2">
          <dt className="text-subtle">Kết nối</dt>
          <dd className="mt-1 break-words font-medium text-steel">
            {robot.connectionType}
            {robot.ipAddress ? ` · ${robot.ipAddress}${robot.port ? `:${robot.port}` : ""}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-subtle">Nhiệt độ</dt>
          <dd className="mt-1 font-telemetry font-medium text-steel">
            {temperature == null ? "—" : `${temperature}°C`}
          </dd>
        </div>
        <div>
          <dt className="text-subtle">Lần cuối ghi nhận</dt>
          <dd className="mt-1 text-steel">
            {state?.lastSeenAt ? formatRelative(state.lastSeenAt) : "—"}
          </dd>
        </div>
      </dl>

      {isOwner && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button type="button" onClick={onEdit} aria-label={`Sửa ${robot.robotName}`} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-line text-xs font-medium text-steel">
            <Pencil className="size-4" /> Sửa
          </button>
          <button type="button" onClick={onResetSecret} aria-label={`Đặt lại khóa thiết bị của ${robot.robotName}`} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-line text-xs font-medium text-steel">
            <KeyRound className="size-4" /> Đặt khóa
          </button>
          <button type="button" onClick={onDelete} aria-label={`Xóa ${robot.robotName}`} className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md border border-red-200 text-xs font-medium text-danger">
            <Trash2 className="size-4" /> Xóa
          </button>
        </div>
      )}
    </article>
  );
}

function RobotRow({
  robot,
  state,
  stateLoading,
  isOwner,
  onEdit,
  onDelete,
  onResetSecret,
}: {
  robot: Robot;
  state: RobotLatestState | null;
  stateLoading: boolean;
  isOwner: boolean;
  canSendCommand: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onResetSecret: () => void;
}) {
  const isOnline = state?.isOnline ?? null;
  const temp = state?.temperature;

  return (
    <tr className="transition-colors hover:bg-orange-50/30">
      <td className="px-4 py-3">
        <div className="font-medium text-[#0F172A]">
          {robot.robotName}
        </div>
        <div className="font-mono text-[10px] text-[#475569]">
          {robot.id.slice(0, 8)}…
        </div>
      </td>

      <td className="px-4 py-3 text-xs text-[#475569]">
        {robot.model}
      </td>

      <td className="px-4 py-3">
        {stateLoading ? (
          <span className="flex items-center gap-1 text-xs text-[#475569]">
            <Loader2 size={11} className="animate-spin" />
            Đang tải
          </span>
        ) : isOnline === null ? (
          <span className="flex items-center gap-1 text-xs text-[#475569]">
            <span className="h-2 w-2 rounded-full bg-[#E2E8F0]" />
            Chưa xác định
          </span>
        ) : isOnline ? (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Trực tuyến
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-[#475569]">
            <span className="h-2 w-2 rounded-full bg-[#475569]" />
            Ngoại tuyến
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-xs text-[#64748B]">
        <div>{robot.connectionType}</div>
        {robot.ipAddress && (
          <div className="font-mono text-[10px] text-[#475569]">
            {robot.ipAddress}
            {robot.port ? `:${robot.port}` : ""}
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {temp != null ? (
          <div className="flex items-center gap-1">
            <Thermometer
              size={12}
              className={cn(
                temp > 60
                  ? "text-red-500"
                  : "text-[#475569]"
              )}
            />
            <span
              className={cn(
                "font-mono text-xs font-medium",
                temp > 60
                  ? "text-red-600"
                  : temp > 45
                  ? "text-yellow-700"
                  : "text-[#334155]"
              )}
            >
              {temp}°C
            </span>
          </div>
        ) : (
          <span className="text-xs text-subtle">—</span>
        )}
      </td>

      <td className="px-4 py-3 text-xs text-[#475569]">
        {state?.lastSeenAt
          ? formatRelative(state.lastSeenAt)
          : "—"}
      </td>

      {isOwner && (
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={onEdit}
              title="Sửa robot"
              aria-label={`Sửa ${robot.robotName}`}
              className="inline-flex size-11 items-center justify-center rounded-md text-subtle hover:bg-canvas hover:text-steel"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={onResetSecret}
              title="Đặt lại khóa thiết bị"
              aria-label={`Đặt lại khóa thiết bị của ${robot.robotName}`}
              className="inline-flex size-11 items-center justify-center rounded-md text-subtle hover:bg-canvas hover:text-steel"
            >
              <KeyRound size={14} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Xóa robot"
              aria-label={`Xóa ${robot.robotName}`}
              className="inline-flex size-11 items-center justify-center rounded-md text-subtle hover:bg-red-50 hover:text-danger"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// RobotFormModal
// ─────────────────────────────────────────────────────────────

function RobotFormModal({
  mode,
  companyId,
  robot,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  mode: "create" | "edit";
  companyId: string;
  robot?: Robot;
  saving: boolean;
  error: string;
  onSubmit: (input: CreateRobotInput | UpdateRobotInput) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(
    robot?.robotName ?? ""
  );
  const [model, setModel] = useState(
    robot?.model ?? ""
  );
  const [connectionType, setConnectionType] = useState(
    CONNECTION_TYPES.includes(
      robot?.connectionType as (typeof CONNECTION_TYPES)[number]
    )
      ? robot?.connectionType ?? "HTTP"
      : "HTTP"
  );
  const [ipAddress, setIpAddress] = useState(
    robot?.ipAddress ?? ""
  );
  const [port, setPort] = useState(
    robot?.port != null ? String(robot.port) : ""
  );
  const dialogRef = useDialogA11y(onClose);

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): void {
    e.preventDefault();

    if (mode === "create") {
      onSubmit({
        companyId,
        robotName: name.trim(),
        model: model.trim(),
        connectionType: connectionType || undefined,
        ipAddress: ipAddress.trim() || null,
        port: port ? Number(port) : null,
      } satisfies CreateRobotInput);
    } else {
      onSubmit({
        robotName: name.trim(),
        model: model.trim(),
        connectionType: connectionType || undefined,
        ipAddress: ipAddress.trim() || null,
        port: port ? Number(port) : null,
      } satisfies UpdateRobotInput);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="robot-dialog-title" className="w-full max-w-md rounded-md border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 id="robot-dialog-title" className="text-base font-semibold text-ink">
            {mode === "create"
              ? "Thêm robot mới"
              : `Sửa ${robot?.robotName}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="inline-flex size-11 items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <FormField label="Tên robot" required>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: FR3-Line-A"
              className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00] focus:ring-2 focus:ring-[#C52F00]/10"
            />
          </FormField>

          <FormField label="Mẫu máy" required>
            <input
              type="text"
              required
              maxLength={100}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ví dụ: Fairino FR3"
              className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00] focus:ring-2 focus:ring-[#C52F00]/10"
            />
          </FormField>

          <FormField label="Kiểu kết nối">
            <select
              value={connectionType}
              onChange={(e) =>
                setConnectionType(e.target.value)
              }
              className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00]"
            >
              {CONNECTION_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Địa chỉ IP">
              <input
                type="text"
                maxLength={50}
                value={ipAddress}
                onChange={(e) =>
                  setIpAddress(e.target.value)
                }
                placeholder="192.168.1.100"
                className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00] focus:ring-2 focus:ring-[#C52F00]/10"
              />
            </FormField>

            <FormField label="Port">
              <input
                type="number"
                min={1}
                max={65535}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8080"
                className="h-11 w-full rounded-lg border border-[#DCE3EC] px-3 text-sm outline-none focus:border-[#C52F00] focus:ring-2 focus:ring-[#C52F00]/10"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E8F0] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg border border-[#E2E8F0] px-4 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-[#C52F00] px-5 text-sm font-semibold text-white hover:bg-[#9F2600] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              {mode === "create" ? "Tạo robot" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DeviceSecretModal
// ─────────────────────────────────────────────────────────────

function DeviceSecretModal({
  robotName,
  secret,
  onClose,
}: {
  robotName: string;
  secret: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useDialogA11y(onClose);

  function copy(): void {
    void navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="secret-dialog-title" className="w-full max-w-md rounded-md border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-[#C52F00]" />
            <h2 id="secret-dialog-title" className="text-base font-semibold text-ink">
              Khóa thiết bị
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Hãy sao chép khóa ngay. Khóa sẽ không được hiển thị lại.
          </div>

          <p className="text-sm text-[#64748B]">
            Robot: <strong>{robotName}</strong>
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <code className="flex-1 break-all font-mono text-xs text-[#0F172A]">
              {secret}
            </code>
            <button
              type="button"
              onClick={copy}
              className={cn(
                "flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors",
                copied
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
              )}
            >
              {copied ? (
                <>
                  <Check size={12} /> Đã sao chép
                </>
              ) : (
                "Sao chép"
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-11 w-full rounded-lg bg-[#C52F00] text-sm font-semibold text-white hover:bg-[#9F2600]"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading / empty states
// ─────────────────────────────────────────────────────────────

function CompanyLoadingState() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex items-center gap-3 text-sm text-[#64748B]">
        <RefreshCw className="h-4 w-4 animate-spin text-[#C52F00]" />
        Đang tải không gian công ty…
      </div>
    </div>
  );
}

function NoCompanyState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#C52F00]/10">
          <Building2 className="h-6 w-6 text-[#C52F00]" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-[#0F172A]">
          Chưa có không gian công ty
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#64748B]">
          Tài khoản chưa có quyền truy cập một công ty đang hoạt động.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Thử lại
          </button>

          <Link
            href="/dashboard/company"
            className="rounded-lg bg-[#C52F00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9F2600]"
          >
            Xem công ty
          </Link>
        </div>
      </div>
    </div>
  );
}

function useDialogA11y(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    focusable()[0]?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = focusable();
      if (controls.length === 0) return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return dialogRef;
}

// ─────────────────────────────────────────────────────────────
// SummaryCard
// ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#64748B]">
            {label}
          </p>
          <p
            className="mt-1 text-3xl font-bold"
            style={{ color }}
          >
            {value}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FormField helper
// ─────────────────────────────────────────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#334155]">
        {label}
        {required && (
          <span className="ml-0.5 text-[#C52F00]">*</span>
        )}
      </span>
      {children}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);

  if (sec < 60) return `${sec} giây trước`;
  if (sec < 3600) return `${Math.floor(sec / 60)} phút trước`;
  if (sec < 86400)
    return `${Math.floor(sec / 3600)} giờ trước`;
  return `${Math.floor(sec / 86400)} ngày trước`;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Đã xảy ra lỗi không xác định.";
}
