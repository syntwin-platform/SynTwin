# Phản hồi API và backend cho đội SynTwin

**Ngày kiểm tra:** 2026-07-31  
**Môi trường:** `https://syntwin-api-staging-635200920916.asia-southeast1.run.app`  
**Phạm vi:** kiểm tra read-only, không tạo tài khoản và không thay đổi dữ liệu staging

## Kết quả kiểm tra trực tiếp

| Endpoint | HTTP | Kết quả |
| --- | ---: | --- |
| `GET /health/live` | 200 | API đang hoạt động |
| `GET /health/ready` | 200 | SQL Server và Redis healthy; InfluxDB đang bị tắt |
| `GET /api/subscription-plans` | 200 | Trả đúng Free, Basic, Premium và giới hạn tương ứng |
| `GET /swagger/v1/swagger.json` | 404 | Swagger không được bật ở môi trường staging |

Các endpoint yêu cầu đăng nhập không được gọi bằng tài khoản thật. Luồng Free, Basic,
Premium và SuperAdmin được kiểm tra ở frontend bằng fixture bám đúng contract backend.

## Vấn đề cần backend xử lý hoặc xác nhận

### 1. InfluxDB staging đang tắt

`/health/ready` trả:

```text
influxdb: Healthy — InfluxDB is disabled.
```

Endpoint telemetry history vẫn tồn tại nhưng sẽ không có dữ liệu lịch sử thực tế. Frontend
đã hiển thị trạng thái “chưa có dữ liệu” và không tự điền giá trị giả.

**Đề nghị:** bật InfluxDB trên staging và cung cấp một robot có telemetry mẫu nếu cần kiểm
tra biểu đồ tích hợp end-to-end.

### 2. Chưa có API lịch sử cảnh báo

Backend mới cung cấp trạng thái hiện tại như `collisionWarning`, kết nối và kết quả command.
Chưa có alert severity, acknowledge, resolution hoặc lịch sử theo company.

**Đề nghị:** bổ sung `GET /api/companies/{companyId}/alerts` cùng phân trang, khoảng thời
gian, severity và trạng thái xử lý.

### 3. Chưa có API tổng hợp dashboard khách hàng

Frontend hiện phải gọi danh sách robot rồi gọi latest state/command theo từng robot. Cách
này tạo N+1 request và chỉ có thể thể hiện lỗi một phần ở phía trình duyệt.

**Đề nghị:** bổ sung endpoint snapshot tổng hợp theo company, trả cả thời điểm nguồn và
trạng thái stale/partial.

### 4. Thiếu dữ liệu load, production, OEE và danh sách factory run

Không có contract trung thực cho robot load, throughput/OEE, cycle-time history hoặc
`GET /api/factory-runs?companyId=...`. Frontend đã đánh dấu các panel này là chưa khả dụng,
không suy diễn từ joint angle hoặc dữ liệu hiện tại.

### 5. Command history chưa có phân trang

`GET /api/robots/{robotId}/commands` chưa có time range hoặc pagination. Response có nguy
cơ tăng lớn theo thời gian vận hành.

### 6. Quyền Free mới được chặn chắc chắn ở frontend

Frontend chuyển người dùng Free sang `/dashboard/demo`, nhưng route guard phía trình duyệt
không thay thế authorization backend. Nếu Free tuyệt đối không được đọc API dashboard thật,
backend cần áp policy theo subscription plan tại các endpoint robot/company/telemetry.

## Các lỗi console đã báo trước đây

- Request login tới hostname cũ
  `syntwin-api-staging-v7emjerksa-as.a.run.app` không còn là cấu hình được dùng. Frontend
  hiện trỏ sang hostname staging mới ở đầu tài liệu.
- `POST /api/auth/login` trả `401` có nghĩa thông tin đăng nhập bị từ chối; riêng status này
  không chứng minh API login bị hỏng. Cần tài khoản staging hợp lệ để kiểm tra thêm.
- `dashboard/settings?...` trả `404` là lỗi route frontend. Route tương thích hiện chuyển
  sang `/dashboard/user`; không cần thay đổi backend.

## Chi tiết contract

Xem thêm [đánh giá năng lực backend](backend-capability-assessment.md) để biết endpoint,
field telemetry, giới hạn history và cách frontend sử dụng từng nguồn dữ liệu.
