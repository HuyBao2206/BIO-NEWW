/* "Tín hiệu vũ trụ dành cho bạn" — rút 1 lá tarot, chạy hoàn toàn trên trình duyệt.
 * Trạng thái chỉ nằm trong bộ nhớ (biến JS): F5 là rút lá mới. Không dùng localStorage/sessionStorage. */
import { $, $$, h, svg, env, loadImage, onVisible } from './utils.js';
import { TAROT } from '../data/tarot.js';
import { cardFaceSVG, cardBackSVG } from './tarot-art.js';

/* Số ngẫu nhiên bằng crypto.getRandomValues (không lệch phân phối) */
const buf = new Uint32Array(1);
function randInt(n) {
  const limit = Math.floor(0x100000000 / n) * n;
  do crypto.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % n;
}
const rand01 = () => (crypto.getRandomValues(buf), buf[0] / 0x100000000);

/* Vị trí nghỉ của từng lá trong xấp (lệch nhẹ cho tự nhiên) */
const restOf = (i) => `translate(${(i * 1.6).toFixed(1)}px, ${(-i * 2.2).toFixed(1)}px) rotate(${((i - 2.5) * 1.3).toFixed(1)}deg)`;

const ASPECTS = [
  { key: 'love', label: 'Tình cảm' },
  { key: 'work', label: 'Công việc' },
  { key: 'advice', label: 'Lời khuyên' },
];

export function initOracle(cfg) {
  const root = $('#oracle');
  if (!root) return;
  const opts = { reversedChance: 0.3, imageDir: 'assets/images/tarot/', ...(cfg.oracle || {}) };
  const reduced = () => env.reducedMotion;

  let drawn = null;      // { card, reversed, imageOk } — chỉ trong bộ nhớ
  let state = 'idle';    // idle | busy | open | closed
  let inView = false;

  /* ——— Khung ——— */
  const deck = h('div', { class: 'oracle__deck', 'aria-hidden': 'true' },
    Array.from({ length: 6 }, (_, i) => h('div', { class: 'deck-card', style: { transform: restOf(i) } }, svg(cardBackSVG()))));
  const flipInner = h('div', { class: 'flip__inner' });
  const front = h('div', { class: 'flip__face flip__front' });
  const back = h('div', { class: 'flip__face flip__back' }, svg(cardBackSVG()));
  flipInner.append(back, front);
  const drawnEl = h('div', { class: 'oracle__drawn', hidden: true }, h('div', { class: 'flip' }, flipInner));
  const sparks = h('canvas', { class: 'oracle__sparks', 'aria-hidden': 'true' });
  const table = h('div', { class: 'oracle__table' }, deck, drawnEl, sparks);

  const titleEn = h('h3', { class: 'oracle__name', id: 'oracle-name', tabindex: '-1' });
  const titleVi = h('p', { class: 'oracle__name-vi' });
  const badge = h('span', { class: 'oracle__badge' });
  const chips = h('ul', { class: 'oracle__chips', 'aria-label': 'Từ khoá' });
  const message = h('p', { class: 'oracle__message' });
  const tablist = h('div', { class: 'oracle__tabs', role: 'tablist', 'aria-label': 'Khía cạnh' });
  const tabPanels = h('div', { class: 'oracle__tabpanels' });
  ASPECTS.forEach((a, i) => {
    tablist.append(h('button', { type: 'button', role: 'tab', id: `otab-${a.key}`, 'aria-controls': `opanel-${a.key}`, 'aria-selected': String(i === 0), tabindex: i ? '-1' : '0', text: a.label }));
    tabPanels.append(h('div', { class: 'oracle__tabpanel', role: 'tabpanel', id: `opanel-${a.key}`, 'aria-labelledby': `otab-${a.key}`, hidden: i !== 0 }, h('p')));
  });
  const closeBtn = h('button', { class: 'icon-btn oracle__close', type: 'button', 'aria-label': 'Đóng bảng (Esc)' },
    svg('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'));
  const panel = h('div', { class: 'oracle__panel glass', role: 'region', 'aria-labelledby': 'oracle-name', hidden: true },
    closeBtn,
    h('p', { class: 'oracle__kicker' }, 'Lá bài của bạn ', badge),
    titleEn, titleVi, chips, message, tablist, tabPanels);

  const stage = h('div', { class: 'oracle__stage' }, table, panel);
  const cta = h('button', { class: 'btn btn--gold btn--lg oracle__cta', type: 'button', 'data-magnetic': '' },
    h('span', { class: 'oracle__cta-label', text: 'Nhận tín hiệu của mình tại đây!' }), h('span', { 'aria-hidden': 'true', text: ' ✦' }));
  const hint = h('p', { class: 'oracle__hint', hidden: true, text: 'Mỗi lần ghé chỉ nhận một tín hiệu — F5 để rút lá mới ✨' });
  const live = h('p', { class: 'sr-only', 'aria-live': 'polite' });
  root.replaceChildren(stage, h('div', { class: 'oracle__actions' }, cta, hint), live);

  /* ——— Tabs trong bảng ——— */
  const tabs = $$('[role="tab"]', tablist);
  function selectTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t, false));
    t.addEventListener('keydown', (e) => {
      const j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : null;
      if (j != null) { e.preventDefault(); selectTab(tabs[j], true); }
    });
  });

  /* ——— Đổ nội dung lá bài ——— */
  function fill({ card, reversed, imageOk }) {
    const side = reversed ? card.reversed : card.upright;
    front.replaceChildren(imageOk
      ? h('img', { src: `${opts.imageDir}${card.id}.webp`, alt: `${card.nameEn} — ${card.nameVi}`, width: 400, height: 680, decoding: 'async' })
      : svg(cardFaceSVG(card)));
    front.classList.toggle('is-reversed', reversed);
    titleEn.textContent = card.nameEn;
    titleVi.textContent = card.nameVi;
    badge.textContent = reversed ? 'Ngược' : 'Xuôi';
    badge.className = `oracle__badge ${reversed ? 'is-reversed' : 'is-upright'}`;
    chips.replaceChildren(...card.keywords.map((k) => h('li', { text: k })));
    message.textContent = side.message;
    ASPECTS.forEach((a) => { $(`#opanel-${a.key} p`, tabPanels).textContent = side[a.key]; });
    selectTab(tabs[0], false);
  }

  /* ——— Hiệu ứng ——— */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const anim = (el, frames, o) => (el.animate ? el.animate(frames, o).finished.catch(() => {}) : Promise.resolve());

  function shuffle() {
    const cards = $$('.deck-card', deck);
    cards.forEach((c) => { c.style.willChange = 'transform'; });
    return Promise.all(cards.map((c, i) => {
      const dir = i % 2 ? 1 : -1, dx = 48 + (i % 3) * 14;
      return anim(c, [
        { transform: restOf(i) },
        { transform: `translate(${dir * dx}px, ${-6 - i}px) rotate(${dir * 9}deg)`, offset: 0.25 },
        { transform: `translate(${-dir * dx * 0.6}px, ${-4}px) rotate(${-dir * 6}deg)`, offset: 0.55 },
        { transform: `translate(${dir * 12}px, -2px) rotate(${dir * 2}deg)`, offset: 0.8 },
        { transform: restOf(i) },
      ], { duration: 1200, delay: i * 30, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' });
    })).then(() => cards.forEach((c) => { c.style.willChange = ''; }));
  }

  function burst() {
    if (reduced()) return;
    const r = table.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const W = r.width * 1.8, H = r.height * 1.5;
    sparks.width = W * dpr; sparks.height = H * dpr;
    const ctx = sparks.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = env.mobile || env.lowPower ? 36 : 64;
    const ps = Array.from({ length: n }, () => {
      const a = rand01() * Math.PI * 2, sp = 1.2 + rand01() * 3.4;
      return { x: W / 2, y: H / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, r: 0.8 + rand01() * 2.2, life: 1, d: 0.008 + rand01() * 0.012, gold: rand01() < 0.7 };
    });
    const step = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of ps) {
        if (p.life <= 0) continue;
        alive++;
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.015; p.life -= p.d;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.gold ? '#F3DDAB' : '#EDE9E3';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        if (p.r > 2) { ctx.globalAlpha *= 0.25; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.2832); ctx.fill(); }
      }
      if (alive) requestAnimationFrame(step); else ctx.clearRect(0, 0, W, H);
    };
    requestAnimationFrame(step);
  }

  /* FLIP: lá bài trượt từ giữa sang vị trí mới mượt mà (chỉ transform) */
  async function flipMove(mutate) {
    const before = table.getBoundingClientRect();
    mutate();
    const after = table.getBoundingClientRect();
    const dx = before.left + before.width / 2 - (after.left + after.width / 2);
    const dy = before.top + before.height / 2 - (after.top + after.height / 2);
    const s = before.width / after.width || 1;
    if (reduced() || (Math.abs(dx) < 2 && Math.abs(dy) < 2 && Math.abs(s - 1) < 0.02)) return;
    await anim(table, [{ transform: `translate(${dx}px, ${dy}px) scale(${s})` }, { transform: 'none' }], { duration: 850, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  }

  function showPanel() {
    panel.hidden = false;
    const fromSide = matchMedia('(min-width: 900px)').matches;
    return anim(panel, reduced()
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: fromSide ? 'translateX(48px)' : 'translateY(36px)' }, { opacity: 1, transform: 'none' }],
    { duration: reduced() ? 300 : 750, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' });
  }

  function setCta() {
    $('.oracle__cta-label', cta).textContent = drawn ? 'Xem lại lá bài của bạn' : 'Nhận tín hiệu của mình tại đây!';
    hint.hidden = !drawn;
    cta.hidden = state === 'open' || state === 'busy';
  }

  /* ——— Luồng chính ——— */
  async function draw() {
    if (state === 'busy' || state === 'open') return;
    if (drawn) return reopen();
    state = 'busy'; setCta();
    const card = TAROT[randInt(TAROT.length)];
    const reversed = rand01() < opts.reversedChance;
    const probe = loadImage(`${opts.imageDir}${card.id}.webp`);
    if (!reduced()) await shuffle();
    const imageOk = await Promise.race([probe, wait(reduced() ? 300 : 600).then(() => false)]);
    drawn = { card, reversed, imageOk };
    fill(drawn);

    // Lá bay ra & lật 3D
    drawnEl.hidden = false;
    flipInner.classList.remove('is-flipped');
    if (reduced()) {
      flipInner.classList.add('is-flipped');
      await anim(drawnEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    } else {
      await anim(drawnEl, [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-26px) scale(1.06)' }], { duration: 380, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
      flipInner.classList.add('is-flipped');
      setTimeout(burst, 220);
      await wait(820);
      drawnEl.getAnimations?.().forEach((a) => a.cancel());
      anim(drawnEl, [{ transform: 'translateY(-26px) scale(1.06)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    }
    await open();
    live.textContent = `Bạn đã rút được lá ${card.nameEn} — ${card.nameVi}, chiều ${reversed ? 'ngược' : 'xuôi'}.`;
  }

  async function open() {
    state = 'busy';
    await flipMove(() => { stage.classList.add('is-open'); deck.hidden = true; });
    await showPanel();
    state = 'open'; setCta();
    titleEn.focus({ preventScroll: true });
  }

  async function reopen() {
    state = 'busy'; setCta();
    fill(drawn);
    drawnEl.hidden = false;
    flipInner.classList.add('is-flipped');
    await anim(drawnEl, [{ opacity: 0 }, { opacity: 1 }], { duration: reduced() ? 250 : 450 });
    await open();
    live.textContent = `Lá bài của bạn: ${drawn.card.nameEn} — ${drawn.card.nameVi}, chiều ${drawn.reversed ? 'ngược' : 'xuôi'}.`;
  }

  async function close() {
    if (state !== 'open') return;
    state = 'busy';
    await anim(panel, [{ opacity: 1 }, { opacity: 0 }], { duration: reduced() ? 150 : 300 });
    panel.hidden = true;
    await anim(drawnEl, [{ opacity: 1 }, { opacity: 0 }], { duration: reduced() ? 150 : 300 });
    drawnEl.hidden = true;
    await flipMove(() => { stage.classList.remove('is-open'); deck.hidden = false; });
    state = 'closed'; setCta();
    cta.focus({ preventScroll: true });
  }

  cta.addEventListener('click', draw);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state === 'open') { e.preventDefault(); close(); return; }
    if (e.key !== 'Enter' || !inView || state === 'open' || state === 'busy') return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (['input', 'textarea', 'button', 'a', 'select'].includes(tag) || e.target.isContentEditable) return;
    e.preventDefault();
    draw();
  });
  onVisible(root, (v) => { inView = v; deck.classList.toggle('is-paused', !v); }, { threshold: 0.3 });
  setCta();
}
