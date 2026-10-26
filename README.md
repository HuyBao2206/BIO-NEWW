# Bảo Huy (HUB) — Website bio "Moonlit Journey"

Trang bio một trang, tĩnh 100% (HTML + CSS + JavaScript thuần), chạy trên **GitHub Pages**, không cần build.
Concept: Cự Giải (cung Nước, chủ quản Mặt Trăng) → **đêm trăng trên mặt nước**, ánh bạc ngọc trai và vàng đèn lồng, cùng một "con đường" mảnh tự vẽ dần khi cuộn trang.

---

## 1. Chạy thử trên máy

Mở terminal ở thư mục chứa `index.html`, chạy **một** trong hai lệnh:

```bash
npx serve .
# hoặc
python -m http.server 8080
```

Sau đó mở `http://localhost:8080` (hoặc địa chỉ `serve` in ra).
⚠️ Không mở trực tiếp file `index.html` bằng double-click, vì trình duyệt chặn ES module khi chạy `file://`.

## 2. Sửa nội dung — chỉ cần sửa 1 file

Mọi chữ, link, ảnh, số điện thoại… đều nằm trong **`assets/js/config.js`**.
Trên GitHub: mở file → bấm biểu tượng ✏️ → sửa → **Commit changes**. Khoảng 1 phút sau trang sẽ tự cập nhật.

- Giá trị `"..."` nghĩa là **chưa có thông tin**. Trang sẽ hiện "Đang cập nhật" và khoá các nút liên quan (không tạo link hỏng).
- Đường dẫn luôn là **đường dẫn tương đối** (không bắt đầu bằng `/`).

> Ngoại lệ duy nhất: các thẻ meta chia sẻ trong `<head>` của `index.html` (xem mục 6), vì Facebook/Zalo không chạy JavaScript.

## 3. Thêm ảnh

| Ảnh | Đường dẫn | Kích thước khuyến nghị |
|---|---|---|
| Avatar | `assets/images/avatar.webp` | vuông, 512×512 |
| Ảnh "Khoảnh khắc" | `assets/images/photos/01.webp`… rồi khai báo trong `CONFIG.gallery` | cạnh dài ≤ 1600px |
| Nghệ sĩ (4:5) | `assets/images/favorites/artists/<ten>.webp` | 800×1000 |
| Bìa nhạc (vuông) | `assets/images/favorites/music/<ten>.webp` | 600×600 |
| Poster phim (2:3) | `assets/images/favorites/movies/<ten>.webp` | 800×1200 |
| Ảnh thuyền (tuỳ chọn) | `assets/images/services/dragon-boat/…` rồi khai báo trong `services.dragonBoat.photos` | 1200×900 |

- Tên file đã đặt sẵn trong `config.js`, bạn chỉ cần bỏ file đúng tên vào đúng thư mục.
- **Chưa có ảnh vẫn đẹp**: trang tự hiện thẻ chữ (gradient sinh từ tên + chữ cái đầu). Lúc đó DevTools sẽ báo vài dòng 404 cho ảnh còn thiếu. Đây là bình thường, các dòng này hết khi bạn thêm ảnh.
- Nén ảnh sang **WebP** bằng [Squoosh](https://squoosh.app) (chất lượng ~75–80).
- Chỉ dùng ảnh bạn có quyền sử dụng (ảnh tự chụp, ảnh chính chủ, hoặc ảnh có license phù hợp).

## 4. Thêm nhạc nền (không bản quyền)

1. Tải 2–4 bài royalty-free, ví dụ từ **[Pixabay Music](https://pixabay.com/music/)**. Đọc kỹ license của từng bài. Mood hợp concept: *lo-fi*, *ambient piano*, *acoustic chill*.
2. Xuất **mp3 128kbps**, mỗi file **< 5MB**, bỏ vào `assets/music/`.
3. Khai báo trong `CONFIG.music.playlist`:
   ```js
   { title: "Tên bài", artist: "Tác giả", src: "assets/music/track-01.mp3", source: "Pixabay", sourceUrl: "https://pixabay.com/music/..." },
   ```
4. Playlist trống thì trình phát tự ẩn. Credit nhạc hiện ở footer và trong panel của player.

⚠️ **Không** đưa các bài trong mục "Yêu thích" (có bản quyền) vào repo. Mục đó chỉ hiển thị thẻ + link Spotify/YouTube (điền ở trường `link`).

## 5. Điền số điện thoại / Zalo

Trong `CONFIG.services.dragonBoat` và `CONFIG.services.order`: điền `contactName`, `phone`, `zalo` (Zalo thường trùng SĐT, để `"..."` thì trang dùng luôn SĐT).
Ví dụ: `phone: "0905 123 456"`. Nút **Gọi ngay** sẽ thành `tel:0905123456`, **Nhắn Zalo** sẽ thành `https://zalo.me/0905123456`.

## 6. Deploy lên GitHub Pages

1. Đẩy toàn bộ thư mục này lên repo (vd `HuyBao2206/BIO-NEWW`, hoặc `USERNAME.github.io` nếu muốn link gọn nhất).
2. Repo → **Settings → Pages** → *Source: Deploy from a branch* → Branch **`main`** / thư mục **`/ (root)`** → Save.
3. Link sẽ là:
   - repo `USERNAME.github.io` → `https://USERNAME.github.io/`
   - repo khác (vd `BIO-NEWW`) → `https://huybao2206.github.io/BIO-NEWW/`
   Trang chạy đúng ở cả hai dạng vì mọi đường dẫn đều tương đối.
4. Sau khi có link thật, thay `https://USERNAME.github.io/` ở:
   - `CONFIG.site.url` trong `assets/js/config.js`
   - các dòng có ghi `<!-- TODO -->` trong `<head>` của `index.html` (canonical, `og:url`, `og:image`, `twitter:image`) và JSON-LD ngay dưới.
5. Kiểm tra ảnh chia sẻ bằng [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (bấm "Scrape Again" mỗi lần đổi).

## 7. Sổ lưu bút

Mặc định chạy ở **chế độ demo**: lời nhắn chỉ lưu trên trình duyệt của người viết. Muốn lời nhắn hiển thị cho mọi người, làm theo **[SETUP-GUESTBOOK.md](SETUP-GUESTBOOK.md)** (Supabase gói Free, khoảng 10 phút).

---

## 8. Mini game & Tín hiệu vũ trụ

### This or That
Câu hỏi, đáp án của HUB và câu bình luận (`hubNote`) nằm trong `CONFIG.thisOrThat` (`assets/js/config.js`). Sau mỗi câu, game tự sang câu tiếp theo sau `autoNextMs` (mặc định 5 giây). Mỗi lượt ghé chỉ chơi được một lần, không có nút chơi lại. Game không lưu gì, nên F5 là chơi lại từ đầu.

### Tín hiệu vũ trụ dành cho bạn (tarot)
- **Dữ liệu 78 lá** nằm riêng ở `assets/js/data/tarot.js` (22 Ẩn chính + 4 bộ × 14 lá). Mỗi lá có từ khoá, thông điệp xuôi/ngược, Tình cảm · Công việc · Lời khuyên.
- Sửa xong thì kiểm tra bằng lệnh `node scripts/check-tarot.mjs`. Lệnh này báo nếu thiếu lá, trùng `id` hoặc thiếu trường.
- Xem trước cả 78 mặt bài: chạy server (mục 1) rồi mở `/scripts/tarot-preview.html`.
- **Tỉ lệ lá ngược:** `CONFIG.oracle.reversedChance` (mặc định `0.3`, tức 30%).
- Mỗi lượt ghé trang chỉ rút được **1 lá**. Lá đó được giữ trong bộ nhớ của tab, không dùng `localStorage`/`sessionStorage`, nên F5 là rút lá mới.

#### Thay mặt bài bằng bộ Rider–Waite–Smith bản gốc (1909)
Mặc định trang tự vẽ mặt bài bằng SVG. Nếu trong `assets/images/tarot/` có file `<id>.webp` thì trang dùng ảnh đó thay cho bản vẽ.

1. Tải bộ ảnh **Rider–Waite–Smith bản 1909** (tranh của Pamela Colman Smith, đã thuộc **phạm vi công cộng**), ví dụ từ Wikimedia Commons, mục *“Rider-Waite tarot deck (Roses & Lilies)”*. Chỉ dùng bản scan gốc 1909, **không** dùng các bản phục chế hoặc tô màu lại sau này: những bản đó có thể còn bản quyền.
2. Cắt và resize về khoảng **400×680 px** (tỉ lệ 200:340), nén **WebP** chất lượng khoảng 80.
3. Đặt tên đúng theo `id` của lá rồi bỏ vào `assets/images/tarot/`. Ví dụ: `the-fool.webp`, `the-magician.webp`, `wheel-of-fortune.webp`, `ace-of-wands.webp`, `ten-of-cups.webp`, `page-of-swords.webp`, `king-of-pentacles.webp`.

Quy ước `id`:

| Nhóm | Mẫu tên file |
|---|---|
| Ẩn chính | `the-fool`, `the-magician`, `the-high-priestess`, `the-empress`, `the-emperor`, `the-hierophant`, `the-lovers`, `the-chariot`, `strength`, `the-hermit`, `wheel-of-fortune`, `justice`, `the-hanged-man`, `death`, `temperance`, `the-devil`, `the-tower`, `the-star`, `the-moon`, `the-sun`, `judgement`, `the-world` |
| Ẩn phụ | `<số>-of-<bộ>`: số = `ace`, `two` … `ten`, `page`, `knight`, `queen`, `king` · bộ = `wands` (Gậy), `cups` (Cốc), `swords` (Kiếm), `pentacles` (Tiền) |

Có thể thay từng lá một; lá nào chưa có ảnh thì vẫn dùng bản vẽ SVG. Riêng lá chưa có ảnh, khi được rút trúng, DevTools sẽ báo một dòng 404. Đây là bình thường.

## 9. HUB Knowledge Library (tủ sách)

Mỗi cuốn sách là một trang web riêng HUB đang viết. Toàn bộ dữ liệu nằm trong `CONFIG.library.books` (`assets/js/config.js`). Dòng thống kê ("6 cuốn · 0 đã mở cửa · 1 đang viết") được tính tự động từ đây.

**Thêm một cuốn mới:** copy một khối `{ ... }` trong `books`, rồi sửa các trường:

| Trường | Ý nghĩa |
|---|---|
| `id` | tên ngắn không dấu, không trùng, vd `"into-the-cosmos"` |
| `titleVi` / `titleEn` | tên tiếng Việt / tiếng Anh |
| `tagline` | 1 câu giới thiệu, hiện ở trang mục lục |
| `theme` | `"ban-than"` · `"vu-tru"` · `"ngon-ngu"` · `"tuong-lai"` · `"gia-tuong"` · `"bi-an"` (dùng cho chip lọc) |
| `color` | màu gáy & bìa, vd `"#2E3F82"` |
| `glyph` | biểu tượng: `"spiral"` · `"saturn"` · `"speech"` · `"signal"` · `"portal"` · `"keyhole"` |
| `status` | `"soon"` (Sắp ra mắt) · `"writing"` (HUB đang viết) · `"live"` (Đã mở cửa) |
| `progress` | tiến độ 0–100, chỉ hiện khi `status: "writing"` |
| `url` | link trang web của cuốn sách |
| `chapters` | 4–6 tên chương |

**Đổi trạng thái:**
- Bắt đầu viết: `status: "writing"`, rồi cập nhật dần `progress` (vd `30` → `60` → `90`). Nếu đã có bản xem trước thì điền luôn `url`: nút sẽ thành "Xem ngay bản đang viết →". Có thể thêm `note` (1 câu) để ghi phần nào đã xong.
- **Khi web lên sóng:** điền `url: "https://..."` (phải bắt đầu bằng `https://`) và đổi `status: "live"`. Bìa sẽ phát sáng và nút "Mở cửa vào thư viện →" bật lên. Bấm nút thì web mở ở **tab mới**, nên khách không rời khỏi bio và nhạc nền vẫn chạy.
- Nếu để `status: "live"` mà chưa có `url` thì nút vẫn bị khoá, kèm dòng "Đường dẫn đang được cập nhật".

**Hiển thị:**
- Máy tính: kệ sách 3D, có vệt sáng và bụi sáng.
- Điện thoại: carousel bìa sách, vuốt ngang để xem.
- Máy bật "giảm chuyển động": lưới bìa sách, không có hiệu ứng 3D.

## ✅ Danh sách TODO cho chủ site

| # | Việc cần làm | Ở đâu |
|---|---|---|
| 1 | Đổi `https://USERNAME.github.io/` thành link thật | `config.js` → `site.url`; `index.html` → các dòng `<!-- TODO -->` + JSON-LD |
| 2 | Thêm avatar | `assets/images/avatar.webp` |
| 3 | Thêm ảnh Khoảnh khắc + khai báo | `assets/images/photos/` + `CONFIG.gallery` |
| 4 | Thêm ảnh nghệ sĩ / bìa nhạc / poster phim (tên file có sẵn) | `assets/images/favorites/...` |
| 5 | Điền link Spotify/YouTube cho 4 bài hát | `CONFIG.favorites.music[].link` |
| 6 | Thuyền Rồng: người phụ trách, SĐT, Zalo | `services.dragonBoat.contactName/phone/zalo` |
| 7 | Thuyền Rồng: giá tham khảo, giờ hoạt động, sức chứa | `services.dragonBoat.details[].value` |
| 8 | (Tuỳ chọn) Ảnh thuyền thật | `services.dragonBoat.photos` |
| 9 | Order: người phụ trách, SĐT, Zalo | `services.order.contactName/phone/zalo` |
| 10 | Order: xác nhận lại 5 bước quy trình | `services.order.steps` |
| 11 | Order: chỉnh khối "Vì sao chọn chúng tôi" cho đúng thực tế | `services.order.whys` |
| 12 | Order: trả lời 4 câu FAQ | `services.order.faq[].a` |
| 13 | Thêm 2–4 bài nhạc nền royalty-free | `assets/music/` + `CONFIG.music.playlist` |
| 14 | Kết nối Supabase cho sổ lưu bút | `CONFIG.guestbook.supabaseUrl/supabaseKey` — xem SETUP-GUESTBOOK.md |
| 15 | (Tuỳ chọn) Bật workflow keepalive Supabase | repository secrets — xem SETUP-GUESTBOOK.md |
| 16 | (Tuỳ chọn) Sửa các câu chốt theo mức điểm của This or That | `CONFIG.thisOrThat.endings` |
| 17 | (Tuỳ chọn) Thay mặt bài tarot bằng ảnh Rider–Waite–Smith 1909 | `assets/images/tarot/<id>.webp` — xem mục 8 |
| 18 | Thư viện: điền `url` + đổi `status: "live"` khi từng web sách lên sóng; cập nhật `progress` | `CONFIG.library.books` — xem mục 9 |

---

## Cấu trúc thư mục

```
index.html · 404.html · manifest.webmanifest · .nojekyll
assets/
  css/        tokens.css (màu, font, motion) · base.css · components.css · sections/*.css
  js/
    config.js         ← NỘI DUNG Ở ĐÂY
    data/tarot.js     ← 78 lá tarot
    main.js           ← ghép các module
    modules/          render, preloader, nav, sky, hero, motion, gallery, favorites,
                      services, guestbook(-service), music-player, fx, toast, icons, utils,
                      this-or-that, oracle, tarot-art, library
  images/  music/  icons/
supabase/schema.sql
.github/workflows/supabase-keepalive.yml
```

## Quyết định kỹ thuật (và lý do)

- **Thư viện (pin version, qua jsDelivr):** GSAP 3.15.0 + ScrollTrigger + SplitText, Lenis 1.3.26, supabase-js 2.116.0 (bản UMD, **chỉ tải khi đã cấu hình Supabase**).
- **Không dùng Swiper:** carousel tự viết bằng CSS `scroll-snap`. Vuốt native mượt trên điện thoại, nhẹ hơn khoảng 150KB, vẫn cuộn được khi JS tắt. Đầy đủ tính năng brief yêu cầu: loop vô hạn (clone 2 bên), 2 nút ‹ › trên desktop, kéo chuột, phím mũi tên, trackpad ngang, autoplay 10 giây có vòng tiến độ quanh nút › và thanh progress, tự dừng khi hover/tương tác/tab ẩn/ngoài màn hình.
- **Dữ liệu từ `config.js`:** HTML chỉ có khung, cộng một ít nội dung dự phòng (tên, quote, mạng xã hội) để người tắt JS vẫn đọc được. Nếu CDN lỗi, nội dung vẫn hiện đầy đủ, chỉ mất hiệu ứng. Trạng thái ẩn ban đầu của animation chỉ được đặt bằng JS khi GSAP đã tải xong.
- **Lenis chỉ bật trên máy có chuột.** Màn hình cảm ứng, chế độ giảm chuyển động hoặc máy yếu (≤ 4 nhân CPU / Data Saver) đều dùng cuộn native.
- **Tiếng Việt:** chuỗi được chuẩn hoá NFC trước khi tách chữ. Tên ở hero tách theo ký tự nhưng **không dùng mask**, để dấu (ả, ẫ, ự…) không bị xén. Tiêu đề section dùng mask theo dòng, có nới vùng cắt thêm `.16em`. Chữ Hán/Hàn chỉ tải đúng các ký tự cần dùng (tham số `&text=` của Google Fonts).
- **Ký hiệu ♋** vẽ bằng SVG thay vì ký tự Unicode, vì nhiều máy hiển thị ký tự này thành emoji.
- **Con đường hành trình** chạy dọc lề trang và chỉ băng ngang ở khoảng trống giữa hai section, để không cắt qua chữ.
- **Accordion FAQ** dùng `grid-template-rows` (ngoại lệ nhỏ duy nhất animate thuộc tính layout, vì chiều cao động không làm được bằng transform).
- **Thẻ meta OG** viết sẵn trong HTML vì scraper của Facebook/Zalo không chạy JS. `canonical`, `og:url` và JSON-LD vẫn được đồng bộ lại từ `config.site.url` khi trang chạy.
- Các mô tả dịch vụ viết trung tính, **không** có giá, thời gian, sức chứa hay cam kết nào. Mọi chỗ đó để `"..."`.
