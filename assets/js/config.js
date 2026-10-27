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

  // Ảnh cá nhân cho mục "Khoảnh khắc". Ảnh gốc ở assets/images/photos/1.jpg…6.jpg,
  // bản nén WebP (cạnh dài ≤ 1600px) ở assets/images/photos/web/ — trang dùng bản nén cho nhẹ.
  // alt: mô tả ảnh (cho người dùng trình đọc màn hình) · caption: chú thích hiện khi hover/xem lớn.
  // width/height = kích thước thật của ảnh → khung giữ đúng tỉ lệ, không cắt người trong ảnh.
  gallery: [
    { src: "assets/images/photos/web/1.webp", alt: "Khoảnh khắc 1", caption: "", width: 1200, height: 1600 },
    { src: "assets/images/photos/web/2.webp", alt: "Khoảnh khắc 2", caption: "", width: 1200, height: 1600 },
    { src: "assets/images/photos/web/3.webp", alt: "Khoảnh khắc 3", caption: "", width: 1200, height: 1600 },
    { src: "assets/images/photos/web/4.webp", alt: "Khoảnh khắc 4", caption: "", width: 1178, height: 1600 },
    { src: "assets/images/photos/web/5.webp", alt: "Khoảnh khắc 5", caption: "", width: 900, height: 1600 },
    { src: "assets/images/photos/web/6.webp", alt: "Khoảnh khắc 6", caption: "", width: 1200, height: 1600 },
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

  // ——— Mini game "This or That" ———
  // Chạy hoàn toàn trên trình duyệt, không lưu gì. Mỗi lượt ghé chỉ chơi 1 lần (không có nút chơi lại; F5 để chơi lại).
  // hubPick: "a" hoặc "b" · hubNote: câu bình luận của HUB
  // colorA/colorB (tuỳ chọn): dùng màu làm nền thẻ thay cho emoji.
  thisOrThat: {
    questions: [
      { id: "drink",  a: "Cà phê",      b: "Trà sữa",        emojiA: "☕", emojiB: "🧋", hubPick: "b",
        hubNote: "Trà sữa mới là chân ái nha, cà phê úng hong được." },
      { id: "place",  a: "Núi",         b: "Biển",           emojiA: "⛰️", emojiB: "🌊", hubPick: "b",
        hubNote: "Cứ nghe sóng vỗ rì rào là lòng nhẹ tênh, mà biển cũng đẹp nữa ấy nhỡ" },
      { id: "sky",    a: "Bình minh",   b: "Hoàng hôn",      emojiA: "🌅", emojiB: "🌇", hubPick: "a",
        hubNote: "Không thức khuya, toàn thức đến sáng nên vẫn iu bình minh nhất" },
      { id: "movie",  a: "Phim kinh dị", b: "Phim chữa lành", emojiA: "👻", emojiB: "🌿", hubPick: "a",
        hubNote: "Hồi bé thì còn rén đây, giờ thì phim kinh dị như phim hài hoy" },
      { id: "vibe",   a: "Náo nhiệt",   b: "Yên tĩnh",       emojiA: "🎉", emojiB: "🍃", hubPick: "b",
        hubNote: "Một góc yên tĩnh với ly nước đậu/trà sữa là đủ vui rồi." },
      { id: "bird",   a: "Gà",          b: "Vịt",            emojiA: "🐔", emojiB: "🦆", hubPick: "b",
        hubNote: "Vịt nhìn ngố ngố dễ thương mà, đúng hông?" },
      { id: "color",  a: "Đỏ",          b: "Vàng",           emojiA: "",   emojiB: "",   hubPick: "b",
        colorA: "#C8283A", colorB: "#F2C14E",
        hubNote: "Bị rối loạn sắc giác bẩm sinh có thik màu gì âu, thích theo ẻm thoy" },
    ],
    // Câu chốt theo số câu giống nhau (min–max). TODO: HUB sửa lại nếu muốn.
    endings: [
      { min: 0, max: 2, text: "Khác nhau xíu mới vui chứ! Kể HUB nghe gu của bạn đi nè." },
      { min: 3, max: 4, text: "Nửa giống nửa khác — vừa đủ để nói chuyện cả đêm dưới trăng 🌙" },
      { min: 5, max: 6, text: "Hợp gu ghê! Chắc chắn mình sẽ thân nhau lắm đó ✨" },
      { min: 7, max: 7, text: "Tri kỷ thất lạc đây rồi! Giống nhau 7/7 luôn 🎉" },
    ],
    autoNextMs: 5000, // tự sang câu sau sau 5 giây
  },

  // ——— "Tín hiệu vũ trụ dành cho bạn" (tarot) ———
  // Dữ liệu 78 lá nằm riêng ở assets/js/data/tarot.js.
  oracle: {
    reversedChance: 0.3,                 // xác suất rút được lá ngược (0 → 1)
    imageDir: "assets/images/tarot/",    // có <id>.webp ở đây thì dùng ảnh, không thì dùng bản vẽ SVG
  },

  // ——— HUB Knowledge Library — "Tủ sách giữa trời sao" ———
  // Mỗi cuốn là một trang web HUB đang viết. Khi web lên sóng: điền url + đổi status thành "live".
  // theme: "ban-than" | "vu-tru" | "ngon-ngu" | "tuong-lai" | "gia-tuong" | "bi-an"
  // glyph (biểu tượng trên gáy & bìa): "spiral" | "saturn" | "speech" | "signal" | "portal" | "keyhole"
  // status: "live" (đã mở cửa) | "writing" (đang viết, dùng progress 0–100) | "soon" (sắp ra mắt)
  library: {
    books: [
      {
        id: "understand-yourself", titleVi: "Thấu Hiểu & Phát Triển Bản Thân", titleEn: "Understand Yourself",
        tagline: "Đọc lại chính mình qua thần số học, cung hoàng đạo và các bài trắc nghiệm tính cách, rồi nối chúng với lựa chọn nghề nghiệp thực tế.",
        theme: "ban-than", color: "#A8553F", glyph: "spiral",
        status: "writing", progress: 50, url: "https://huybao2206.github.io/whoareyou/",
        note: "Đã có phần mở đầu và một phần Thần số học — các chương khác HUB đang viết tiếp.", // ghi chú nhỏ (tuỳ chọn)
        chapters: ["Thần số học", "Cung hoàng đạo & Con giáp", "Bản đồ tính cách", "Sở thích nghề nghiệp", "Nghề nghiệp hôm nay & ngày mai", "Kỹ năng nên đầu tư"],
      },
      {
        id: "into-the-cosmos", titleVi: "Không Gian & Vũ Trụ", titleEn: "Into the Cosmos",
        tagline: "Từ tám hành tinh quanh Mặt Trời đến những thiên hà xa nhất mà kính thiên văn từng chụp được.",
        theme: "vu-tru", color: "#2E3F82", glyph: "saturn",
        status: "soon", progress: 0, url: "", // TODO
        chapters: ["Hệ Mặt Trời", "Vòng đời một ngôi sao", "Hố đen", "Thiên hà & khoảng cách vũ trụ", "Con người chinh phục không gian", "Ngắm sao từ Việt Nam"],
      },
      {
        id: "language-foundations", titleVi: "Nền Tảng Cho Người Học Ngoại Ngữ", titleEn: "Language Foundations",
        tagline: "Những nguyên tắc chung giúp học ngoại ngữ nào cũng nhanh hơn, kèm lộ trình riêng cho tiếng Anh, Pháp, Trung và Hàn.",
        theme: "ngon-ngu", color: "#2D6A64", glyph: "speech",
        status: "soon", progress: 0, url: "", // TODO
        chapters: ["Cách não học ngôn ngữ", "Phát âm & IPA", "Ngữ pháp cốt lõi", "Từ vựng & lặp lại ngắt quãng", "Lộ trình English · Français · 中文 · 한국어", "Nguồn học miễn phí"],
      },
      {
        id: "future-signals", titleVi: "Tín Hiệu Tương Lai", titleEn: "Future Signals",
        tagline: "Những công nghệ đang thay đổi cách chúng ta làm việc, chữa bệnh và tạo ra năng lượng.",
        theme: "tuong-lai", color: "#5E4A96", glyph: "signal",
        status: "soon", progress: 0, url: "", // TODO
        chapters: ["AI & việc làm", "Robot & tự động hoá", "Năng lượng mới", "Y học tương lai", "Những nghề sẽ xuất hiện"],
      },
      {
        id: "fiction-meets-science", titleVi: "Khoa Học Trong Thế Giới Giả Tưởng", titleEn: "Fiction Meets Science",
        tagline: "Đặt những ý tưởng quen thuộc trong phim khoa học viễn tưởng cạnh những gì khoa học hiện nay thật sự biết.",
        theme: "gia-tuong", color: "#86385A", glyph: "portal",
        status: "soon", progress: 0, url: "", // TODO
        chapters: ["Du hành thời gian", "Đa vũ trụ", "Đại dịch zombie: khoa học nói gì", "Sự sống ngoài Trái Đất", "AI trong phim và ngoài đời"],
      },
      {
        id: "unsolved-mysteries", titleVi: "Bí Ẩn Chưa Có Lời Giải", titleEn: "Unsolved Mysteries",
        tagline: "Những câu hỏi về lịch sử, khoa học, đại dương và không gian mà đến nay vẫn chưa có câu trả lời trọn vẹn.",
        theme: "bi-an", color: "#36473C", glyph: "keyhole",
        status: "soon", progress: 0, url: "", // TODO
        chapters: ["Bí ẩn lịch sử", "Bí ẩn khoa học", "Bí ẩn đại dương", "Bí ẩn không gian"],
      },
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
    supabaseUrl: "https://ltqkhzokqvdhsehkadcm.supabase.co",  // Project URL (chỉ tới .supabase.co, KHÔNG kèm /rest/v1). Để trống = chế độ demo.
    supabaseKey: "sb_publishable_4CE0UFmZ5w3eNbY6dG8CWQ_FU4dIUWL",  // anon/publishable key (KHÔNG dùng service_role)
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
