"use client";

import {
    BellRing,
    Bot,
    Building2,
    ChartNoAxesCombined,
    RadioTower,
    Users,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const items = [
    [RadioTower, "Telemetry và trạng thái", "Theo dõi trạng thái mới nhất, góc khớp, TCP pose, nhiệt độ, cảnh báo va chạm và độ trễ khi nguồn dữ liệu cung cấp."],
    [Bot, "Quản lý robot", "Tạo, cập nhật, xóa robot, kiểm tra kết nối và đặt lại khóa thiết bị theo quyền hiện có."],
    [BellRing, "Nhận diện bất thường", "Đưa điều kiện cảnh báo và dữ liệu cần chú ý lên trước để hỗ trợ kiểm tra vận hành."],
    [ChartNoAxesCombined, "Phân tích có nguồn", "So sánh trạng thái và lịch sử đo đạc khi hệ thống lưu trữ; hiển thị rõ phạm vi và thời điểm."],
    [Building2, "Không gian công ty", "Quản lý thông tin nhà máy, thành viên và phạm vi robot trong cùng một không gian vận hành."],
    [Users, "Vai trò và quyền truy cập", "Phân tách người dùng công ty, chủ sở hữu, người giám sát và SuperAdmin theo hợp đồng hệ thống."],
] as const;

export function Capabilities() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
    const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.06 });

    return (
        <section id="nang-luc" className="border-b border-line bg-canvas py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">

                <div ref={headRef} className="reveal-up max-w-3xl">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Năng lực sản phẩm
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Một lớp vận hành thống nhất cho dữ liệu và quyền quản lý.
                    </h2>
                </div>

                <div ref={gridRef} className="mt-10 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(([Icon, title, desc], i) => (
                        <article
                            key={title}
                            className="reveal-scale card-hover border-b border-r border-line bg-surface p-6"
                            style={{ transitionDelay: `${i * 70}ms` }}
                        >
                            <div className="flex size-10 items-center justify-center rounded-md border border-line bg-canvas">
                                <Icon className="size-5 text-brand" />
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-steel">{desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
