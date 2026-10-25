/* Dựng toàn bộ nội dung từ CONFIG vào khung HTML */
import { $, h, svg, nfc, isPending, hues, mediaWithFallback, loadImage } from './utils.js';
import { ICONS } from './icons.js';

const CJK_RE = /[぀-ヿ㐀-鿿가-힯]/;
const hasCJK = (s) => CJK_RE.test(s || '');

export function formatBirthday(iso) {
  const [y, m, d] = String(iso).split('-');
  return `${d}.${m}.${y}`;
}

/* ———————————————————— Socials ———————————————————— */
export function socialLinks(socials, { small = false } = {}) {
  return socials.map((s) => {
    const icon = svg(ICONS[s.id] || ICONS.external);
    let a;
    if (s.email) {
      a = h('a', { href: `mailto:${s.email}`, 'data-tip': s.label, 'aria-label': `${s.label}: ${s.email} (tự copy địa chỉ)`, 'data-email': s.email, 'data-magnetic': small ? null : '' }, icon);
    } else {
      a = h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', 'data-tip': s.label, 'aria-label': `${s.label} (mở tab mới)`, 'data-magnetic': small ? null : '' }, icon);
    }
    return h('li', {}, a);
  });
}

/* ———————————————————— Hero ———————————————————— */
function renderHero(cfg) {
  const p = cfg.profile;
  $('#hero-name').textContent = nfc(p.name);
  $('#hero-name').setAttribute('aria-label', nfc(p.name));

  const meta = $('#hero-meta');
  meta.replaceChildren(
    h('li', {},
      h('span', { class: 'zodiac', id: 'zodiac' },
        h('button', { class: 'zodiac__btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'zodiac-card' },
          h('span', { class: 'zodiac__glyph' }, svg(ICONS.cancer)), h('span', { class: 'sr-only', text: `${p.zodiac.symbol} ` }), p.zodiac.name),
        h('span', { class: 'zodiac__card', id: 'zodiac-card', role: 'tooltip' },
          h('strong', { text: p.zodiac.name }),
          `Cung ${p.zodiac.element} · Chủ quản: ${p.zodiac.ruler}`))),
    h('li', {}, h('time', { datetime: p.birthday, text: formatBirthday(p.birthday) })),
    h('li', { text: p.job }),
  );

  const av = $('#hero-avatar');
  if (p.avatar) {
    loadImage(p.avatar).then((ok) => {
      if (!ok) return;
      const img = h('img', { alt: `Ảnh đại diện của ${p.name}`, width: 368, height: 368, decoding: 'async', src: p.avatar });
      img.addEventListener('load', () => { img.classList.add('is-loaded'); av.querySelector('.avatar__fallback')?.setAttribute('hidden', ''); }, { once: true });
      av.append(img);
    });
  }
  $('#hero-socials').replaceChildren(...socialLinks(cfg.socials));
}

/* ———————————————————— Quote ———————————————————— */
function renderQuote(cfg) {
  $('#quote-text').textContent = nfc(cfg.profile.quote);
  $('#quote-sign').textContent = `— ${cfg.profile.nickname}`;
}

/* ———————————————————— Gallery ———————————————————— */
function renderGallery(cfg) {
  const grid = $('#gallery-grid');
  const items = cfg.gallery || [];
  if (!items.length) {
    const labels = ['Bình minh', 'Phố cũ', 'Mặt nước', 'Những chuyến đi', 'Đêm trăng'];
    grid.replaceChildren(...labels.map((l) => {
      const ph = h('div', { class: 'bento__ph' }, svg(ICONS.image), h('span', { text: l }));
      for (const [k, v] of Object.entries(hues(l))) ph.style.setProperty(k, v);
      return h('figure', { class: 'bento__item is-empty', 'aria-hidden': 'true' }, ph);
    }));
    return;
  }
  grid.replaceChildren(...items.map((it, i) => {
    const img = h('img', { src: it.src, alt: it.alt || `Ảnh ${i + 1}`, loading: 'lazy', decoding: 'async', width: it.width || 1200, height: it.height || 1500 });
    const btn = h('button', { class: 'bento__btn', type: 'button', 'data-index': i, 'aria-label': `Xem ảnh lớn: ${it.alt || `ảnh ${i + 1}`}` },
      img, it.caption ? h('span', { class: 'bento__cap', text: it.caption }) : null);
    return h('figure', { class: 'bento__item' }, btn);
  }));
}

/* ———————————————————— Favorites ———————————————————— */
const TABS = [
  { id: 'artists', label: 'Nghệ sĩ', per: 4 },
  { id: 'music', label: 'Âm nhạc', per: 3 },
  { id: 'movies', label: 'Phim', per: 4 },
  { id: 'languages', label: 'Ngôn ngữ', per: 3 },
];
const LANG_PATTERN = ['en', 'fr', 'zh', 'ko'];

function linkLabel(url) {
  if (/spotify\./i.test(url)) return 'Spotify';
  if (/youtu\.?be/i.test(url)) return 'YouTube';
  return 'Nghe';
}

function artistCard(a) {
  return h('article', { class: 'fcard fcard--artist' },
    mediaWithFallback({ src: a.img, alt: `Chân dung ${a.name}`, name: a.name, className: 'fcard__media', width: 800, height: 1000 }),
    h('div', { class: 'fcard__body' },
      h('h4', { class: 'fcard__title', text: a.name }),
      h('p', { class: 'fcard__sub', text: a.sub })));
}

function musicCard(m) {
  const card = h('article', { class: 'fcard fcard--music' });
  const { '--h1': h1 } = hues(m.title);
  const vinyl = h('div', { class: 'vinyl', 'aria-hidden': 'true' }, h('div', { class: 'vinyl__disc', style: { '--label': `hsl(${h1} 60% 62%)` } }));
  const sleeve = mediaWithFallback({ src: m.img, alt: `Ảnh bìa ${m.title}`, name: m.title, className: 'sleeve', width: 600, height: 600 });
  const toggle = h('button', { class: 'vinyl-toggle', type: 'button', 'aria-pressed': 'false', 'aria-label': `Xem đĩa than: ${m.title}` });
  toggle.addEventListener('click', () => {
    const open = card.classList.toggle('is-open');
    toggle.setAttribute('aria-pressed', String(open));
  });
  const body = h('div', { class: 'fcard__body' },
    h('div', {}, h('h4', { class: 'fcard__title', text: m.title }), h('p', { class: 'fcard__sub', text: m.artist })),
    m.link ? h('a', { class: 'fcard__link', href: m.link, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Nghe ${m.title} trên ${linkLabel(m.link)} (mở tab mới)` },
      linkLabel(m.link), svg(ICONS.external)) : null);
  card.append(h('div', { class: 'vinyl-wrap' }, vinyl, sleeve), toggle, body);
  return card;
}

function movieCard(mv) {
  const cjk = hasCJK(mv.title);
  const showVi = mv.vi && nfc(mv.vi) !== nfc(mv.title);
  const tilt = h('div', { class: 'tilt', 'data-tilt': '' },
    h('span', { class: `fcard__badge${mv.type === 'Series' ? ' fcard__badge--series' : ''}`, text: mv.type }),
    mediaWithFallback({ src: mv.img, alt: `Poster ${showVi ? mv.vi : mv.title}`, name: mv.title, className: 'fcard__media', width: 800, height: 1200, cjk }),
    h('div', { class: 'fcard__body' },
      h('h4', { class: `fcard__title${cjk ? ' cjk' : ''}`, lang: cjk ? 'zh' : null, text: mv.title }),
      showVi ? h('p', { class: 'fcard__vi', text: mv.vi }) : null),
    h('span', { class: 'glare', 'aria-hidden': 'true' }));
  return h('article', { class: 'fcard fcard--movie' }, tilt);
}

function langCard(l, i) {
  const cjk = hasCJK(l.greeting);
  const lang = ['en', 'fr', 'zh', 'ko'][i] || null;
  return h('article', { class: 'fcard fcard--lang', 'data-pattern': LANG_PATTERN[i % 4] },
    h('p', { class: `lang__big${cjk ? ' cjk' : ''}`, lang, 'data-greeting': l.greeting },
      h('span', { class: 'lang__text', text: l.greeting }), h('span', { class: 'lang__caret', 'aria-hidden': 'true' })),
    h('div', {},
      l.romanization ? h('p', { class: 'lang__roman', text: l.romanization }) : null,
      h('p', { class: 'lang__name' }, h('span', { class: hasCJK(l.name) ? 'cjk' : '', lang, text: l.name }), h('span', { 'aria-hidden': 'true', text: `0${i + 1}` }))));
}

function carousel(id, items, render, per) {
  const slides = items.map((it, i) => h('div', { class: 'carousel__slide', role: 'group', 'aria-roledescription': 'thẻ', 'aria-label': `${i + 1} / ${items.length}` }, render(it, i)));
  const nav = (dir) => h('button', { class: `carousel__nav carousel__nav--${dir}`, type: 'button', 'aria-label': dir === 'prev' ? 'Thẻ trước' : 'Thẻ kế tiếp', 'data-magnetic': '' },
    svg(ICONS[dir]),
    dir === 'next' ? svg('<svg class="ring" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="29" pathLength="1"/></svg>') : null);
  return h('div', { class: `carousel carousel--${per}`, 'data-carousel': id },
    h('div', { class: 'carousel__viewport' },
      nav('prev'),
      h('div', { class: 'carousel__track', tabindex: '0', 'data-lenis-prevent-horizontal': '', 'aria-label': 'Dùng phím mũi tên trái/phải để chuyển thẻ' }, slides),
      nav('next')),
    h('div', { class: 'carousel__foot' },
      h('p', { class: 'carousel__count', 'aria-live': 'polite' }, h('b', { text: '01' }), ` / ${String(items.length).padStart(2, '0')}`),
      h('div', { class: 'carousel__progress', 'aria-hidden': 'true' }, h('span')),
      h('div', { class: 'carousel__dots' }, items.map((_, i) => h('button', { type: 'button', 'aria-label': `Tới thẻ ${i + 1}`, 'data-dot': i })))));
}

function renderFavorites(cfg) {
  const f = cfg.favorites;
  const renders = { artists: artistCard, music: musicCard, movies: movieCard, languages: langCard };
  const tabs = $('#fav-tabs');
  const panels = $('#fav-panels');
  TABS.forEach((t, i) => {
    tabs.append(h('button', { type: 'button', role: 'tab', id: `tab-${t.id}`, 'aria-controls': `panel-${t.id}`, 'aria-selected': i === 0 ? 'true' : 'false', tabindex: i === 0 ? '0' : '-1', text: t.label }));
    panels.append(h('div', { class: 'fav-panel', role: 'tabpanel', id: `panel-${t.id}`, 'aria-labelledby': `tab-${t.id}`, hidden: i !== 0, tabindex: '-1' },
      h('h3', { class: 'fav-panel__title', text: t.label }),
      carousel(t.id, f[t.id] || [], renders[t.id], t.per)));
  });
}

/* ———————————————————— Contact card ———————————————————— */
const digits = (p) => String(p).replace(/[^\d+]/g, '');
const zaloUrl = (p) => `https://zalo.me/${digits(p).replace(/^\+/, '')}`;

function actionBtn({ href, icon, label, cls = 'btn--ghost', pending, onClick, newTab }) {
  if (pending) {
    return h('button', { class: `btn ${cls}`, type: 'button', disabled: true, 'aria-disabled': 'true', title: `${label} — đang cập nhật` },
      svg(ICONS[icon]), h('span', { text: 'Đang cập nhật' }), h('span', { class: 'sr-only', text: ` (${label})` }));
  }
  if (onClick) return h('button', { class: `btn ${cls}`, type: 'button', onclick: onClick, 'data-magnetic': '' }, svg(ICONS[icon]), label);
  return h('a', { class: `btn ${cls}`, href, 'data-magnetic': '', ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }, svg(ICONS[icon]), label);
}

function contactCard(root, { title, hello, name, phone, zalo, details, primary, onCopy }) {
  const phonePending = isPending(phone);
  const zaloValue = isPending(zalo) ? phone : zalo;
  const zaloPending = isPending(zaloValue);
  const left = h('div', {},
    hello ? h('p', { class: 'contact-card__hello', text: hello }) : null,
    h('h3', { text: title }),
    h('p', { class: 'contact-card__person' }, 'Người phụ trách',
      h('b', { class: isPending(name) ? 'is-pending-text' : '', text: isPending(name) ? 'Đang cập nhật' : name })),
    details?.length ? h('dl', { class: 'contact-card__details' }, details.map((d) =>
      h('div', {}, h('dt', { text: d.label }), h('dd', { class: isPending(d.value) ? 'is-pending-text' : '', text: isPending(d.value) ? 'Đang cập nhật' : d.value })))) : null);
  const btns = [];
  if (primary === 'zalo') btns.push(actionBtn({ href: zaloPending ? '' : zaloUrl(zaloValue), icon: 'zalo', label: 'Gửi link sản phẩm qua Zalo', cls: 'btn--order btn--lg', pending: zaloPending, newTab: true }));
  btns.push(actionBtn({ href: phonePending ? '' : `tel:${digits(phone)}`, icon: 'phone', label: 'Gọi ngay', cls: primary === 'call' ? 'btn--lantern' : 'btn--ghost', pending: phonePending }));
  if (primary !== 'zalo') btns.push(actionBtn({ href: zaloPending ? '' : zaloUrl(zaloValue), icon: 'zalo', label: 'Nhắn Zalo', pending: zaloPending, newTab: true }));
  btns.push(actionBtn({ icon: 'copy', label: 'Copy số', pending: phonePending, onClick: () => onCopy?.(phone) }));
  const right = h('div', { style: { display: 'grid', gap: '1rem', position: 'relative', zIndex: 1 } },
    h('p', { class: `contact-card__phone${phonePending ? ' is-pending' : ''}`, text: phonePending ? 'Số điện thoại đang cập nhật' : phone }),
    h('div', { class: 'contact-card__actions' }, btns));
  root.replaceChildren(left, right);
}

/* ———————————————————— Thuyền Rồng ———————————————————— */
function waveD(y, amp, wl, width = 1600) {
  let d = `M0 ${y}`;
  for (let x = 0; x < width; x += wl) {
    d += ` q ${wl / 4} ${-amp} ${wl / 2} 0 t ${wl / 2} 0`;
  }
  return `${d} V 560 H 0 Z`;
}

export function boatSceneSVG() {
  const stars = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 137.5) % 800, y = 20 + ((i * 71) % 220);
    return `<circle class="${i % 3 === 0 ? 'scene__twinkle' : ''}" style="animation-delay:${(i % 7) * -.4}s" cx="${x.toFixed(0)}" cy="${y}" r="${i % 4 === 0 ? 1.6 : 1}" fill="#F6EEDD" opacity="${i % 4 === 0 ? .9 : .5}"/>`;
  }).join('');
  // Cầu Trường Tiền: 6 nhịp vòm "răng lược"
  let bridge = '';
  const span = 800 / 6;
  for (let i = 0; i < 6; i++) {
    const x0 = i * span, x1 = x0 + span, mid = (x0 + x1) / 2;
    bridge += `<path d="M${x0 + 4} 300 Q ${mid} 252 ${x1 - 4} 300" fill="none" stroke="#120C26" stroke-width="4"/>`;
    for (let k = 1; k < 8; k++) {
      const x = x0 + 4 + ((span - 8) * k) / 8;
      const t = (x - (x0 + 4)) / (span - 8);
      const yTop = 300 - 4 * 24 * t * (1 - t) * 2;
      bridge += `<line x1="${x.toFixed(1)}" y1="300" x2="${x.toFixed(1)}" y2="${yTop.toFixed(1)}" stroke="#120C26" stroke-width="1.6"/>`;
    }
    bridge += `<rect x="${x1 - 5}" y="298" width="10" height="16" fill="#120C26"/>`;
    bridge += `<circle cx="${mid}" cy="296" r="1.6" fill="#F2B45A" class="scene__twinkle" style="animation-delay:${-i * .5}s"/>`;
  }
  const lantern = (x, d, delay) => `
    <g class="scene__lantern" style="--d:${d}s;animation-delay:${delay}s">
      <line x1="${x}" y1="342" x2="${x}" y2="352" stroke="#E8C27A" stroke-width="1.2"/>
      <circle class="scene__glow" cx="${x}" cy="362" r="17" fill="url(#lanternGlow)"/>
      <ellipse cx="${x}" cy="362" rx="7" ry="9.5" fill="#F2B45A"/>
      <path d="M${x - 7} 362 h14" stroke="#C26A2A" stroke-width=".8"/>
      <rect x="${x - 3.5}" y="351" width="7" height="2.5" rx="1" fill="#8E3B1E"/>
      <rect x="${x - 3.5}" y="370.5" width="7" height="2.5" rx="1" fill="#8E3B1E"/>
      <line x1="${x}" y1="373" x2="${x}" y2="380" stroke="#C26A2A" stroke-width="1"/>
    </g>`;
  return `
<svg viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Minh hoạ thuyền rồng trên sông Hương dưới trăng">
  <defs>
    <radialGradient id="lanternGlow"><stop offset="0" stop-color="#FFD58A" stop-opacity=".9"/><stop offset="1" stop-color="#F2B45A" stop-opacity="0"/></radialGradient>
    <radialGradient id="moonGlow"><stop offset="0" stop-color="#FFF6E0" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6E0" stop-opacity="0"/></radialGradient>
    <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9B35C"/><stop offset="1" stop-color="#8E5A24"/></linearGradient>
    <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3CB7A"/><stop offset="1" stop-color="#B27A31"/></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D2152"/><stop offset="1" stop-color="#120D28"/></linearGradient>
  </defs>
  <g>${stars}</g>
  <circle cx="640" cy="110" r="110" fill="url(#moonGlow)"/>
  <circle cx="640" cy="110" r="44" fill="#F6EEDD"/>
  <circle cx="626" cy="100" r="7" fill="#E5DAC4" opacity=".6"/><circle cx="652" cy="124" r="5" fill="#E5DAC4" opacity=".5"/>
  <path d="M0 300 H800 V320 H0z" fill="#1B1338" opacity=".9"/>
  <g opacity=".85">${bridge}<rect x="0" y="298" width="800" height="5" fill="#120C26"/></g>
  <rect x="0" y="312" width="800" height="240" fill="url(#water)"/>
  <g fill="#F6EEDD">
    <rect class="scene__reflect" x="610" y="330" width="60" height="2" rx="1" opacity=".6"/>
    <rect class="scene__reflect" style="animation-delay:-1s" x="596" y="344" width="88" height="2" rx="1" opacity=".4"/>
    <rect class="scene__reflect" style="animation-delay:-2s" x="618" y="360" width="44" height="2" rx="1" opacity=".35"/>
    <rect class="scene__reflect" style="animation-delay:-3s" x="590" y="378" width="100" height="1.6" rx="1" opacity=".25"/>
  </g>
  <g class="scene__layer" data-wave="back"><path class="scene__wave" style="--d:16s" d="${waveD(338, 5, 80)}" fill="#3A2A63" opacity=".55"/></g>
  <g class="scene__boat">
    <ellipse cx="400" cy="432" rx="210" ry="10" fill="#F2B45A" opacity=".16"/>
    <path d="M205 382 C 168 356, 172 318, 198 303 C 210 296, 230 300, 234 311 C 237 320, 229 326, 219 323 C 209 332, 214 354, 236 380 Z" fill="url(#hull)"/>
    <path d="M200 304 l -9 -10 M206 300 l -4 -13 M214 299 l 2 -13 M222 301 l 7 -10" stroke="#E9B35C" stroke-width="2" stroke-linecap="round"/>
    <circle cx="214" cy="311" r="2.4" fill="#1B1338"/><path d="M234 313 q 10 2 14 -2" stroke="#E9B35C" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M596 382 C 626 362, 632 330, 614 310 C 642 322, 650 360, 602 394 Z" fill="url(#hull)"/>
    <path d="M300 342 h200 v42 H300z" fill="#4A2A6B"/>
    <g fill="#F2B45A" opacity=".85">
      <path d="M318 384 v-22 a9 9 0 0 1 18 0 v22z"/><path d="M352 384 v-22 a9 9 0 0 1 18 0 v22z"/>
      <path d="M430 384 v-22 a9 9 0 0 1 18 0 v22z"/><path d="M464 384 v-22 a9 9 0 0 1 18 0 v22z"/>
    </g>
    <path d="M390 384 v-30 h20 v30z" fill="#2E1A47"/>
    <path d="M282 344 L 518 344 L 500 326 L 300 326 Z" fill="url(#roof)"/>
    <path d="M282 344 q -10 -2 -12 -12 M518 344 q 10 -2 12 -12" stroke="#F3CB7A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M322 326 L 478 326 L 462 310 L 338 310 Z" fill="url(#roof)"/>
    <path d="M322 326 q -8 -2 -10 -10 M478 326 q 8 -2 10 -10" stroke="#F3CB7A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="400" cy="304" r="4" fill="#F3CB7A"/>
    <path d="M200 380 C 260 412, 540 412, 600 380 L 590 398 C 520 428, 280 428, 212 398 Z" fill="url(#hull)"/>
    <path d="M206 386 C 270 414, 530 414, 594 386" stroke="#8E3B1E" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M230 398 C 300 418, 500 418, 570 398" stroke="#F3CB7A" stroke-width="1.2" fill="none" stroke-dasharray="2 6" opacity=".7"/>
    ${lantern(300, 3.4, 0)}${lantern(362, 3.9, -.8)}${lantern(438, 3.6, -1.6)}${lantern(500, 4.1, -.4)}
  </g>
  <g class="scene__layer" data-wave="mid"><path class="scene__wave" style="--d:11s" d="${waveD(410, 6, 100)}" fill="#2A1D4E" opacity=".9"/></g>
  <g class="scene__layer" data-wave="front"><path class="scene__wave" style="--d:8s" d="${waveD(440, 8, 160)}" fill="#1B1338"/>
    <path class="scene__wave" style="--d:8s" d="${waveD(440, 8, 160).replace(/ V 560 H 0 Z$/, '')}" fill="none" stroke="#9C7FCB" stroke-opacity=".35" stroke-width="1.2"/></g>
</svg>`;
}

function renderBoat(cfg, ctx) {
  const b = cfg.services.dragonBoat;
  $('#boat-title').textContent = b.title;
  $('#boat-tagline').textContent = b.tagline || '';
  $('#boat-scene').append(svg(boatSceneSVG()));
  $('#boat-cards').replaceChildren(...b.items.map((raw, i) => {
    const it = typeof raw === 'string' ? { title: raw } : raw;
    return h('li', {}, h('article', { class: 'scard', 'data-tilt': '' },
      h('span', { class: 'scard__num', 'aria-hidden': 'true', text: `0${i + 1}` }),
      h('div', { class: 'scard__icon' }, svg(ICONS[it.icon] || ICONS.cruise)),
      h('h3', { text: it.title }),
      it.desc ? h('p', { text: it.desc }) : null,
      h('span', { class: 'glare', 'aria-hidden': 'true' })));
  }));
  if (b.photos?.length) {
    const box = $('#boat-photos');
    box.hidden = false;
    box.replaceChildren(...b.photos.map((p) => h('img', { src: p.src, alt: p.alt || 'Ảnh thuyền rồng', loading: 'lazy', decoding: 'async', width: 800, height: 600 })));
  }
  contactCard($('#boat-contact'), {
    title: 'Đặt thuyền & hỏi thông tin', hello: 'Ghé Huế thì nhắn tụi mình nha!',
    name: b.contactName, phone: b.phone, zalo: b.zalo, details: b.details, primary: 'call', onCopy: ctx.copyPhone,
  });
}

/* ———————————————————— Order ———————————————————— */
function renderOrder(cfg, ctx) {
  const o = cfg.services.order;
  $('#order-title').textContent = o.title;
  $('#order-desc').textContent = o.description || '';
  $('#order-platforms').replaceChildren(...o.platforms.map((p) => h('li', { text: p })));
  $('#order-cats').replaceChildren(...(o.categories || []).map((c) => h('li', {}, h('div', { class: 'cat' }, svg(ICONS[c.icon] || ICONS.search), h('span', { text: c.title })))));
  const steps = $('#order-steps');
  steps.append(...(o.steps || []).map((s, i) => h('li', { class: 'step' }, h('span', { class: 'step__dot', 'aria-hidden': 'true', text: i + 1 }), h('p', {}, h('span', { class: 'sr-only', text: `Bước ${i + 1}: ` }), s))));
  steps.after(h('p', { class: 'order__note', text: 'Quy trình tham khảo — chi tiết có thể thay đổi tuỳ đơn hàng, vui lòng trao đổi trực tiếp.' }));
  $('#order-whys').replaceChildren(...(o.whys || []).map((w) => h('li', { class: 'why' }, svg(ICONS.spark), h('b', { text: w.title }), h('span', { text: w.desc }))));
  $('#order-faq').replaceChildren(...(o.faq || []).map((f, i) => {
    const id = `faq-${i}`;
    return h('div', { class: 'faq__item' },
      h('h4', {}, h('button', { class: 'faq__q', type: 'button', id: `${id}-q`, 'aria-expanded': 'false', 'aria-controls': `${id}-a` },
        h('span', { text: f.q }), h('span', { class: 'faq__icon', 'aria-hidden': 'true' }))),
      h('div', { class: 'faq__a', id: `${id}-a`, role: 'region', 'aria-labelledby': `${id}-q` },
        h('div', {}, h('p', { class: isPending(f.a) ? 'is-pending-text' : '', text: isPending(f.a) ? 'Đang cập nhật — bạn nhắn Zalo để được tư vấn trực tiếp nhé.' : f.a }))));
  }));
  contactCard($('#order-contact'), {
    title: 'Bắt đầu một đơn hàng', name: o.contactName, phone: o.phone, zalo: o.zalo, primary: 'zalo', onCopy: ctx.copyPhone,
  });
}

/* ———————————————————— Footer ———————————————————— */
function renderFooter(cfg) {
  $('#footer-socials').replaceChildren(...socialLinks(cfg.socials, { small: true }));
  $('#year').textContent = new Date().getFullYear();
  const pl = cfg.music?.playlist || [];
  const credit = $('#music-credit');
  if (!pl.length) { credit.hidden = true; return; }
  credit.replaceChildren('Nhạc nền: ', ...pl.flatMap((t, i) => [
    i ? ' · ' : '',
    `“${t.title}” — ${t.artist}`,
    t.source ? ' (' : '',
    t.source ? (t.sourceUrl ? h('a', { href: t.sourceUrl, target: '_blank', rel: 'noopener noreferrer', text: t.source }) : t.source) : '',
    t.source ? ')' : '',
  ]));
}

/* ———————————————————— SEO đồng bộ từ config ———————————————————— */
function syncMeta(cfg) {
  const url = cfg.site.url;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  const ld = document.getElementById('ld-person');
  if (ld) {
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Person',
      name: cfg.profile.name, alternateName: cfg.profile.nickname, jobTitle: cfg.profile.job,
      birthDate: cfg.profile.birthday, url, image: new URL(cfg.profile.avatar, url).href,
      sameAs: cfg.socials.filter((s) => s.url).map((s) => s.url),
    });
  }
}

export function renderAll(cfg, ctx) {
  renderHero(cfg);
  renderQuote(cfg);
  renderGallery(cfg);
  renderFavorites(cfg);
  renderBoat(cfg, ctx);
  renderOrder(cfg, ctx);
  renderFooter(cfg);
  syncMeta(cfg);
}
