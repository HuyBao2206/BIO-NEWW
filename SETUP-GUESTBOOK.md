# Cài đặt Sổ lưu bút (Supabase — gói Free)

Khi chưa cài, sổ lưu bút chạy ở **chế độ demo**: lời nhắn chỉ lưu trong trình duyệt của người viết. Làm theo các bước dưới (khoảng 10 phút) để mọi người cùng thấy lời nhắn, cập nhật realtime.

## Bước 1 — Tạo project

1. Vào <https://supabase.com> → **Start your project** → đăng nhập bằng GitHub.
2. **New project** → đặt tên (vd `hub-guestbook`), đặt mật khẩu database (lưu lại), chọn Region gần Việt Nam nhất (vd **Southeast Asia (Singapore)**) → **Create new project**.
3. Đợi khoảng 1–2 phút cho project khởi tạo xong.

## Bước 2 — Tạo bảng (chạy `schema.sql`)

1. Menu trái → **SQL Editor** → **New query**.
2. Mở file [`supabase/schema.sql`](supabase/schema.sql), copy **toàn bộ**, dán vào → **Run**.
3. Thấy "Success. No rows returned" là xong. File này chạy lại nhiều lần cũng không sao.

File sẽ tạo:
- bảng `guestbook_entries`, có kiểm tra độ dài tên (1–40) / lời nhắn (1–500) và danh sách sticker hợp lệ;
- trigger luôn ghi `created_at = now()`, trim dữ liệu, và **chặn flood**: quá 20 lời nhắn / 10 phút trên toàn bảng thì từ chối (đổi ngưỡng ở biến `max_per_window` / `window_size`);
- **RLS**: khách chỉ **đọc** được lời nhắn `is_visible = true` và chỉ **thêm** được lời nhắn mới (không sửa, không xoá, không tự ghim);
- bật **Realtime** cho bảng.

> Đổi danh sách sticker trong `config.js` thì nhớ sửa luôn dòng `guestbook_mood_valid` trong `schema.sql` rồi chạy lại.

## Bước 3 — Lấy URL + key, dán vào config

1. Menu trái → **Project Settings** → **API** (hoặc **Data API / API Keys**).
2. Copy:
   - **Project URL**, dạng `https://abcdxyz.supabase.co`
   - **anon public** key (hoặc **Publishable key** `sb_publishable_…`)
3. Mở `assets/js/config.js`, điền:
   ```js
   guestbook: {
     supabaseUrl: "https://abcdxyz.supabase.co",
     supabaseKey: "eyJhbGciOi...  hoặc  sb_publishable_...",
     ...
   ```
4. Commit, đợi Pages cập nhật, rồi mở trang. Dòng "Chế độ demo" phải biến mất.

> 🔒 Key **anon/publishable** được phép public vì đã có RLS bảo vệ.
> **TUYỆT ĐỐI KHÔNG** dán `service_role` hay **secret key** vào code. Key đó bỏ qua mọi bảo mật.

## Kiểm duyệt lời nhắn

**Table Editor → guestbook_entries**:
- **Ẩn** lời nhắn: bỏ tick `is_visible` (có thể bật lại sau).
- **Xoá hẳn**: chọn dòng → Delete.
- **Ghim** lên đầu: tick `is_pinned`.

## Project bị tạm dừng (paused)

Supabase **tạm dừng project gói Free** nếu gần như không có hoạt động trong khoảng 1 tuần. Khi đó sổ lưu bút sẽ báo lỗi kèm nút "Thử lại". Phần còn lại của trang vẫn chạy bình thường.

**Khôi phục:** đăng nhập Supabase → mở project → bấm **Restore project** (hoặc *Resume*). Đợi vài phút là chạy lại, dữ liệu vẫn còn nguyên.

## (Tuỳ chọn) Workflow keepalive, tránh bị tạm dừng

File `.github/workflows/supabase-keepalive.yml` chạy **mỗi 3 ngày**, gửi một truy vấn `select` nhẹ để project luôn có hoạt động.

1. Repo GitHub → **Settings → Secrets and variables → Actions → New repository secret**, tạo 2 secret:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon/publishable key
2. Tab **Actions** → nếu GitHub hỏi thì bấm *I understand my workflows, go ahead and enable them*.
3. Chọn **Supabase keepalive** → **Run workflow** để chạy thử. Thấy dấu ✅ là được.

⚠️ **GitHub tự tắt workflow theo lịch nếu repo 60 ngày không có commit nào.** Khi đó bạn sẽ nhận email báo. Cách bật lại: tab **Actions → Supabase keepalive → Enable workflow** (hoặc commit một thay đổi bất kỳ).

Chưa tạo secrets thì workflow tự bỏ qua, không báo lỗi.
