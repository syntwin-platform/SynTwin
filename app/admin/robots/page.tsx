"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    Bot,
    Building2,
    Check,
    Copy,
    Cpu,
    Eye,
    Globe,
    KeyRound,
    Loader2,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Signal,
    Trash2,
    Wifi,
} from "lucide-react";
import {
    adminListCompanies,
    type AdminCompany,
} from "@/lib/api/admin";
import {
    createRobot,
    deleteRobot,
    getRobotLatestState,
    listRobots,
    resetRobotDeviceSecret,
    updateRobot,
    type CreateRobotResponse,
    type Robot,
    type RobotLatestState,
} from "@/lib/api/robots";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function AdminRobotsPage() {
    const [robots, setRobots] = useState<Robot[]>([]);
    const [companies, setCompanies] = useState<AdminCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedConnectionType, setSelectedConnectionType] = useState<string>("all");

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showResetSecretModal, setShowResetSecretModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Active Selection States
    const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
    const [latestState, setLatestState] = useState<RobotLatestState | null>(null);
    const [stateLoading, setStateLoading] = useState(false);
    const [newSecretData, setNewSecretData] = useState<CreateRobotResponse | null>(null);
    const [resetSecretValue, setResetSecretValue] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Form Inputs
    const [formCompanyId, setFormCompanyId] = useState("");
    const [formRobotName, setFormRobotName] = useState("");
    const [formModel, setFormModel] = useState("Fairino FR5");
    const [formConnectionType, setFormConnectionType] = useState("HTTP");
    const [formIpAddress, setFormIpAddress] = useState("");
    const [formPort, setFormPort] = useState("8080");

    async function loadData() {
        setLoading(true);
        setError("");
        try {
            const [robotsRes, companiesRes] = await Promise.all([
                listRobots(),
                adminListCompanies(),
            ]);
            setRobots(robotsRes);
            setCompanies(companiesRes);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể tải danh sách robot quản trị."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, []);

    // Filter Logic
    const filteredRobots = robots.filter((r) => {
        const matchesSearch =
            r.robotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.ipAddress && r.ipAddress.includes(searchQuery)) ||
            companies.find((c) => c.id === r.companyId)?.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCompany =
            selectedCompanyId === "all" || r.companyId === selectedCompanyId;
        const matchesStatus =
            selectedStatus === "all" ||
            r.status.toLowerCase() === selectedStatus.toLowerCase();
        const matchesConnectionType =
            selectedConnectionType === "all" ||
            r.connectionType.toLowerCase() === selectedConnectionType.toLowerCase();

        return (
            matchesSearch &&
            matchesCompany &&
            matchesStatus &&
            matchesConnectionType
        );
    });

    // KPI Summary
    const totalRobots = robots.length;
    const onlineRobots = robots.filter(
        (r) => r.status.toLowerCase() === "online" || r.status.toLowerCase() === "running"
    ).length;
    const faultRobots = robots.filter(
        (r) => r.status.toLowerCase() === "fault" || r.status.toLowerCase() === "warning"
    ).length;
    const offlineRobots = totalRobots - onlineRobots;

    // Reset Form
    function resetFormFields() {
        setFormCompanyId(companies[0]?.id || "");
        setFormRobotName("");
        setFormModel("Fairino FR5");
        setFormConnectionType("HTTP");
        setFormIpAddress("");
        setFormPort("8080");
        setNewSecretData(null);
        setError("");
    }

    // Open Create Modal
    function handleOpenCreate() {
        resetFormFields();
        if (companies.length > 0) {
            setFormCompanyId(companies[0].id);
        }
        setShowCreateModal(true);
    }

    // Submit Create Robot
    async function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formCompanyId) {
            setError("Vui lòng chọn doanh nghiệp sở hữu.");
            return;
        }
        if (!formRobotName.trim()) {
            setError("Vui lòng nhập tên robot.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            const res = await createRobot({
                companyId: formCompanyId,
                robotName: formRobotName.trim(),
                model: formModel,
                connectionType: formConnectionType,
                ipAddress: formIpAddress.trim() || null,
                port: formPort ? parseInt(formPort, 10) : null,
            });
            setNewSecretData(res);
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể tạo robot mới."
            );
        } finally {
            setActionLoading(false);
        }
    }

    // Open Edit Modal
    function handleOpenEdit(robot: Robot) {
        setSelectedRobot(robot);
        setFormRobotName(robot.robotName);
        setFormModel(robot.model);
        setFormConnectionType(robot.connectionType);
        setFormIpAddress(robot.ipAddress || "");
        setFormPort(robot.port ? String(robot.port) : "8080");
        setError("");
        setShowEditModal(true);
    }

    // Submit Edit Robot
    async function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedRobot) return;
        if (!formRobotName.trim()) {
            setError("Vui lòng nhập tên robot.");
            return;
        }

        setActionLoading(true);
        setError("");
        try {
            await updateRobot(selectedRobot.id, {
                robotName: formRobotName.trim(),
                model: formModel,
                connectionType: formConnectionType,
                ipAddress: formIpAddress.trim() || null,
                port: formPort ? parseInt(formPort, 10) : null,
            });
            setShowEditModal(false);
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể cập nhật thông tin robot."
            );
        } finally {
            setActionLoading(false);
        }
    }

    // Open Detail & Telemetry Modal
    async function handleOpenDetail(robot: Robot) {
        setSelectedRobot(robot);
        setShowDetailModal(true);
        setStateLoading(true);
        setLatestState(null);
        try {
            const state = await getRobotLatestState(robot.id);
            setLatestState(state);
        } catch {
            // State snapshot may be empty if offline
        } finally {
            setStateLoading(false);
        }
    }

    // Open Reset Secret Modal
    function handleOpenResetSecret(robot: Robot) {
        setSelectedRobot(robot);
        setResetSecretValue(null);
        setCopiedSecret(false);
        setError("");
        setShowResetSecretModal(true);
    }

    // Confirm Reset Secret
    async function handleConfirmResetSecret() {
        if (!selectedRobot) return;
        setActionLoading(true);
        setError("");
        try {
            const res = await resetRobotDeviceSecret(selectedRobot.id);
            setResetSecretValue(res.deviceSecret);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể reset mã kết nối secret."
            );
        } finally {
            setActionLoading(false);
        }
    }

    // Open Delete Modal
    function handleOpenDelete(robot: Robot) {
        setSelectedRobot(robot);
        setError("");
        setShowDeleteModal(true);
    }

    // Confirm Delete Robot
    async function handleConfirmDelete() {
        if (!selectedRobot) return;
        setActionLoading(true);
        setError("");
        try {
            await deleteRobot(selectedRobot.id);
            setShowDeleteModal(false);
            await loadData();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể xóa robot."
            );
        } finally {
            setActionLoading(false);
        }
    }

    // Copy Secret Helper
    function handleCopySecret(text: string) {
        navigator.clipboard.writeText(text);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    }

    return (
        <div className="space-y-6">
            {/* Header Title */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">
                        Quản lý Robot Doanh nghiệp
                    </h1>
                    <p className="mt-1 text-sm text-[#64748B]">
                        Xem, tạo mới, cấu hình và quản lý toàn bộ đội robot của các doanh nghiệp trên hệ thống SynTwin.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => void loadData()}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-medium text-[#334155] shadow-sm hover:bg-[#F8FAFC]"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Làm mới
                    </button>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#C52F00] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#9F2600]"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm Robot mới
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                            Tổng số Robot
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C52F00]/10 text-[#C52F00]">
                            <Bot className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-[#0F172A]">
                        {totalRobots}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                        Thuộc {companies.length} doanh nghiệp
                    </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                            Đang kết nối
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Signal className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-emerald-600">
                        {onlineRobots}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                        Trực tuyến / Đang chạy
                    </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                            Ngoại tuyến
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Wifi className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-[#64748B]">
                        {offlineRobots}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">Chưa có kết nối gần đây</p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                            Bất thường / Cảnh báo
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold text-amber-600">
                        {faultRobots}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">Cần kiểm tra kỹ thuật</p>
                </div>
            </div>

            {/* Global Error Banner */}
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm"
                >
                    {error}
                </div>
            )}

            {/* Filter Bar */}
            <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên robot, model, địa chỉ IP, tên công ty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-4 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#C52F00] focus:bg-white focus:outline-none"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Select Company Filter */}
                    <select
                        aria-label="Lọc theo doanh nghiệp"
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#334155] focus:border-[#C52F00] focus:outline-none"
                    >
                        <option value="all">Tất cả Doanh nghiệp</option>
                        {companies.map((comp) => (
                            <option key={comp.id} value={comp.id}>
                                {comp.name}
                            </option>
                        ))}
                    </select>

                    {/* Select Status Filter */}
                    <select
                        aria-label="Lọc theo trạng thái"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#334155] focus:border-[#C52F00] focus:outline-none"
                    >
                        <option value="all">Tất cả Trạng thái</option>
                        <option value="online">Online / Trực tuyến</option>
                        <option value="running">Running / Đang chạy</option>
                        <option value="offline">Offline / Ngoại tuyến</option>
                        <option value="fault">Fault / Lỗi</option>
                    </select>

                    {/* Select Connection Type Filter */}
                    <select
                        aria-label="Lọc theo chuẩn kết nối"
                        value={selectedConnectionType}
                        onChange={(e) => setSelectedConnectionType(e.target.value)}
                        className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#334155] focus:border-[#C52F00] focus:outline-none"
                    >
                        <option value="all">Tất cả Kết nối</option>
                        <option value="HTTP">HTTP Gateway</option>
                        <option value="MQTT">MQTT Broker</option>
                    </select>
                </div>
            </div>

            {/* Robot Table */}
            <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
                {loading ? (
                    <div className="flex h-48 items-center justify-center gap-2 text-sm text-[#64748B]">
                        <Loader2 className="h-5 w-5 animate-spin text-[#C52F00]" />
                        Đang tải danh sách robot...
                    </div>
                ) : filteredRobots.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center p-6 text-center text-sm text-[#64748B]">
                        <Bot className="mb-2 h-8 w-8 text-[#94A3B8]" />
                        <p className="font-semibold text-[#0F172A]">Không tìm thấy robot nào</p>
                        <p className="mt-1 text-xs">Thử thay đổi bộ lọc hoặc thêm mới robot cho doanh nghiệp.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto" tabIndex={0}>
                        <table className="w-full text-left text-sm" aria-label="Bảng quản lý robot doanh nghiệp">
                            <thead>
                                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]">
                                    <th className="px-5 py-3.5 font-semibold">Tên & Model Robot</th>
                                    <th className="px-5 py-3.5 font-semibold">Doanh nghiệp sở hữu</th>
                                    <th className="px-5 py-3.5 font-semibold">Trạng thái</th>
                                    <th className="px-5 py-3.5 font-semibold">Kết nối IP / Port</th>
                                    <th className="px-5 py-3.5 font-semibold">Ghi nhận gần nhất</th>
                                    <th className="px-5 py-3.5 text-right font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {filteredRobots.map((robot) => {
                                    const company = companies.find((c) => c.id === robot.companyId);
                                    const statusLower = robot.status.toLowerCase();

                                    let badgeTone: "success" | "warning" | "danger" | "neutral" = "neutral";
                                    if (statusLower === "online" || statusLower === "running") badgeTone = "success";
                                    else if (statusLower === "warning" || statusLower === "idle") badgeTone = "warning";
                                    else if (statusLower === "fault" || statusLower === "error") badgeTone = "danger";

                                    return (
                                        <tr key={robot.id} className="transition hover:bg-[#F8FAFC]">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#C52F00]">
                                                        <Cpu className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#0F172A]">
                                                            {robot.robotName}
                                                        </p>
                                                        <p className="text-xs text-[#64748B]">
                                                            Model: <span className="font-mono font-medium text-[#334155]">{robot.model}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                                                    <span className="font-medium text-[#0F172A]">
                                                        {company?.name || "N/A"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge tone={badgeTone}>
                                                    {statusLower === "online"
                                                        ? "Trực tuyến"
                                                        : statusLower === "running"
                                                          ? "Đang chạy"
                                                          : statusLower === "fault"
                                                            ? "Cảnh báo Lỗi"
                                                            : "Ngoại tuyến"}
                                                </StatusBadge>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="text-xs text-[#334155]">
                                                    <p className="font-mono">
                                                        {robot.ipAddress || "Chưa gán IP"}
                                                        {robot.port ? `:${robot.port}` : ""}
                                                    </p>
                                                    <p className="text-[11px] text-[#64748B]">
                                                        Chuẩn: <span className="font-semibold">{robot.connectionType}</span>
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-xs text-[#64748B]">
                                                {robot.lastSeenAt
                                                    ? new Date(robot.lastSeenAt).toLocaleString("vi-VN")
                                                    : "Chưa ghi nhận"}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Xem chi tiết & Telemetry"
                                                        onClick={() => void handleOpenDetail(robot)}
                                                        className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Chỉnh sửa thông tin"
                                                        onClick={() => handleOpenEdit(robot)}
                                                        className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] transition hover:border-[#C52F00] hover:text-[#C52F00]"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Reset mã kết nối Secret"
                                                        onClick={() => handleOpenResetSecret(robot)}
                                                        className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] transition hover:border-amber-500 hover:text-amber-600"
                                                    >
                                                        <KeyRound className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Xóa robot"
                                                        onClick={() => handleOpenDelete(robot)}
                                                        className="rounded-md border border-[#E2E8F0] p-1.5 text-[#64748B] transition hover:border-red-500 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ──────────────────────────────────────────────────────────── */}
            {/* Create Robot Modal */}
            {/* ──────────────────────────────────────────────────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                            <h2 className="text-lg font-bold text-[#0F172A]">Thêm Robot Mới Cho Doanh Nghiệp</h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-xs text-[#64748B] hover:text-[#0F172A]"
                            >
                                Đóng ✕
                            </button>
                        </div>

                        {newSecretData ? (
                            <div className="mt-6 space-y-4">
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                                    <p className="font-bold">Tạo Robot Thành Công!</p>
                                    <p className="mt-1 text-xs">
                                        Mã thiết bị secret này dùng để cấu hình kết nối hardware/Edge Agent:
                                    </p>
                                    <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-300 bg-white px-3 py-2 font-mono text-xs font-bold text-[#0F172A]">
                                        <span>{newSecretData.deviceSecret}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopySecret(newSecretData.deviceSecret)}
                                            className="flex items-center gap-1 text-emerald-600 hover:underline"
                                        >
                                            {copiedSecret ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copiedSecret ? "Đã chép" : "Sao chép"}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="w-full rounded-lg bg-[#C52F00] py-2.5 text-sm font-semibold text-white hover:bg-[#9F2600]"
                                >
                                    Hoàn tất
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={(e) => void handleCreateSubmit(e)} className="mt-4 space-y-4">
                                <div>
                                    <label htmlFor="create-company-select" className="block text-xs font-semibold text-[#334155]">Doanh nghiệp sở hữu *</label>
                                    <select
                                        id="create-company-select"
                                        value={formCompanyId}
                                        onChange={(e) => setFormCompanyId(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                    >
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="create-robot-name-input" className="block text-xs font-semibold text-[#334155]">Tên Robot *</label>
                                    <input
                                        id="create-robot-name-input"
                                        type="text"
                                        placeholder="Ví dụ: RA-001 hoặc Robot Tay Máy 1"
                                        value={formRobotName}
                                        onChange={(e) => setFormRobotName(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#334155]">Model Robot</label>
                                        <select
                                            value={formModel}
                                            onChange={(e) => setFormModel(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                        >
                                            <option value="Fairino FR3">Fairino FR3</option>
                                            <option value="Fairino FR5">Fairino FR5</option>
                                            <option value="Fairino FR10">Fairino FR10</option>
                                            <option value="Fairino FR16">Fairino FR16</option>
                                            <option value="Custom Model">Custom Model</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#334155]">Chuẩn kết nối</label>
                                        <select
                                            value={formConnectionType}
                                            onChange={(e) => setFormConnectionType(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                        >
                                            <option value="HTTP">HTTP Gateway</option>
                                            <option value="MQTT">MQTT Broker</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#334155]">Địa chỉ IP</label>
                                        <input
                                            type="text"
                                            placeholder="192.168.1.100"
                                            value={formIpAddress}
                                            onChange={(e) => setFormIpAddress(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#334155]">Cổng Port</label>
                                        <input
                                            type="number"
                                            placeholder="8080"
                                            value={formPort}
                                            onChange={(e) => setFormPort(e.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex items-center gap-2 rounded-lg bg-[#C52F00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9F2600] disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Tạo Robot
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* Edit Robot Modal */}
            {/* ──────────────────────────────────────────────────────────── */}
            {showEditModal && selectedRobot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                            <h2 className="text-lg font-bold text-[#0F172A]">Chỉnh Sửa Thông Tin Robot</h2>
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="text-xs text-[#64748B] hover:text-[#0F172A]"
                            >
                                Đóng ✕
                            </button>
                        </div>

                        <form onSubmit={(e) => void handleEditSubmit(e)} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#334155]">Tên Robot *</label>
                                <input
                                    type="text"
                                    value={formRobotName}
                                    onChange={(e) => setFormRobotName(e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-[#334155]">Model Robot</label>
                                    <select
                                        value={formModel}
                                        onChange={(e) => setFormModel(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                    >
                                        <option value="Fairino FR3">Fairino FR3</option>
                                        <option value="Fairino FR5">Fairino FR5</option>
                                        <option value="Fairino FR10">Fairino FR10</option>
                                        <option value="Fairino FR16">Fairino FR16</option>
                                        <option value="Custom Model">Custom Model</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#334155]">Chuẩn kết nối</label>
                                    <select
                                        value={formConnectionType}
                                        onChange={(e) => setFormConnectionType(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                    >
                                        <option value="HTTP">HTTP Gateway</option>
                                        <option value="MQTT">MQTT Broker</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-[#334155]">Địa chỉ IP</label>
                                    <input
                                        type="text"
                                        value={formIpAddress}
                                        onChange={(e) => setFormIpAddress(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#334155]">Cổng Port</label>
                                    <input
                                        type="number"
                                        value={formPort}
                                        onChange={(e) => setFormPort(e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#C52F00] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 rounded-lg bg-[#C52F00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9F2600] disabled:opacity-50"
                                >
                                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Lưu Cập Nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* Robot Detail & Telemetry View Modal */}
            {/* ──────────────────────────────────────────────────────────── */}
            {showDetailModal && selectedRobot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#0F172A]">{selectedRobot.robotName}</h2>
                                <p className="text-xs text-[#64748B]">ID: {selectedRobot.id}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowDetailModal(false)}
                                className="text-xs text-[#64748B] hover:text-[#0F172A]"
                            >
                                Đóng ✕
                            </button>
                        </div>

                        <div className="mt-4 space-y-6">
                            {/* General Metadata */}
                            <div className="grid gap-4 sm:grid-cols-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
                                <div>
                                    <span className="text-[#64748B]">Doanh nghiệp:</span>
                                    <p className="font-semibold text-[#0F172A]">
                                        {companies.find((c) => c.id === selectedRobot.companyId)?.name || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[#64748B]">Model & Chuẩn:</span>
                                    <p className="font-semibold text-[#0F172A]">{selectedRobot.model} ({selectedRobot.connectionType})</p>
                                </div>
                                <div>
                                    <span className="text-[#64748B]">Địa chỉ IP:</span>
                                    <p className="font-mono font-semibold text-[#0F172A]">
                                        {selectedRobot.ipAddress || "N/A"}:{selectedRobot.port || 8080}
                                    </p>
                                </div>
                            </div>

                            {/* Telemetry Realtime Snapshot */}
                            <div className="rounded-xl border border-[#E2E8F0] p-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-[#C52F00]" />
                                    Ảnh chụp trạng thái Telemetry mới nhất
                                </h3>

                                {stateLoading ? (
                                    <div className="flex h-32 items-center justify-center gap-2 text-xs text-[#64748B]">
                                        <Loader2 className="h-4 w-4 animate-spin text-[#C52F00]" />
                                        Đang đọc dữ liệu telemetry...
                                    </div>
                                ) : latestState ? (
                                    <div className="mt-4 space-y-3 text-xs">
                                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                                            <span className="text-[#64748B]">Trạng thái:</span>
                                            <StatusBadge tone={latestState.isOnline ? "success" : "neutral"}>
                                                {latestState.isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                                            </StatusBadge>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                                            <span className="text-[#64748B]">Nhiệt độ cảm biến:</span>
                                            <span className="font-mono font-bold text-[#0F172A]">
                                                {latestState.temperature ? `${latestState.temperature}°C` : "N/A"}
                                            </span>
                                        </div>
                                        {latestState.tcpPose && (
                                            <div className="border-b border-[#E2E8F0] pb-2">
                                                <span className="text-[#64748B]">Tọa độ TCP Pose (X, Y, Z):</span>
                                                <p className="mt-1 font-mono text-[11px] font-semibold text-[#0F172A]">
                                                    X: {latestState.tcpPose.x}, Y: {latestState.tcpPose.y}, Z: {latestState.tcpPose.z}
                                                </p>
                                            </div>
                                        )}
                                        {latestState.jointAngles && latestState.jointAngles.length > 0 && (
                                            <div>
                                                <span className="text-[#64748B]">Góc khớp J1-J6:</span>
                                                <p className="mt-1 font-mono text-[11px] font-semibold text-[#0F172A]">
                                                    {latestState.jointAngles.map((j: number, idx: number) => `J${idx + 1}: ${j}°`).join(" · ")}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-xs text-[#64748B]">Chưa có dữ liệu đo đạc trực tiếp từ robot này.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDetailModal(false)}
                                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* Reset Secret Modal */}
            {/* ──────────────────────────────────────────────────────────── */}
            {showResetSecretModal && selectedRobot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <KeyRound className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#0F172A]">Reset Mã Kết Nối Secret</h2>
                                <p className="text-xs text-[#64748B]">{selectedRobot.robotName}</p>
                            </div>
                        </div>

                        {resetSecretValue ? (
                            <div className="mt-4 space-y-4">
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs">
                                    <p className="font-bold">Đã Reset Mã Secret Thành Công!</p>
                                    <p className="mt-1">
                                        Mã kết nối mới này phải được cập nhật vào cấu hình Edge Agent của robot:
                                    </p>
                                    <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-300 bg-white px-3 py-2 font-mono font-bold text-[#0F172A]">
                                        <span>{resetSecretValue}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopySecret(resetSecretValue)}
                                            className="flex items-center gap-1 text-emerald-600 hover:underline"
                                        >
                                            {copiedSecret ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copiedSecret ? "Đã chép" : "Sao chép"}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowResetSecretModal(false)}
                                    className="w-full rounded-lg bg-[#C52F00] py-2 text-sm font-semibold text-white hover:bg-[#9F2600]"
                                >
                                    Đóng
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <p className="text-xs text-[#64748B]">
                                    Hành động này sẽ vô hiệu hóa mã secret cũ. Kết nối hiện tại của robot có thể bị gián đoạn cho đến khi cập nhật mã mới vào phần mềm edge agent.
                                </p>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowResetSecretModal(false)}
                                        className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => void handleConfirmResetSecret()}
                                        className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                                    >
                                        {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        Xác nhận Reset Secret
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ──────────────────────────────────────────────────────────── */}
            {/* Delete Confirmation Modal */}
            {/* ──────────────────────────────────────────────────────────── */}
            {showDeleteModal && selectedRobot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#0F172A]">Xác Nhận Xóa Robot</h2>
                                <p className="text-xs text-[#64748B]">{selectedRobot.robotName}</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            <p className="text-xs text-[#64748B]">
                                Bạn có chắc chắn muốn xóa bản ghi robot <strong className="text-[#0F172A]">{selectedRobot.robotName}</strong> thuộc doanh nghiệp <strong className="text-[#0F172A]">{companies.find((c) => c.id === selectedRobot.companyId)?.name}</strong>? Thao tác này không thể hoàn tác.
                            </p>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => void handleConfirmDelete()}
                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Xóa Robot
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
