/* Minh hoạ lá bài tarot bằng SVG — phong cách "Moonlit Journey" (viền vàng, nền đêm).
 * Major Arcana: mỗi lá một biểu tượng riêng · Minor Arcana: biểu tượng của bộ, sắp theo số lượng.
 * Mọi biểu tượng vẽ trong hộp 100×100 rồi đặt vào vùng minh hoạ của lá. */

const GOLD = '#E8C27A';
const SOFT = '#F3DDAB';
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
const RANK = { 1: 'ACE', 11: 'PAGE', 12: 'KNIGHT', 13: 'QUEEN', 14: 'KING' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const g = (body, attrs = '') => `<g fill="none" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${attrs}>${body}</g>`;

function starPath(cx, cy, r, points = 5, inner = 0.42, rot = -90) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 ? r * inner : r;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}
const rays = (cx, cy, r1, r2, n, offset = 0) => Array.from({ length: n }, (_, i) => {
  const a = ((i * 360) / n + offset) * Math.PI / 180;
  return `M${(cx + r1 * Math.cos(a)).toFixed(1)} ${(cy + r1 * Math.sin(a)).toFixed(1)}L${(cx + r2 * Math.cos(a)).toFixed(1)} ${(cy + r2 * Math.sin(a)).toFixed(1)}`;
}).join('');
const sparkle = (x, y, r) => `<path d="${starPath(x, y, r, 4, 0.28, -90)}" fill="${SOFT}" stroke="none"/>`;

/* ———————————————— Biểu tượng 22 lá Ẩn chính ———————————————— */
const MAJOR_ART = [
  /* 0 The Fool */ () => g(`<circle cx="72" cy="24" r="9"/><path d="${rays(72, 24, 13, 18, 10)}"/>
    <path d="M8 92V64Q30 60 46 68L60 92"/><path d="M30 76 62 40"/><circle cx="65" cy="37" r="5"/>
    <circle cx="30" cy="44" r="4.5" fill="${SOFT}" stroke="none"/><path d="M30 49v8"/>`),
  /* 1 The Magician */ () => g(`<path d="M30 22C30 12 46 12 50 22S70 32 70 22 54 12 50 22 30 32 30 22Z"/>
    <path d="M50 38V86"/><circle cx="50" cy="36" r="3" fill="${SOFT}"/><circle cx="50" cy="88" r="3"/><path d="M16 70H84"/>
    <path d="M24 70v-6h6v6M70 70v-8a4 4 0 0 1 8 0v8"/>`),
  /* 2 The High Priestess */ () => g(`<rect x="12" y="18" width="10" height="72" rx="2"/><rect x="78" y="18" width="10" height="72" rx="2" fill="${GOLD}" fill-opacity=".25"/>
    <path d="M60 30A22 22 0 1 0 60 74A27 27 0 0 1 60 30Z" fill="${SOFT}" stroke="none"/><path d="M38 86H62"/>`),
  /* 3 The Empress */ () => g(`<circle cx="50" cy="36" r="16"/><path d="M50 52V84M38 70H62"/>
    <path d="M18 92V60M18 66l-6-6M18 72l6-6M18 78l-6-6M82 92V60M82 66l6-6M82 72l-6-6M82 78l6-6"/>${sparkle(50, 14, 5)}`),
  /* 4 The Emperor */ () => g(`<rect x="30" y="42" width="40" height="46" rx="3"/><path d="M30 46q-14-2-12-16q6-8 14 0"/><path d="M70 46q14-2 12-16q-6-8-14 0"/>
    <path d="M36 32 40 18 50 27 60 18 64 32Z" fill="${GOLD}" fill-opacity=".3"/><path d="M50 52v24M44 58a6 6 0 1 1 12 0c0 4-6 6-6 6s-6-2-6-6"/>`),
  /* 5 The Hierophant */ () => g(`<path d="M50 10V74M42 22H58M38 34H62M34 46H66"/><path d="M28 92 62 70M72 92 38 70"/><circle cx="64" cy="68" r="4"/><circle cx="36" cy="68" r="4"/>`),
  /* 6 The Lovers */ () => g(`<circle cx="50" cy="20" r="9"/><path d="${rays(50, 20, 12, 17, 12)}"/><circle cx="38" cy="62" r="17"/><circle cx="62" cy="62" r="17"/>
    <path d="M50 92c-8-6-14-10-14-16a7 7 0 0 1 14-2a7 7 0 0 1 14 2c0 6-6 10-14 16Z" fill="${SOFT}" stroke="none"/>`),
  /* 7 The Chariot */ () => g(`<path d="M22 28H78L72 42H28Z"/>${sparkle(36, 34, 3)}${sparkle(50, 34, 3)}${sparkle(64, 34, 3)}<rect x="30" y="42" width="40" height="28" rx="2"/>
    <circle cx="30" cy="80" r="10"/><circle cx="70" cy="80" r="10"/><path d="M30 74v12M24 80h12M70 74v12M64 80h12"/>`),
  /* 8 Strength */ () => g(`<path d="M38 18C38 12 47 12 50 18S62 24 62 18 53 12 50 18 38 24 38 18Z"/><circle cx="50" cy="62" r="15"/><path d="${rays(50, 62, 19, 28, 16)}"/>
    <circle cx="45" cy="59" r="1.5" fill="${GOLD}"/><circle cx="55" cy="59" r="1.5" fill="${GOLD}"/><path d="M46 67q4 3 8 0"/>`),
  /* 9 The Hermit */ () => g(`<path d="M50 10V24"/><path d="M38 28H62L68 38V66L62 76H38L32 66V38Z"/><path d="${starPath(50, 52, 12, 6, 0.55)}" fill="${SOFT}" stroke="none"/>
    <path d="M22 92 34 20" stroke-width="2.6"/>`),
  /* 10 Wheel of Fortune */ () => g(`<circle cx="50" cy="52" r="34"/><circle cx="50" cy="52" r="26"/><circle cx="50" cy="52" r="8" fill="${GOLD}" fill-opacity=".3"/><path d="${rays(50, 52, 8, 26, 8, 22.5)}"/>
    ${sparkle(50, 10, 5)}${sparkle(10, 52, 4)}${sparkle(90, 52, 4)}${sparkle(50, 94, 4)}`),
  /* 11 Justice */ () => g(`<path d="M50 14V86M22 28H78M36 86H64"/><path d="M22 28 12 54M22 28 32 54M78 28 68 54M78 28 88 54"/>
    <path d="M10 54Q22 66 34 54Z" fill="${GOLD}" fill-opacity=".25"/><path d="M66 54Q78 66 90 54Z" fill="${GOLD}" fill-opacity=".25"/><circle cx="50" cy="12" r="3" fill="${SOFT}"/>`),
  /* 12 The Hanged Man */ () => g(`<path d="M18 14H82M50 14V30"/><path d="M50 30V58M50 36 40 46M50 36 60 46M50 30 60 22"/><circle cx="50" cy="68" r="7"/>
    <circle cx="50" cy="68" r="14" stroke="${SOFT}" stroke-dasharray="2 4"/>`),
  /* 13 Death — chuyển hoá */ () => g(`<rect x="14" y="40" width="14" height="50"/><rect x="72" y="40" width="14" height="50"/><path d="M14 40v-6h4v6M24 40v-6h4v6M72 40v-6h4v6M82 40v-6h4v6"/>
    <path d="M32 90A18 18 0 0 1 68 90"/><path d="${rays(50, 90, 22, 30, 7, 195)}"/>
    <g fill="${SOFT}" stroke="none">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(50 + 6 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(28 + 6 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="5"/>`).join('')}</g><circle cx="50" cy="28" r="3" fill="${GOLD}"/>`),
  /* 14 Temperance */ () => g(`<path d="M18 26H40Q40 44 29 46Q18 44 18 26Z"/><path d="M29 46V54M22 56H36"/><path d="M60 56H82Q82 74 71 76Q60 74 60 56Z"/><path d="M71 76V84M64 86H78"/>
    <path d="M38 30Q58 26 66 56" stroke="${SOFT}" stroke-dasharray="3 3"/><path d="M42 92H58M38 14H62" stroke-width="1.6"/>`),
  /* 15 The Devil — nhận diện xiềng xích */ () => g(`<circle cx="50" cy="38" r="24"/><path d="${starPath(50, 40, 21, 5, 0.38, 90)}"/>
    <ellipse cx="38" cy="78" rx="6" ry="9"/><ellipse cx="50" cy="82" rx="6" ry="9"/><ellipse cx="62" cy="78" rx="6" ry="9"/>`),
  /* 16 The Tower */ () => g(`<path d="M38 90V34H62V90M34 90H66"/><path d="M36 34v-8h6v4h4v-4h8v4h4v-4h6v8"/><rect x="46" y="48" width="8" height="12" rx="4"/>
    <path d="M78 6 62 26H70L54 44" stroke="${SOFT}" stroke-width="2.6"/>${sparkle(24, 46, 3)}${sparkle(78, 58, 3)}${sparkle(20, 68, 2.5)}`),
  /* 17 The Star */ () => `<path d="${starPath(50, 40, 22, 8, 0.4)}" fill="${SOFT}"/>${[[18, 16], [82, 16], [14, 46], [86, 46], [26, 70], [74, 70], [50, 8]].map(([x, y]) => sparkle(x, y, 5)).join('')}
    ${g('<path d="M14 88q9-6 18 0t18 0 18 0 18 0"/><path d="M22 96q7-4 14 0t14 0 14 0 14 0" stroke-width="1.4"/>')}`,
  /* 18 The Moon */ () => g(`<path d="M62 12A27 27 0 1 0 62 66A32 32 0 0 1 62 12Z" fill="${SOFT}" fill-opacity=".9" stroke="none"/>
    <rect x="8" y="62" width="12" height="30"/><rect x="80" y="62" width="12" height="30"/><path d="M50 96Q38 86 52 78Q64 70 50 64"/><path d="M30 92q10-5 18 0" stroke-width="1.4"/>`),
  /* 19 The Sun */ () => `<circle cx="50" cy="44" r="18" fill="${SOFT}"/>${g(`<path d="${rays(50, 44, 24, 36, 16)}"/><path d="M12 90H88M20 90v-8M32 90v-8M44 90v-8M56 90v-8M68 90v-8M80 90v-8"/>`)}`,
  /* 20 Judgement */ () => g(`<path d="M18 36 58 50 74 40V68L58 58 18 48Z"/><path d="M74 40Q82 54 74 68"/><path d="${rays(30, 20, 6, 16, 9, 180)}"/>
    <path d="M14 90q8-10 18 0q8-10 18 0q8-10 18 0q8-10 18 0"/>`),
  /* 21 The World */ () => g(`<ellipse cx="50" cy="52" rx="24" ry="36"/><path d="${Array.from({ length: 14 }, (_, i) => {
    const a = (i * 360 / 14) * Math.PI / 180, x = 50 + 24 * Math.cos(a), y = 52 + 36 * Math.sin(a);
    return `M${x.toFixed(1)} ${y.toFixed(1)}l${(5 * Math.cos(a + 0.9)).toFixed(1)} ${(5 * Math.sin(a + 0.9)).toFixed(1)}`;
  }).join('')}"/><path d="M42 98 50 90 58 98M42 6 50 14 58 6" stroke-width="1.6"/>`) + [[12, 12], [88, 12], [12, 92], [88, 92]].map(([x, y]) => sparkle(x, y, 5)).join(''),
];

/* ———————————————— Biểu tượng 4 bộ (100×100) ———————————————— */
const SUIT_ART = {
  wands: () => g(`<path d="M32 90 68 12" stroke-width="9"/><path d="M32 90 68 12" stroke="#121A33" stroke-width="3"/>
    <path d="M58 34q14-6 16 6q-12 6-16-6ZM44 60q-14-2-16 8q12 4 16-8Z" stroke-width="2" fill="${GOLD}" fill-opacity=".55"/><circle cx="68" cy="12" r="5" fill="${SOFT}" stroke="none"/>`),
  cups: () => g(`<path d="M26 18H74Q74 54 50 60Q26 54 26 18Z" fill="${GOLD}" fill-opacity=".18"/><path d="M50 60V80M34 86H66M38 80H62"/><path d="M32 28q18 6 36 0" stroke-width="1.4"/>`),
  swords: () => g(`<path d="M50 6 57 20V66H43V20Z" fill="${GOLD}" fill-opacity=".18"/><path d="M30 66H70M50 66V86"/><circle cx="50" cy="90" r="4"/><path d="M50 22V60" stroke-width="1.2"/>`),
  pentacles: () => g(`<circle cx="50" cy="50" r="34" fill="${GOLD}" fill-opacity=".12"/><circle cx="50" cy="50" r="28"/><path d="${starPath(50, 51, 24, 5, 0.38)}"/>`),
};

/* Biểu tượng hoàng gia cho lá Page/Knight/Queen/King */
const COURT_ART = {
  11: () => `<path d="${starPath(50, 50, 30, 4, 0.3)}" fill="${SOFT}"/>`, // Page — ngôi sao nhỏ của sự tò mò
  12: () => g(`<path d="M30 88 36 56Q36 32 56 22L62 12 66 24Q82 32 80 50L68 48 58 58 62 88Z"/><circle cx="62" cy="34" r="2" fill="${GOLD}"/>`), // Knight — đầu ngựa
  13: () => g(`<path d="M22 70 28 32 42 52 50 24 58 52 72 32 78 70Z" fill="${GOLD}" fill-opacity=".2"/><path d="M22 80H78"/><circle cx="50" cy="20" r="4" fill="${SOFT}"/>`), // Queen
  14: () => g(`<path d="M18 72 22 30 36 50 50 22 64 50 78 30 82 72Z" fill="${GOLD}" fill-opacity=".28"/><path d="M18 82H82M50 6V18M44 12H56"/>`), // King
};

const PIPS = {
  1: [[0.5, 0.5]],
  2: [[0.5, 0.18], [0.5, 0.82]],
  3: [[0.5, 0.14], [0.5, 0.5], [0.5, 0.86]],
  4: [[0.24, 0.2], [0.76, 0.2], [0.24, 0.8], [0.76, 0.8]],
  5: [[0.24, 0.16], [0.76, 0.16], [0.5, 0.5], [0.24, 0.84], [0.76, 0.84]],
  6: [[0.24, 0.14], [0.76, 0.14], [0.24, 0.5], [0.76, 0.5], [0.24, 0.86], [0.76, 0.86]],
  7: [[0.24, 0.12], [0.76, 0.12], [0.5, 0.31], [0.24, 0.5], [0.76, 0.5], [0.24, 0.88], [0.76, 0.88]],
  8: [[0.24, 0.12], [0.76, 0.12], [0.5, 0.31], [0.24, 0.5], [0.76, 0.5], [0.5, 0.69], [0.24, 0.88], [0.76, 0.88]],
  9: [[0.24, 0.1], [0.76, 0.1], [0.24, 0.36], [0.76, 0.36], [0.5, 0.5], [0.24, 0.64], [0.76, 0.64], [0.24, 0.9], [0.76, 0.9]],
  10: [[0.24, 0.1], [0.76, 0.1], [0.5, 0.23], [0.24, 0.36], [0.76, 0.36], [0.24, 0.64], [0.76, 0.64], [0.5, 0.77], [0.24, 0.9], [0.76, 0.9]],
};

/* Vùng minh hoạ trên lá 200×340 */
const ART = { x: 36, y: 58, w: 128, h: 196 };
const place = (inner, cx, cy, size) => `<g transform="translate(${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)}) scale(${(size / 100).toFixed(3)})">${inner}</g>`;

function artFor(card, halo) {
  const cx = ART.x + ART.w / 2, cy = ART.y + ART.h / 2;
  if (card.arcana === 'major') {
    return `<circle cx="${cx}" cy="${cy}" r="70" fill="url(#${halo})"/>${place(MAJOR_ART[card.number](), cx, cy, 136)}`;
  }
  const suit = SUIT_ART[card.suit];
  if (card.number >= 11) {
    return `<circle cx="${cx}" cy="${cy}" r="70" fill="url(#${halo})"/>${place(COURT_ART[card.number](), cx, cy - 46, 70)}${place(suit(), cx, cy + 34, 92)}`;
  }
  if (card.number === 1) {
    return `<circle cx="${cx}" cy="${cy}" r="72" fill="url(#${halo})"/>${g(`<path d="${rays(cx, cy, 58, 70, 24)}" stroke-width="1.2" opacity=".6"/>`)}${place(suit(), cx, cy, 104)}`;
  }
  const size = card.number <= 3 ? 52 : card.number <= 6 ? 42 : 34;
  return PIPS[card.number].map(([px, py]) => place(suit(), ART.x + px * ART.w, ART.y + py * ART.h, size)).join('');
}

const corners = () => [[20, 20], [180, 20], [20, 320], [180, 320]].map(([x, y]) => sparkle(x, y, 4)).join('');

function frame(id) {
  return `<defs>
      <linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D2650"/><stop offset=".55" stop-color="#121A33"/><stop offset="1" stop-color="#0B1020"/></linearGradient>
      <radialGradient id="${id}-halo"><stop offset="0" stop-color="${SOFT}" stop-opacity=".22"/><stop offset="1" stop-color="${SOFT}" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="200" height="340" rx="14" fill="url(#${id}-bg)"/>
    <rect x="7" y="7" width="186" height="326" rx="10" fill="none" stroke="${GOLD}" stroke-width="1.6"/>
    <rect x="13" y="13" width="174" height="314" rx="7" fill="none" stroke="${GOLD}" stroke-opacity=".45" stroke-width=".8"/>`;
}

/** SVG mặt trước của một lá bài */
let uid = 0;
export function cardFaceSVG(card) {
  const id = `tf${++uid}`;
  const top = card.arcana === 'major' ? ROMAN[card.number] : (RANK[card.number] || ROMAN[card.number]);
  const suitVi = { wands: 'Gậy', cups: 'Cốc', swords: 'Kiếm', pentacles: 'Tiền' }[card.suit] || '';
  return `<svg viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(`${card.nameEn} — ${card.nameVi}`)}">
    ${frame(id)}
    ${corners()}
    <text x="100" y="40" text-anchor="middle" fill="${SOFT}" font-family="Cormorant Garamond, serif" font-size="${top.length > 4 ? 15 : 20}" font-weight="600" letter-spacing="2">${esc(top)}</text>
    ${card.arcana === 'minor' ? `<text x="100" y="54" text-anchor="middle" fill="${GOLD}" fill-opacity=".7" font-family="Be Vietnam Pro, sans-serif" font-size="7" letter-spacing="2.5">${esc(suitVi.toUpperCase())}</text>` : ''}
    ${artFor(card, `${id}-halo`)}
    <path d="M40 276H160" stroke="${GOLD}" stroke-opacity=".5" stroke-width=".8"/>
    <text x="100" y="298" text-anchor="middle" fill="#F6EEDD" font-family="Cormorant Garamond, serif" font-size="${card.nameVi.length > 15 ? 14 : 16}" font-weight="600">${esc(card.nameVi)}</text>
    <text x="100" y="315" text-anchor="middle" fill="${GOLD}" fill-opacity=".8" font-family="Be Vietnam Pro, sans-serif" font-size="7.2" letter-spacing="1.8">${esc(card.nameEn.toUpperCase())}</text>
  </svg>`;
}

/** SVG lưng bài: trăng lưỡi liềm + chòm sao Cự Giải */
export function cardBackSVG() {
  const id = `tb${++uid}`;
  const stars = [[100, 112], [102, 150], [108, 172], [132, 212], [78, 206]];
  const lines = [[0, 1], [1, 2], [2, 3], [2, 4]];
  const dust = Array.from({ length: 34 }, (_, i) => {
    const x = 22 + ((i * 53) % 156), y = 24 + ((i * 89) % 292);
    return `<circle cx="${x}" cy="${y}" r="${i % 5 === 0 ? 1.1 : 0.6}" fill="#EDE9E3" opacity="${i % 3 ? 0.35 : 0.7}"/>`;
  }).join('');
  return `<svg viewBox="0 0 200 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${frame(id)}
    ${dust}
    <rect x="22" y="22" width="156" height="296" rx="5" fill="none" stroke="${GOLD}" stroke-opacity=".25" stroke-dasharray="1 5"/>
    <circle cx="100" cy="170" r="74" fill="url(#${id}-halo)"/>
    <circle cx="100" cy="170" r="62" fill="none" stroke="${GOLD}" stroke-opacity=".35" stroke-width=".8"/>
    <g stroke="${GOLD}" stroke-opacity=".5" stroke-width=".8">${rays(100, 170, 66, 74, 36)}</g>
    <path d="M114 118A54 54 0 1 0 114 222A42 42 0 1 1 114 118Z" fill="${SOFT}" fill-opacity=".92"/>
    <g stroke="${SOFT}" stroke-width="1" stroke-opacity=".85">${lines.map(([a, b]) => `<line x1="${stars[a][0]}" y1="${stars[a][1]}" x2="${stars[b][0]}" y2="${stars[b][1]}"/>`).join('')}</g>
    ${stars.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#FFF6DD"/><circle cx="${x}" cy="${y}" r="6" fill="${SOFT}" opacity=".25"/>`).join('')}
    ${sparkle(100, 46, 6)}${sparkle(100, 294, 6)}${corners()}
    <text x="100" y="314" text-anchor="middle" fill="${GOLD}" fill-opacity=".75" font-family="Be Vietnam Pro, sans-serif" font-size="7" letter-spacing="4">HUB · MOONLIT</text>
  </svg>`;
}
