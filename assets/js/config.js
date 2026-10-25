/* =====================================================================
 *  CONFIG — NGUỒN DỮ LIỆU DUY NHẤT CỦA TRANG
 *  ---------------------------------------------------------------------
 *  Mọi chữ, link, ảnh, số điện thoại… đều nằm ở file này.
 *  Sửa trực tiếp trên GitHub (bấm biểu tượng ✏️), Commit là xong.
 *
 *  Quy ước:
 *  - Giá trị "..." nghĩa là CHƯA CÓ THÔNG TIN → trang sẽ hiện "Đang cập nhật"
 *    và các nút liên quan bị khoá (không tạo link hỏng).
 *  - Đường dẫn ảnh/nhạc là đường dẫn TƯƠNG ĐỐI (không bắt đầu bằng "/").
 *  - Ảnh chưa có file → trang tự hiện thẻ chữ thay thế, không bị lỗi.
 * ===================================================================== */

export const CONFIG = {
  site: {
    url: "https://USERNAME.github.io/", // TODO: đổi theo repo thật (nhớ đổi cả các thẻ meta trong index.html — xem README)
    title: "Bảo Huy (HUB)",
    description: "Bio của Bảo Huy (HUB) — Freelancer. Biến những nơi ta hằng mong ước thành những con đường ta đã từng đi qua.",
  },

  profile: {
    name: "Bảo Huy",
    nickname: "HUB",
    birthday: "2002-06-22",
    zodiac: { name: "Cự Giải", symbol: "♋", element: "Nước", ruler: "Mặt Trăng" },
    job: "Freelancer",
    avatar: "assets/images/avatar.webp",
    quote: "Biến những nơi ta hằng mong ước thành những con đường ta đã từng đi qua",
  },

  socials: [
    { id: "facebook", label: "Facebook", url: "https://www.facebook.com/cynical2206/" },
    { id: "gmail",    label: "Gmail",    email: "baohuy22062002@gmail.com" },
    { id: "tiktok",   label: "TikTok",   url: "https://www.tiktok.com/@hubmanifest" },
  ],

  // Ảnh cá nhân cho mục "Khoảnh khắc". Bỏ dấu // ở đầu dòng và sửa cho đúng tên file.
  // Khuyến nghị: WebP, cạnh dài ≤ 1600px. width/height (tuỳ chọn) giúp tránh giật layout.
  gallery: [
    // { src: "assets/images/photos/01.webp", alt: "Mô tả ảnh", caption: "", width: 1200, height: 1600 },
  ],

  favorites: {
    autoplayMs: 10000,
    artists: [
      { name: "Đen Vâu",      sub: "Rapper · Việt Nam",             img: "assets/images/favorites/artists/den-vau.webp" },
      { name: "Bảo Anh",      sub: "Ca sĩ · Việt Nam",              img: "assets/images/favorites/artists/bao-anh.webp" },
      { name: "Laufey",       sub: "Singer-songwriter · Iceland",   img: "assets/images/favorites/artists/laufey.webp" },
      { name: "Dua Lipa",     sub: "Pop · Anh",                     img: "assets/images/favorites/artists/dua-lipa.webp" },
      { name: "Lana Del Rey", sub: "Singer-songwriter · Mỹ",        img: "assets/images/favorites/artists/lana-del-rey.webp" },
    ],
    // link: dán URL Spotify hoặc YouTube. Để trống "" thì nút nghe sẽ ẩn.
    // Trang KHÔNG phát các bài này (có bản quyền) — chỉ mở link ngoài.
    music: [
      { title: "Young and Beautiful",    artist: "Lana Del Rey",    img: "assets/images/favorites/music/young-and-beautiful.webp", link: "" },
      { title: "The Fate of Ophelia",    artist: "Taylor Swift",    img: "assets/images/favorites/music/the-fate-of-ophelia.webp", link: "" },
      { title: "Đi Theo Bóng Mặt Trời",  artist: "Đen",             img: "assets/images/favorites/music/di-theo-bong-mat-troi.webp", link: "" },
      { title: "Từng Là Của Nhau",       artist: "Bảo Anh ft. Táo", img: "assets/images/favorites/music/tung-la-cua-nhau.webp", link: "" },
    ],
    movies: [
      { title: "Resident Evil",      vi: "Vùng Đất Quỷ Dữ",  type: "Phim",   img: "assets/images/favorites/movies/resident-evil.webp" },
      { title: "John Wick",          vi: "Sát Thủ John Wick", type: "Phim",  img: "assets/images/favorites/movies/john-wick.webp" },
      { title: "World War Z",        vi: "Thế Chiến Z",       type: "Phim",  img: "assets/images/favorites/movies/world-war-z.webp" },
      { title: "Train to Busan",     vi: "Chuyến Tàu Sinh Tử", type: "Phim", img: "assets/images/favorites/movies/train-to-busan.webp" },
      { title: "Breaking Bad",       vi: "Tập Làm Người Xấu", type: "Series", img: "assets/images/favorites/movies/breaking-bad.webp" },
      { title: "去有风的地方",         vi: "Đi Đến Nơi Có Gió", type: "Series", img: "assets/images/favorites/movies/di-den-noi-co-gio.webp" },
      { title: "Avatar",             vi: "Avatar",            type: "Phim",  img: "assets/images/favorites/movies/avatar.webp" },
    ],
    languages: [
      { name: "English",  greeting: "Hello" },
      { name: "Français", greeting: "Bonjour" },
      { name: "中文",      greeting: "你好",    romanization: "Nǐ hǎo" },
      { name: "한국어",    greeting: "안녕하세요", romanization: "Annyeonghaseyo" },
    ],
  },

  services: {
    dragonBoat: {
      title: "Thuyền Rồng Sông Hương",
      tagline: "Một chiều thong thả trên dòng Hương — nghe gió, ngắm đèn lồng và để lòng mình chậm lại một chút.",
      // Mở rộng từ danh sách chữ thành { title, desc, icon }. icon: "cruise" | "dinner" | "party" | "cahue"
      items: [
        { title: "Dạo chơi trên sông Hương", icon: "cruise",
          desc: "Thả mình trôi theo dòng Hương êm đềm, ngắm hai bờ xanh mướt và hoàng hôn xứ Huế dịu dàng." },
        { title: "Ăn tối trên thuyền", icon: "dinner",
          desc: "Một bữa tối ấm cúng bồng bềnh trên sông, có gió mát, có ánh đèn lồng và người thương ngồi cạnh." },
        { title: "Tổ chức tiệc gia đình / hội nhóm", icon: "party",
          desc: "Sinh nhật, họp lớp hay tiệc công ty — cùng nhau tạo nên một kỷ niệm thật khác giữa lòng sông Hương." },
        { title: "Nghe ca Huế trên sông Hương", icon: "cahue",
          desc: "Lắng nghe những làn điệu ca Huế ngọt ngào vang lên giữa đêm sông nước — nét đẹp rất riêng của cố đô." },
      ],
      // Thông tin thêm — "..." sẽ hiện "Đang cập nhật". Không bịa số liệu.
      details: [
        { label: "Giá tham khảo", value: "..." }, // TODO
        { label: "Giờ hoạt động", value: "..." }, // TODO
        { label: "Sức chứa",      value: "..." }, // TODO
      ],
      contactName: "...", // TODO
      phone: "...",       // TODO
      zalo: "...",        // TODO (thường trùng SĐT)
      // Ảnh thuyền thật (tuỳ chọn): { src: "assets/images/services/dragon-boat/01.webp", alt: "..." }
      photos: [],
    },
    order: {
      title: "Order Hàng Trung Quốc Nội Địa",
      description: "Dịch vụ mua hộ hàng chất lượng, độc đáo từ các sàn thương mại điện tử Trung Quốc. Bạn chỉ cần gửi link hoặc ảnh sản phẩm.",
      platforms: ["Taobao", "Tmall", "1688", "Pinduoduo", "JD.com"],
      // icon: "fashion" | "beauty" | "home" | "tech" | "collect" | "search"
      categories: [
        { title: "Thời trang & phụ kiện", icon: "fashion" },
        { title: "Mỹ phẩm & làm đẹp", icon: "beauty" },
        { title: "Decor & gia dụng", icon: "home" },
        { title: "Công nghệ & phụ kiện", icon: "tech" },
        { title: "Đồ sưu tầm, blind box, văn phòng phẩm", icon: "collect" },
        { title: "Tìm hàng theo yêu cầu", icon: "search" },
      ],
      // Đây là QUY TRÌNH MẶC ĐỊNH — chủ dịch vụ xác nhận/chỉnh lại cho đúng thực tế. // TODO
      steps: [
        "Gửi link hoặc ảnh sản phẩm",
        "Nhận báo giá trọn gói",
        "Xác nhận & đặt cọc",
        "Mua hàng, vận chuyển về Việt Nam, cập nhật tiến độ",
        "Nhận hàng & thanh toán phần còn lại",
      ],
      // Viết trung tính, KHÔNG cam kết cụ thể. Chủ dịch vụ tự chỉnh. // TODO
      whys: [
        { title: "Tư vấn tận tâm", desc: "Trao đổi rõ ràng để bạn chọn đúng món mình cần." },
        { title: "Báo giá trước khi mua", desc: "Bạn biết chi phí trọn gói trước khi quyết định đặt." },
        { title: "Cập nhật tiến độ", desc: "Thông tin đơn hàng được báo lại trong suốt quá trình." },
        { title: "Tìm hàng theo yêu cầu", desc: "Hỗ trợ săn những món độc đáo, khó tìm trên nhiều sàn." },
      ],
      faq: [
        { q: "Bao lâu thì nhận được hàng?", a: "..." },        // TODO
        { q: "Phí dịch vụ tính thế nào?", a: "..." },          // TODO
        { q: "Có kiểm hàng trước khi giao không?", a: "..." }, // TODO
        { q: "Hàng lỗi/sai mẫu xử lý ra sao?", a: "..." },     // TODO
      ],
      contactName: "...", // TODO
      phone: "...",       // TODO
      zalo: "...",        // TODO
    },
  },

  music: {
    // Chỉ dùng nhạc KHÔNG BẢN QUYỀN (vd Pixabay Music). Danh sách trống → ẩn trình phát.
    playlist: [
      // { title: "...", artist: "...", src: "assets/music/track-01.mp3", source: "Pixabay", sourceUrl: "https://..." },
    ],
  },

  guestbook: {
    supabaseUrl: "",  // TODO: dán Project URL (xem SETUP-GUESTBOOK.md). Để trống = chế độ demo.
    supabaseKey: "",  // TODO: dán anon/publishable key (KHÔNG dùng service_role)
    pageSize: 12,
    minName: 2,
    maxName: 40,
    maxMessage: 500,
    cooldownSeconds: 60,
    minFillSeconds: 3,
    blockLinks: true,
    moods: ["🌙", "✨", "🌊", "🌸", "🎧", "💌"], // nhớ sửa cả danh sách trong supabase/schema.sql nếu đổi
  },
};
