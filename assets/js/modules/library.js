/* HUB Knowledge Library — "Tủ sách giữa trời sao"
 * Desktop: kệ sách 3D (gáy sách) · Mobile: carousel bìa sách · Reduced-motion: lưới bìa, chỉ fade. */
import { $, $$, h, svg, env, trapFocus, onVisible } from './utils.js';

const THEMES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'ban-than', label: 'Bản thân' },
  { id: 'vu-tru', label: 'Vũ trụ' },
  { id: 'ngon-ngu', label: 'Ngôn ngữ' },
  { id: 'tuong-lai', label: 'Tương lai' },
  { id: 'gia-tuong', label: 'Giả tưởng' },
  { id: 'bi-an', label: 'Bí ẩn' },
];
const STATUS = {
  live: { label: 'Đã mở cửa', short: 'Mở cửa' },
  writing: { label: 'HUB đang viết', short: 'Đang viết' },
  soon: { label: 'Sắp ra mắt', short: 'Sắp ra mắt' },
};

const G = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const GLYPHS = {
  spiral: G('<path d="M12 12a1.5 1.5 0 0 1 1.5 1.5 3 3 0 0 1-3 3A4.5 4.5 0 0 1 6 12a6 6 0 0 1 6-6 7.5 7.5 0 0 1 7.5 7.5 9 9 0 0 1-9 9"/>'),
  saturn: G('<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10.5" ry="3.4" transform="rotate(-20 12 12)"/>'),
  speech: G('<path d="M4 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-3 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M18 8h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3-3h-3a2 2 0 0 1-2-2"/>'),
  signal: G('<path d="M12 21v-9"/><circle cx="12" cy="10.5" r="1.6"/><path d="M8.6 7a5 5 0 0 0 0 7M15.4 7a5 5 0 0 1 0 7M5.6 4a9.2 9.2 0 0 0 0 13M18.4 4a9.2 9.2 0 0 1 0 13"/>'),
  portal: G('<ellipse cx="12" cy="12" rx="7.5" ry="9.5"/><ellipse cx="12" cy="12" rx="4.5" ry="6.5"/><ellipse cx="12" cy="12" rx="1.6" ry="3"/>'),
  keyhole: G('<circle cx="12" cy="12" r="9.5"/><path d="M12 6.8a2.6 2.6 0 0 0-1.4 4.8L9.8 17h4.4l-.8-5.4A2.6 2.6 0 0 0 12 6.8z"/>'),
};
const glyph = (k) => svg(GLYPHS[k] || GLYPHS.spiral);

/* Số ngẫu nhiên không lệch bằng crypto */
const buf = new Uint32Array(1);
function randInt(n) { const lim = Math.floor(0x100000000 / n) * n; do crypto.getRandomValues(buf); while (buf[0] >= lim); return buf[0] % n; }

const is3D = () => matchMedia('(min-width: 900px)').matches && !env.reducedMotion;
// Mở được khi có link và sách đã lên sóng — hoặc đang viết nhưng đã có bản xem trước
const isOpenable = (b) => (b.status === 'live' || b.status === 'writing') && /^https?:\/\//.test(b.url || '');

/* ——— Bìa sách (dùng cho carousel/lưới và mặt trước trong hộp mở sách) ——— */
function coverEl(b) {
  const st = STATUS[b.status] || STATUS.soon;
  const pct = Math.max(0, Math.min(100, Number(b.progress) || 0));
  return h('div', { class: `cover cover--${b.status}`, style: { '--c': b.color } },
    h('span', { class: 'cover__frame', 'aria-hidden': 'true' }),
    h('span', { class: 'cover__glyph' }, glyph(b.glyph)),
    h('span', { class: 'cover__title', text: b.titleVi }),
    h('span', { class: 'cover__en', text: b.titleEn }),
    b.status === 'writing'
      ? h('span', { class: 'cover__status' }, h('span', { class: 'cover__bar' }, h('i', { style: { transform: `scaleX(${pct / 100})` } })), `${st.label} · ${pct}%${isOpenable(b) ? ' · xem ngay được' : ''}`)
      : h('span', { class: 'cover__status', text: st.label }),
    b.status === 'soon' ? h('span', { class: 'cover__seal', 'aria-hidden': 'true', text: 'H' }) : null);
}

export function initLibrary(cfg, scroll) {
  const root = $('#library');
  const books = cfg.library?.books || [];
  if (!root || !books.length) return;
  const gsap = window.gsap, Flip = window.Flip;
  if (gsap && Flip) gsap.registerPlugin(Flip);

  /* ——— Thống kê ——— */
  const count = (s) => books.filter((b) => b.status === s).length;
  $('#library-stats').textContent = `${books.length} cuốn · ${count('live')} đã mở cửa · ${count('writing')} đang viết`;

  /* ——— Chip lọc ——— */
  const themesUsed = new Set(books.map((b) => b.theme));
  const filters = h('div', { class: 'lib__filters', role: 'group', 'aria-label': 'Lọc theo chủ đề' },
    THEMES.filter((t) => t.id === 'all' || themesUsed.has(t.id)).map((t, i) =>
      h('button', { type: 'button', class: 'lib__chip', 'data-theme': t.id, 'aria-pressed': String(i === 0), text: t.label })));

  /* ——— Kệ sách 3D (desktop) ——— */
  const spine = (b, i) => {
    const st = STATUS[b.status] || STATUS.soon;
    const pct = Math.max(0, Math.min(100, Number(b.progress) || 0));
    const width = 46 + b.chapters.length * 5;
    const height = 292 + ((i * 37) % 4) * 12;
    return h('button', {
      type: 'button', class: `spine spine--${b.status}`, 'data-id': b.id,
      style: { '--c': b.color, '--w': `${width}px`, '--h': `${height}px` },
      'aria-label': `${b.titleVi} (${b.titleEn}) — ${st.label}${b.status === 'writing' ? ` ${pct}%` : ''}${isOpenable(b) ? ', đã có bản xem trước' : ''}. Bấm để xem mục lục`,
    },
    h('span', { class: 'spine__face' },
      h('span', { class: 'spine__band', 'aria-hidden': 'true' }),
      h('span', { class: 'spine__glyph' }, glyph(b.glyph)),
      h('span', { class: 'spine__title', text: b.titleVi }),
      h('span', { class: 'spine__status', title: st.label },
        b.status === 'writing' ? h('i', { style: { transform: `scaleY(${pct / 100})` } }) : null),
      h('span', { class: 'spine__band spine__band--b', 'aria-hidden': 'true' })),
    h('span', { class: 'spine__side', 'aria-hidden': 'true' }),
    h('span', { class: 'spine__top', 'aria-hidden': 'true' }));
  };
  const dust = h('canvas', { class: 'shelf__dust', 'aria-hidden': 'true' });
  const row = h('div', { class: 'shelf__row' }, books.map(spine));
  const shelf = h('div', { class: 'shelf' },
    h('div', { class: 'shelf__beam', 'aria-hidden': 'true' }), dust, row,
    h('div', { class: 'shelf__plank', 'aria-hidden': 'true' }));

  /* ——— Bìa sách: carousel (mobile) / lưới (reduced) ——— */
  const covers = h('div', { class: 'covers' }, h('div', { class: 'covers__track' }, books.map((b) => {
    const st = STATUS[b.status] || STATUS.soon;
    return h('button', { type: 'button', class: 'cover-btn', 'data-id': b.id, 'aria-label': `${b.titleVi} (${b.titleEn}) — ${st.label}. Bấm để xem mục lục` }, coverEl(b));
  })));

  const randomBtn = h('button', { type: 'button', class: 'btn btn--ghost lib__random', 'data-magnetic': '' },
    svg('<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="16" cy="16" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>'),
    'Rút ngẫu nhiên một cuốn');
  const empty = h('p', { class: 'lib__empty', hidden: true, text: 'Chủ đề này chưa có cuốn nào — HUB sẽ sớm bổ sung.' });
  root.replaceChildren(filters, h('div', { class: 'lib__stage' }, shelf, covers, empty), h('div', { class: 'lib__actions' }, randomBtn));

  const items = () => $$(is3D() ? '.spine' : '.cover-btn', root);
  const visible = () => items().filter((el) => !el.hidden);

  /* ——— Lọc (GSAP Flip) ——— */
  let theme = 'all';
  function applyFilter(next) {
    if (next === theme) return;
    theme = next;
    $$('.lib__chip', filters).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.theme === theme)));
    const all = $$('.spine, .cover-btn', root);
    const shown = items();
    const state = gsap && Flip && !env.reducedMotion ? Flip.getState(shown, { props: 'opacity' }) : null;
    all.forEach((el) => {
      const b = books.find((x) => x.id === el.dataset.id);
      el.hidden = !(theme === 'all' || b.theme === theme);
    });
    empty.hidden = visible().length > 0;
    if (state) {
      Flip.from(state, {
        duration: 0.7, ease: 'power3.inOut', absolute: true, stagger: 0.03, nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'power2.out' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, y: 20, duration: 0.35, ease: 'power2.in' }),
      });
    } else if (env.reducedMotion) {
      visible().forEach((el) => el.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }));
    }
    $('.covers__track', covers).scrollTo({ left: 0 });
  }
  filters.addEventListener('click', (e) => { const c = e.target.closest('.lib__chip'); if (c) applyFilter(c.dataset.theme); });

  /* ——— Bàn phím trên kệ: ← → di chuyển ——— */
  root.addEventListener('keydown', (e) => {
    const el = e.target.closest('.spine, .cover-btn');
    if (!el || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    const list = visible();
    const i = list.indexOf(el);
    const j = e.key === 'ArrowRight' ? Math.min(list.length - 1, i + 1) : Math.max(0, i - 1);
    e.preventDefault();
    list[j]?.focus();
    list[j]?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: env.reducedMotion ? 'auto' : 'smooth' });
  });

  /* ——— Hộp mở sách (mục lục) ——— */
  const modal = h('div', { class: 'bm-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bm-title', 'data-lenis-prevent': '', hidden: true });
  document.body.append(modal);
  modal.addEventListener('click', (e) => { if (e.target === modal || e.target.classList.contains('bm-wrap')) closeBook(); });
  let release = null, opening = false, picking = false;

  function build(b) {
    const st = STATUS[b.status] || STATUS.soon;
    const pct = Math.max(0, Math.min(100, Number(b.progress) || 0));
    const live = isOpenable(b);
    const action = live
      ? h('a', { class: 'btn btn--gold bm__go', href: b.url, target: '_blank', rel: 'noopener noreferrer' }, b.status === 'writing' ? 'Xem ngay bản đang viết →' : 'Mở cửa vào thư viện →')
      : h('button', { class: 'btn btn--gold bm__go', type: 'button', disabled: true, 'aria-disabled': 'true' }, b.status === 'writing' ? 'HUB đang viết…' : 'Sắp ra mắt');
    const statusBlock = h('div', { class: `bm__status bm__status--${b.status}` },
      h('span', { class: 'bm__badge', text: st.label }),
      b.status === 'writing' ? h('div', { class: 'bm__progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': pct, 'aria-label': 'Tiến độ viết' },
        h('span', { class: 'bm__progress-bar' }, h('i', { style: { transform: `scaleX(${pct / 100})` } })), h('span', { text: `${pct}%` })) : null,
      b.status === 'live' && !live ? h('span', { class: 'bm__hint', text: 'Đường dẫn đang được cập nhật.' }) : null,
      b.note ? h('p', { class: 'bm__hint bm__note', text: b.note }) : null);
    const toc = h('div', { class: 'bm__page' },
      h('p', { class: 'bm__kicker', text: 'Mục lục' }),
      h('h3', { class: 'bm__title', id: 'bm-title', text: b.titleVi }),
      h('p', { class: 'bm__en', text: b.titleEn }),
      h('p', { class: 'bm__tagline', text: b.tagline }),
      h('ol', { class: 'bm__chapters' }, b.chapters.map((c, i) => h('li', { style: { '--i': i } }, h('span', { class: 'bm__num', text: String(i + 1).padStart(2, '0') }), h('span', { text: c })))),
      statusBlock,
      action);
    const coverFace = h('div', { class: 'bm__cover-face bm__cover-front' }, coverEl(b));
    const coverBack = h('div', { class: 'bm__cover-face bm__cover-back', style: { '--c': b.color } },
      h('span', { class: 'bm__exlibris' }, glyph(b.glyph), h('span', { text: 'Thư viện của HUB' }), h('small', { text: 'Moonlit Journey' })));
    const book = h('div', { class: 'bm', style: { '--c': b.color } },
      toc, h('div', { class: 'bm__cover' }, coverFace, coverBack), h('span', { class: 'bm__burst', 'aria-hidden': 'true' }));
    const close = h('button', { class: 'icon-btn bm__close', type: 'button', 'aria-label': 'Đóng (Esc)' },
      svg('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'));
    close.addEventListener('click', closeBook);
    if (live) action.addEventListener('click', () => {
      // Không chặn & không trì hoãn: trình duyệt mở tab mới ngay; hiệu ứng ánh sáng chạy song song
      book.classList.remove('is-burst'); void book.offsetWidth; book.classList.add('is-burst');
    });
    modal.replaceChildren(h('div', { class: 'bm-wrap' }, book), close);
    return { book, close };
  }

  async function openBook(b, origin) {
    if (opening) return;
    opening = true;
    const { book, close } = build(b);
    modal.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('is-modal');
    scroll?.stop?.();
    const reduced = env.reducedMotion;
    if (reduced) {
      book.classList.add('is-open', 'is-instant');
      modal.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    } else {
      modal.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 350, fill: 'backwards' });
      // Sách bay ra từ kệ/carousel vào giữa màn hình (chỉ transform)
      const from = origin?.getBoundingClientRect();
      const to = book.getBoundingClientRect();
      if (from && to.width) {
        const dx = from.left + from.width / 2 - (to.left + to.width / 2);
        const dy = from.top + from.height / 2 - (to.top + to.height / 2);
        const sx = from.width / to.width, sy = from.height / to.height;
        await book.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy}) rotateY(${origin.classList.contains('spine') ? 75 : 0}deg)`, opacity: 0.6 },
          { transform: 'none', opacity: 1 },
        ], { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }).finished.catch(() => {});
      }
      await new Promise((r) => setTimeout(r, 120));
      book.classList.add('is-open');
    }
    release = trapFocus(modal, closeBook);
    setTimeout(() => close.focus({ preventScroll: true }), reduced ? 0 : 400);
    opening = false;
  }

  function closeBook() {
    if (modal.hidden) return;
    const done = () => {
      modal.hidden = true;
      modal.replaceChildren();
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('is-modal');
      scroll?.start?.();
    };
    const r = release; release = null;
    const fade = modal.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: env.reducedMotion ? 150 : 320 });
    if (fade) fade.onfinish = done; else done();
    r?.(); // trả focus về nút sách đã mở
  }

  root.addEventListener('click', (e) => {
    const el = e.target.closest('.spine, .cover-btn');
    if (!el || picking) return;
    openBook(books.find((b) => b.id === el.dataset.id), el);
  });

  /* ——— Rút ngẫu nhiên: các cuốn lần lượt sáng rồi dừng ——— */
  randomBtn.addEventListener('click', async () => {
    if (picking) return;
    const list = visible();
    if (!list.length) return;
    picking = true; randomBtn.disabled = true;
    const target = randInt(list.length);
    const steps = env.reducedMotion ? 0 : list.length * 2 + target;
    const track = $('.covers__track', covers);
    for (let s = 0; s <= steps; s++) {
      const el = list[(env.reducedMotion ? target : s) % list.length];
      list.forEach((x) => x.classList.toggle('is-lit', x === el));
      if (!is3D()) track.scrollTo({ left: el.offsetLeft - track.offsetLeft - 16, behavior: 'smooth' });
      const t = steps ? s / steps : 1;
      await new Promise((r) => setTimeout(r, 70 + t * t * 320));
    }
    const chosen = list[target];
    await new Promise((r) => setTimeout(r, env.reducedMotion ? 150 : 380));
    list.forEach((x) => x.classList.remove('is-lit'));
    picking = false; randomBtn.disabled = false;
    openBook(books.find((b) => b.id === chosen.dataset.id), chosen);
  });

  /* ——— Bụi sáng lơ lửng trong vệt sáng (chỉ desktop 3D, dừng khi ngoài màn hình/tab ẩn) ——— */
  const ctx = dust.getContext?.('2d');
  let running = false, raf = 0, parts = [], W = 0, H = 0;
  function sizeDust() {
    const r = dust.getBoundingClientRect();
    const dpr = 1; // hạt bụi nhỏ & mờ: không cần độ phân giải cao
    W = r.width; H = r.height;
    dust.width = W * dpr; dust.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = env.lowPower ? 22 : 40;
    parts = Array.from({ length: n }, () => ({ x: W * (0.15 + Math.random() * 0.7), y: Math.random() * H, r: 0.5 + Math.random() * 1.4, vy: -(0.08 + Math.random() * 0.22), vx: (Math.random() - 0.5) * 0.12, a: 0.2 + Math.random() * 0.5, p: Math.random() * 6.28 }));
  }
  let lastDraw = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - lastDraw < 32) return; // ~30fps là đủ cho bụi trôi chậm, nhẹ máy hơn
    lastDraw = t;
    ctx.clearRect(0, 0, W, H);
    for (const q of parts) {
      q.y += q.vy * 2; q.x += (q.vx + Math.sin(t * 0.0006 + q.p) * 0.08) * 2; // bù cho 30fps
      if (q.y < -4) { q.y = H + 4; q.x = W * (0.15 + Math.random() * 0.7); }
      // chỉ sáng khi nằm trong vệt sáng hình nón
      const spread = 0.08 + (q.y / H) * 0.42;
      const dxn = Math.abs(q.x / W - 0.5);
      if (dxn > spread) continue;
      ctx.globalAlpha = q.a * (1 - dxn / spread) * (0.6 + 0.4 * Math.sin(t * 0.002 + q.p));
      ctx.fillStyle = '#F3DDAB';
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.2832); ctx.fill();
    }
  }
  const canDust = () => ctx && is3D() && !env.lowPower;
  function start() { if (running || !canDust()) return; running = true; sizeDust(); raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); ctx?.clearRect(0, 0, W, H); }
  let inView = false;
  onVisible(shelf, (v) => { inView = v; v && !document.hidden ? start() : stop(); }, { threshold: 0.05 });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : inView && start()));
  addEventListener('resize', () => { if (running) { stop(); start(); } else if (inView) start(); });
}
