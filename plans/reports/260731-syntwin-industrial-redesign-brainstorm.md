# Brainstorm: SynTwin industrial-minimal redesign

**Date:** 2026-07-31

## Ideas Explored

1. **Dark control-room digital twin** — giữ canvas 3D và tăng hiệu ứng kỹ thuật. Loại bỏ vì người dùng yêu cầu bỏ 3D hoàn toàn và hướng này làm tổng thể tối, nặng.
2. **Generic enterprise SaaS** — nền sáng, nhiều card KPI bo tròn và gradient. Loại bỏ vì dễ trông như template, thiếu bản sắc công nghiệp của SynTwin.
3. **Executive industrial minimalism** — nền sáng, cấu trúc graphite/steel, accent cam-đỏ từ logo, typography dữ liệu chính xác, ít card và đường kỹ thuật mảnh. Đây là hướng được chọn.
4. **Data-first factory console** — biểu đồ, status và sự kiện vận hành thay cho 3D; nội dung ưu tiên quyết định và bất thường. Kết hợp vào hướng được chọn.
5. **Public proof-led landing** — kể câu chuyện sản phẩm bằng khả năng có thật, kiến trúc/luồng vận hành, UI preview và pricing; không dùng số liệu hoặc social proof không kiểm chứng. Kết hợp vào hướng được chọn.
6. **Authenticated demo showroom** — Free user xem dashboard mô phỏng đầy đủ tại `/dashboard/demo`, luôn có nhãn dữ liệu giả và không phát sinh mutation. Kết hợp vào hướng được chọn.

## User's Direction

Người dùng muốn giao diện chuyên nghiệp theo hướng industrial nhưng minimalism: đơn giản, tinh tế, sáng và clean; màu sắc bám logo hiện có. Factory View bỏ hoàn toàn 3D và thay bằng thông số/biểu đồ.

Chỉ Basic và Premium được vào dashboard dữ liệu thật. Free user đã đăng nhập được vào `/dashboard/demo` để hiểu đầy đủ dịch vụ qua dữ liệu mô phỏng. Khách chưa đăng nhập xem landing page đầy đủ.

Landing page ưu tiên thuyết phục chủ/quản lý nhà máy ra quyết định mua. Nội dung phải đủ kỹ thuật và trung thực để người có chuyên môn vẫn tin tưởng, không dùng cách trình bày “lùa gà”.

## Open Questions

Không còn câu hỏi chặn planning. Chi tiết chuỗi dữ liệu và metric sẽ được map từ API/frontend hiện có trong từng phase; khi API không cung cấp historical series, giao diện phải dùng trạng thái trung thực thay vì tạo dữ liệu giả ngoài demo.

## Risks

- Redesign toàn site dễ gây regression nếu thay shell, quyền truy cập và từng page trong cùng một commit lớn.
- Session hiện lưu ở client; access gate mới phải tránh flash nội dung và xử lý session refresh chính xác.
- Dashboard thật có thể chưa có đủ historical endpoint cho mọi biểu đồ mong muốn; không được dùng mock để che thiếu API.
- Landing hiện có claim 3D và số liệu chưa có nguồn; cần audit toàn bộ metadata/copy/components cũ.
- Các component landing cũ có nội dung Finova không liên quan dù hiện có thể chưa được render; cần xác định xóa hoặc cô lập để tránh tái sử dụng nhầm.
