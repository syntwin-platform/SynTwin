# Admin API Verification Feedback

**Ngày kiểm tra:** 2026-07-31

**Frontend:** https://syn-twin-kappa.vercel.app

**Backend staging:** https://syntwin-api-staging-635200920916.asia-southeast1.run.app

## Kết luận

Chưa phát hiện lỗi backend API admin có thể xác nhận từ phạm vi frontend.

- `/health/live` trả `200`.
- `/health/ready` trả `200`; SQL Server và Redis đều `Healthy`.
- CORS preflight từ origin
  `https://syn-twin-kappa.vercel.app` trả `204` và đúng
  `access-control-allow-origin`.
- 9 endpoint admin trong Swagger đều có frontend API wrapper tương ứng.
- Khi không có access token, cả 9 endpoint trả `401`, đúng với yêu cầu
  `[Authorize(Roles = "SuperAdmin")]`.

## Endpoint đã kiểm tra

| Method | Endpoint | Kết quả không có token |
| --- | --- | --- |
| GET | `/api/admin/users` | `401` |
| GET | `/api/admin/users/{id}` | `401` |
| PATCH | `/api/admin/users/{id}/status` | `401` |
| PATCH | `/api/admin/users/{id}/role` | `401` |
| PATCH | `/api/admin/users/{id}/subscription` | `401` |
| GET | `/api/admin/companies` | `401` |
| GET | `/api/admin/companies/{companyId}/members` | `401` |
| POST | `/api/admin/companies/{companyId}/monitors` | `401` |
| PUT/DELETE | `/api/admin/companies/{companyId}/monitors/{monitorUserId}` | `401` |

## Lỗi contract frontend đã sửa

Frontend trước đây gửi giá trị subscription `Enterprise`, trong khi backend
chỉ chấp nhận:

```text
Free | Basic | Premium
```

Frontend đã được đổi sang `Premium` cho cả filter và thao tác cập nhật.
Đây là lỗi mapping phía frontend, không phải lỗi backend.

## Giới hạn kiểm thử

Chưa có credential của tài khoản staging `SuperAdmin`, vì vậy chưa thể xác
nhận response `2xx`, dữ liệu trả về và các mutation thật trên staging.

Để hoàn tất kiểm thử end-to-end cần một tài khoản test SuperAdmin và tối thiểu
một company/user test có thể thay đổi an toàn.

## Đề xuất API, không phải blocker

Admin overview hiện tổng hợp số liệu bằng các API users/companies sẵn có.
Frontend cần nhiều request để lấy tổng theo status và subscription plan.

Backend có thể cân nhắc bổ sung:

```text
GET /api/admin/dashboard/metrics
```

Response đề xuất gồm `totalUsers`, `activeUsers`, `totalCompanies`,
`linkedMonitors`, `usersByStatus` và `usersByPlan`. Endpoint này sẽ giảm số
request và tạo một snapshot thống nhất, nhưng không bắt buộc để dashboard hiện
tại hoạt động.

## Ghi chú ngoài phạm vi admin

API coverage audit còn ghi nhận `GET /api/device/commands/pending` chưa có
frontend wrapper. Đây không phải API của admin dashboard và chưa được thay đổi
trong công việc này.

## Console incidents

### `/dashboard/settings` trả `404`

Nguyên nhân là Sidebar từng trỏ đến route chưa tồn tại. Trang settings thực tế
đang nằm tại `/dashboard/user`.

Frontend đã:

- đổi link Settings sang `/dashboard/user`;
- thêm redirect tương thích `/dashboard/settings` sang `/dashboard/user` để
  các tab hoặc chunk cũ đang prefetch không còn nhận `404`.

### Login gọi API staging cũ và trả `401`

Bundle production hiện tại đã được kiểm tra và chỉ chứa API URL:

```text
https://syntwin-api-staging-635200920916.asia-southeast1.run.app
```

Bundle không còn URL `syntwin-api-staging-v7emjerksa-as.a.run.app` hoặc
`localhost:5000`. Request tới URL cũ trong console đến từ document/chunk đã tải
trước deployment; cần hard refresh tab đang mở.

Cả API cũ và API mới đều trả `401` với body
`{"message":"Invalid email or password."}` khi credential không hợp lệ. Nếu
request đã đi tới API URL mới mà vẫn `401`, cần kiểm tra tài khoản trong
database staging mới; đây không phải lỗi route hoặc CORS của frontend.
