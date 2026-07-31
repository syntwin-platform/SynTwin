# Đánh giá năng lực backend cho SynTwin dashboard

**Ngày đánh giá:** 2026-07-31  
**Backend source:** `../SynTwin_Backend`  
**Staging API:** `https://syntwin-api-staging-635200920916.asia-southeast1.run.app`  
**Phạm vi:** đánh giá read-only để frontend redesign dựa trên contract hiện có

## Kết luận

Backend hiện đủ dữ liệu cho dashboard vận hành theo dạng **snapshot hiện tại** và
một phần **telemetry history**:

- danh sách robot và trạng thái kết nối;
- latest state theo robot;
- nhiệt độ, độ trễ, trạng thái, cảnh báo va chạm;
- góc sáu khớp, TCP pose, sequence và thời gian nhận dữ liệu;
- lịch sử telemetry tối đa 7 ngày nếu InfluxDB được bật;
- lịch sử command và kết quả thực thi;
- thông tin company, membership, subscription và quyền thao tác;
- factory run theo ID với trạng thái/thời gian của từng robot.

Tuy nhiên staging hiện báo:

```json
{
  "sqlserver": "Healthy",
  "redis": "Healthy",
  "influxdb": "Healthy — InfluxDB is disabled"
}
```

Khi `InfluxDb:Enabled=false`, backend đăng ký
`NoopRobotTelemetryHistoryReader`, vì vậy telemetry history trả danh sách rỗng.
Frontend không được hiểu mảng rỗng này là nhiệt độ/độ trễ bằng `0`.

Backend chưa đủ contract để hiển thị trung thực:

- load/công suất robot;
- lịch sử cảnh báo có severity, acknowledge và resolution;
- throughput/OEE tổng hợp theo company;
- cycle-time history tổng hợp;
- danh sách factory runs để làm báo cáo lịch sử;
- dashboard metrics tổng hợp cho customer.

## Contract có thể dùng ngay

### Robot inventory

```text
GET /api/robots?companyId={companyId}
GET /api/robots/{robotId}
```

Trường chính:

- `id`, `companyId`, `robotName`, `model`, `connectionType`;
- `status`, `lastSeenAt`;
- `currentUserRole`;
- network config và timestamps.

Phù hợp cho fleet table, tổng số robot, model distribution và điều hướng detail.

### Latest robot state

```text
GET /api/robots/{robotId}/state/latest
```

Contract backend:

- `isOnline`, `status`;
- `jointAngles`, `tcpPose`;
- `sequenceNumber`;
- `io`, `execution`;
- `temperature`, `collisionWarning`;
- `lastSeenAt`, `timestamp`, `receivedAt`;
- `latencyMilliseconds`, `source`.

Có thể dùng cho:

- online/offline/status distribution;
- current temperature comparison;
- current latency comparison;
- collision warning count;
- last-seen/stale state;
- joint/TCP diagnostic detail.

Frontend wrapper hiện thiếu một số trường backend đã trả:

- `sequenceNumber`;
- `io`;
- `execution`;
- `receivedAt`;
- `latencyMilliseconds`.

Redesign nên cập nhật type frontend để phản ánh đầy đủ response, không đổi backend.

### Telemetry history

```text
GET /api/robots/{robotId}/telemetry/history
```

Query:

- `from`, `to`;
- `intervalSeconds`;
- `limit`;
- `runtimeSessionId`;
- `fields`.

Giới hạn:

- mặc định lấy 1 giờ;
- khoảng thời gian tối đa 7 ngày;
- `intervalSeconds` từ 1 đến 86400;
- `limit` từ 1 đến 10000;
- user phải có quyền truy cập robot.

Field được hỗ trợ:

```text
joint1..joint6
tcp_x, tcp_y, tcp_z, tcp_rx, tcp_ry, tcp_rz
sequence_number
latency_ms
temperature
collision_warning
status_code
```

Response point:

- `timestamp`;
- `jointAngles`, `tcpPose`;
- `sequenceNumber`;
- `latencyMilliseconds`;
- `temperature`;
- `collisionWarning`;
- `status`, `source`.

Có thể dùng cho temperature/latency/status/collision/joint/TCP chart khi InfluxDB
được bật và có dữ liệu. Staging hiện tắt InfluxDB, nên frontend phải có empty state:
“Chưa có dữ liệu lịch sử từ hệ thống telemetry.”

Frontend hiện chưa có wrapper cho endpoint này.

### Robot command history

```text
GET /api/robots/{robotId}/commands
POST /api/robots/{robotId}/commands
```

Response có:

- `commandType`, `payload`, `status`;
- `createdAt`, `completedAt`;
- `failureReason`;
- `result.success`, `result.message`, `result.completedAt`.

Có thể dùng cho recent activity, success/failure distribution và execution duration
theo robot. Endpoint list hiện không có query pagination/time range trong controller,
vì vậy frontend cần thận trọng khi tải danh sách lớn.

### Factory runs

```text
POST /api/factory-runs
POST /api/factory-runs/{id}/prepare
POST /api/factory-runs/{id}/start
POST /api/factory-runs/{id}/cancel
GET  /api/factory-runs/{id}
GET  /api/factory-runs/{id}/status
```

Contract chứa:

- status, coordination/failure policy;
- target count;
- scheduled/prepared/started/completed/cancelled timestamps;
- actual start skew;
- từng robot target với prepare/ready/start/actual start/completed;
- start lateness, termination/failure reason.

Backend chưa có `GET /api/factory-runs?companyId=...`, nên frontend không thể tạo
dashboard lịch sử/throughput tổng hợp nếu không có sẵn run ID. Frontend hiện cũng
chưa có API wrapper cho factory runs.

### Company, user và subscription

Backend đã có:

- company list/detail/create/update;
- members và monitor add/replace/status/remove;
- current user profile/update;
- current subscription;
- public subscription-plan list;
- VNPAY checkout/status;
- admin user/company management.

Các contract này đủ để giữ nguyên company, profile, pricing, payment và admin flows.

## Khoảng trống so với biểu đồ mong muốn

| Biểu đồ/thông số | Backend hiện tại | Cách frontend xử lý |
| --- | --- | --- |
| Fleet status | Có | Dùng robot list + latest state |
| Current temperature | Có | Dùng latest state |
| Temperature history | Có contract, staging tắt InfluxDB | Gọi history; hiển thị empty state nếu rỗng |
| Current/history latency | Có | Latest state + history nếu InfluxDB bật |
| Collision warning | Có current/history field | Không gọi là alert history đầy đủ |
| Joint/TCP trends | Có contract | Chỉ hiển thị khi có history |
| Command success/failure | Có | Tổng hợp command list theo robot |
| Load | Không có | Không hiển thị như dữ liệu thật |
| Cycle time | Chỉ có thể suy ra cho factory run biết ID | Không làm dashboard tổng hợp |
| Throughput/OEE | Không có aggregate/list contract | Hiển thị “chưa được backend hỗ trợ” |
| Alert severity/history/ack | Không có Alerts API | Chỉ hiển thị current collision/connectivity conditions |
| Customer dashboard aggregates | Không có | Frontend phải gọi theo robot; theo dõi N+1/partial failure |

## Rủi ro backend cần theo dõi

1. **InfluxDB staging bị tắt**  
   Telemetry history contract tồn tại nhưng không có dữ liệu thực tế trên staging.

2. **Không có fleet telemetry endpoint**  
   Dashboard phải gọi latest/history theo từng robot. Nên dùng `Promise.allSettled`,
   giới hạn polling và thể hiện partial failure.

3. **Không có alert domain API**  
   `collisionWarning` là condition, không thay thế cho alert có severity/lifecycle.

4. **Không có factory-run list**  
   Các DTO run có metric thời gian tốt nhưng chỉ truy xuất được khi biết ID.

5. **Free dashboard là frontend paywall**  
   Backend API hiện chủ yếu phân quyền theo authentication, company membership,
   plan capability và role. Nếu yêu cầu “Free tuyệt đối không được gọi customer API”
   là security rule, backend cần bổ sung policy; frontend route guard chỉ kiểm soát
   trải nghiệm giao diện.

6. **Command list không pagination**  
   Có nguy cơ response lớn theo thời gian vận hành.

## Đề xuất backend sau redesign

Ưu tiên:

```text
GET /api/companies/{companyId}/dashboard
GET /api/companies/{companyId}/telemetry/summary
GET /api/companies/{companyId}/alerts
GET /api/factory-runs?companyId={companyId}&from=...&to=...&page=...
GET /api/robots/{robotId}/commands?from=...&to=...&page=...
```

Dashboard response nên cung cấp:

- fleet/status counts;
- current snapshot timestamps và stale status;
- throughput/cycle metrics có định nghĩa rõ;
- alert severity/lifecycle;
- time-bucket series theo timezone;
- partial-data/source metadata.

## Quyết định frontend

- Dùng latest robot state ngay.
- Bổ sung wrapper telemetry history và sử dụng khi response có dữ liệu.
- Dùng command history cho recent activity có thật.
- Không tạo load, throughput, OEE, cycle-time history hoặc alert severity giả trên
  dashboard trả phí.
- Demo Free được phép dùng bộ dữ liệu mô phỏng deterministic và luôn có nhãn.
- Tất cả trường hợp backend thiếu/tắt dịch vụ phải có empty/unavailable state bằng
  tiếng Việt.
- Không cần sửa backend trong phạm vi frontend redesign.
