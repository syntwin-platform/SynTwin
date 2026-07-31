"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
    ["01", "Tạo không gian công ty", "Chủ sở hữu thiết lập thông tin nhà máy và phạm vi truy cập cho đội ngũ."],
    ["02", "Đăng ký robot", "Robot được khai báo theo kết nối và nhận khóa thiết bị để tích hợp với hệ thống."],
    ["03", "Thu nhận trạng thái", "SynTwin đọc dữ liệu mới nhất và lịch sử đo đạc khi hạ tầng lưu trữ được bật."],
    ["04", "Theo dõi và hành động", "Người quản lý xem điều kiện bất thường, lịch sử lệnh và điều phối quyền truy cập."],
] as const;

export function OperatingFlow() {
    const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
    const listRef = useScrollReveal<HTMLOListElement>({ threshold: 0.06 });

    return (
        <section id="van-hanh" className="border-b border-line bg-surface py-16 sm:py-24">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.7fr_1.3fr]">

                <div ref={headRef} className="reveal-left">
                    <p className="brand-label font-telemetry text-xs font-semibold uppercase tracking-[.16em] text-brand">
                        Luồng triển khai
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                        Từ tài khoản đến dữ liệu vận hành qua bốn bước rõ ràng.
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-steel">
                        Quy trình mô tả đúng luồng xử lý hiện có, không giả định phần
                        cứng hoặc cơ chế tự động phát hiện chưa được triển khai.
                    </p>
                </div>

                <ol ref={listRef} className="border-t border-line">
                    {steps.map(([n, t, d], i) => (
                        <li
                            key={n}
                            className="reveal-up grid gap-2 border-b border-line py-5 sm:grid-cols-[56px_180px_1fr]"
                            style={{ transitionDelay: `${i * 90}ms` }}
                        >
                            <span className="font-telemetry text-2xl font-bold leading-none text-brand/25">
                                {n}
                            </span>
                            <h3 className="text-sm font-semibold text-ink">{t}</h3>
                            <p className="text-sm leading-6 text-steel">{d}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
