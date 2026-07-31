"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const qs = [
    [
        "Tôi có thể xem sản phẩm trước khi mua không?",
        "Có. Sau khi đăng nhập bằng gói Free, bạn được vào bảng điều khiển demo với dữ liệu mô phỏng cố định và không có thao tác thay đổi dữ liệu thật.",
    ],
    [
        "Basic và Premium khác nhau như thế nào?",
        "Giới hạn robot, khả năng gửi lệnh và thời gian lưu nhật ký được tải trực tiếp từ API bảng giá.",
    ],
    [
        "SynTwin lấy dữ liệu nào từ robot?",
        "Hệ thống hiện mô hình hóa trạng thái kết nối, góc khớp, tọa độ TCP, nhiệt độ, cảnh báo va chạm, độ trễ và lịch sử đo đạc khi kho dữ liệu thời gian thực được bật.",
    ],
    [
        "Ai có thể truy cập dữ liệu nhà máy?",
        "Quyền được xác định theo tài khoản, vai trò trong công ty và gói dịch vụ. SuperAdmin sử dụng không gian quản trị riêng.",
    ],
    [
        "Nếu chưa có dữ liệu lịch sử thì sao?",
        "Bảng điều khiển thật hiển thị trạng thái không khả dụng và nguồn dữ liệu, không thay thế bằng số liệu mô phỏng.",
    ],
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    const itemRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

    return (
        <div
            ref={itemRef}
            className="reveal-up border-b border-line"
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-ink transition hover:text-brand"
                aria-expanded={open}
            >
                <span>{q}</span>
                <ChevronDown
                    className={`size-4 shrink-0 text-subtle transition-transform duration-300 ${open ? "rotate-180 text-brand" : ""}`}
                />
            </button>
            <div
                className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    <p className="text-sm leading-6 text-steel">{a}</p>
                </div>
            </div>
        </div>
    );
}

export function LandingFaq() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section className="bg-surface py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
                <div ref={headRef} className="reveal-up">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Câu hỏi thường gặp
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                        Thông tin cần biết trước khi đánh giá SynTwin.
                    </h2>
                </div>

                <div className="mt-8 border-t border-line">
                    {qs.map(([q, a]) => (
                        <FaqItem key={q} q={q} a={a} />
                    ))}
                </div>
            </div>
        </section>
    );
}
