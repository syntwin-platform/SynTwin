# Mốc chất lượng trước redesign

Ngày ghi nhận: 2026-07-31

## Kết quả trước khi thay đổi runtime

- `npx tsc --noEmit`: đạt.
- `npm run build`: đạt, 17 route ứng dụng được tạo tĩnh.
- `npm run lint`: chưa đạt với 5 lỗi và 16 cảnh báo có sẵn.
- Chunk lớn nhất trong `.next/static/chunks`: 1.037.990 byte; đây là
  chunk nền có sẵn trước redesign và được lưu trong
  `scripts/build-assets-baseline.json`.

## Lỗi lint nền

1. `app/dashboard/robots/page.tsx`: gọi luồng cập nhật state trực tiếp từ
   effect khi nạp robot.
2. `components/FactoryScene.tsx`: cập nhật trạng thái WebGL trực tiếp từ
   effect.
3. `components/RobotFormDialog.tsx`: đồng bộ form bằng nhiều `setState`
   trực tiếp trong effect.
4. `components/ui/carousel.tsx`: gọi `onSelect` cập nhật state trực tiếp
   trong effect.
5. `components/ui/sidebar.tsx`: dùng `Math.random()` trong render.

`FactoryScene` sẽ bị loại bỏ cùng toàn bộ runtime 3D ở Phase 03. Những lỗi
còn lại phải được sửa trước quality gate cuối; redesign không được bổ sung
lỗi lint mới.

## Mốc Phase 01

- Unit access, safe destination và refresh đồng thời: 82/82 test đạt.
- E2E access, registration/pricing/VNPay handoff và session update: 16/16 test
  đạt.
- Production build: đạt, 18 route hiện hữu cộng `/dashboard/demo`.
- Asset budget: đạt; không có asset mới vượt 500.000 byte.
