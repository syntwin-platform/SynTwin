# Hướng dẫn và Quy tắc kết nối API cho Frontend (SynTwin)

Tài liệu này quy định các nguyên tắc chuẩn (rules) và yêu cầu bắt buộc để frontend (`e:\Syntwin\SynTwin`) kết nối với các endpoint của backend một cách chính xác, thống nhất và bảo mật.

## 1. Cấu trúc thư mục

Tất cả các hàm tương tác với API **phải** được đặt trong thư mục `lib/api/`. 
Hãy phân chia file theo các module (hoặc "Tags") đã được liệt kê trong `api_endpoints_grouped.md`. Ví dụ:
- `lib/api/auth.ts`: Cho các API Auth (`/api/auth/...`)
- `lib/api/users.ts`: Cho các API Users (`/api/users/...` và `/api/admin/users/...`)
- `lib/api/companies.ts`: Cho các API Companies
- `lib/api/robots.ts`: Cho các API liên quan đến Robots và Programs.
- `lib/api/device.ts`: Cho các API Device (Telemetry, Heartbeat).

> [!WARNING]
> Tuyệt đối không viết logic gọi API (`fetch`) trực tiếp bên trong Components hoặc Hooks để đảm bảo tính tái sử dụng và dễ bảo trì.

## 2. Quy tắc sử dụng API Client (Bắt buộc)

Frontend đã có sẵn một HTTP client wrapper tại `lib/api/client.ts`. **BẮT BUỘC** phải dùng hàm `apiRequest<T>` từ file này để thực hiện mọi lời gọi API.

**Tại sao phải dùng `apiRequest`?**
- Tự động đính kèm `Authorization: Bearer <token>` vào Headers.
- Tự động gắn `Content-Type: application/json`.
- Tự động xử lý logic cấp lại token (Refresh Token) khi gặp lỗi `401 Unauthorized`.
- Tự động parse JSON response và chuẩn hóa lỗi thành class `ApiRequestError`.

### Cú pháp chuẩn
```typescript
import { apiRequest } from "@/lib/api/client";

// Ví dụ GET request (Mặc định)
export function getRobotList(): Promise<Robot[]> {
  return apiRequest<Robot[]>("/api/robots");
}

// Ví dụ POST request có payload
export function createCompany(input: CreateCompanyInput): Promise<Company> {
  return apiRequest<Company>("/api/companies", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
```

> [!IMPORTANT]
> Đối với các API công khai (như Đăng nhập, Đăng ký) không cần gửi token, bạn phải truyền thêm `authenticated: false` vào tham số options.
> ```typescript
> return apiRequest<AuthResponse>("/api/auth/login", {
>   method: "POST",
>   body: JSON.stringify(credentials),
>   authenticated: false
> });
> ```

## 3. Định nghĩa Types (TypeScript)

Kiểu dữ liệu (Types/Interfaces) là yêu cầu bắt buộc để đảm bảo an toàn kiểu dữ liệu (type safety).
- **Request Payload**: Tạo interface với hậu tố `Input` hoặc `Request` (VD: `UpdateUserProfileInput`).
- **Response Data**: Tạo interface đại diện cho đối tượng trả về.
- Nơi lưu trữ: Đặt chung trong file module API đó (VD: `lib/api/users.ts`), hoặc đưa vào `lib/api/types.ts` nếu type đó được tái sử dụng ở nhiều nơi.

## 4. Quy ước Endpoint URL

Dựa theo `api_endpoints_grouped.md`, hãy tuân thủ chính xác đường dẫn URL và Method.
- **Route Parameters**: Sử dụng Template Literals của ES6 để truyền ID trực tiếp vào chuỗi URL, không tự ý ghép chuỗi (concatenation).
- **Tuyệt đối không hardcode Base URL**. Cấu hình Base URL đã được xử lý bên trong `client.ts` thông qua biến môi trường `NEXT_PUBLIC_API_BASE_URL`.

```typescript
// ĐÚNG
return apiRequest<Robot>(`/api/robots/${robotId}`);

// SAI (Vi phạm cấu trúc)
return apiRequest<Robot>("/api/robots/" + robotId);
```

## 5. Xử lý Lỗi (Error Handling)

Khi API backend trả về lỗi (Status code không phải 2xx), hàm `apiRequest` sẽ ném ra (throw) một `ApiRequestError` (được định nghĩa trong `lib/api/types.ts`).

Cấu trúc của `ApiRequestError`:
- `.status`: Mã HTTP Status (VD: 400, 403, 404).
- `.message`: Câu thông báo lỗi tổng quát.
- `.errors`: (Tùy chọn) Object chứa danh sách lỗi validation của từng trường (Field-level validation) theo định dạng `Record<string, string[]>`.

**Cách xử lý trên Component:**
Luôn sử dụng `try/catch` để bắt lỗi khi gọi API. Rất tiện lợi nếu bạn kết hợp với `react-hook-form` hoặc `sonner` (Toast) đang có sẵn trong frontend.

```typescript
import { ApiRequestError } from "@/lib/api/types";
import { toast } from "sonner";

async function onSubmit(data) {
  try {
    await updateCurrentUserProfile(data);
    toast.success("Cập nhật thành công!");
  } catch (error) {
    if (error instanceof ApiRequestError) {
      // Hiển thị lỗi từ backend
      toast.error(error.message);
      
      // Nếu có field validation errors, map vào React Hook Form
      if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as any, { type: "server", message: messages[0] });
        });
      }
    } else {
      toast.error("Đã xảy ra lỗi không xác định.");
    }
  }
}
```

---
**Tóm tắt luồng làm việc cho Frontend Developer:**
1. Mở `api_endpoints_grouped.md` xem Endpoint và Method.
2. Viết Type interface cho Dữ liệu gửi đi và Dữ liệu trả về.
3. Định nghĩa hàm API trong thư mục `lib/api/` sử dụng `apiRequest`.
4. Gọi hàm trong Component/Hook, `try/catch` lỗi bằng `ApiRequestError` và xử lý giao diện.
