/* Favorites: tabs (ARIA) + carousel scroll-snap loop vô hạn, autoplay có thanh tiến độ */
import { $, $$, env, onVisible } from './utils.js';

const IDLE_RESUME_MS = 3500;

class Carousel {
  constructor(root, { autoplayMs = 10000 } = {}) {
    this.root = root;
    this.track = $('.carousel__track', root);
    this.originals = $$('.carousel__slide', this.track);
    this.n = this.originals.length;
    this.autoplayMs = autoplayMs;
    this.countEl = $('.carousel__count b', root);
    this.bar = $('.carousel__progress', root);
    this.nextBtn = $('.carousel__nav--next', root);
    this.prevBtn = $('.carousel__nav--prev', root);
    this.dots = $$('[data-dot]', root);
    this.p = 0; this.target = 0; this.step = 1;
    this.pause = { hover: false, interact: false, hidden: document.hidden, offscreen: true, inactive: false };
    this.autoplay = !env.reducedMotion && this.n > 1;
    if (!this.n) return;
    this.setupLoop();
    this.bind();
    this.measure();
    this.jump(this.loop ? this.n : 0);
    this.update();
  }

  /* Nhân bản slide 2 bên để loop vô hạn mượt khi vuốt */
  setupLoop() {
    this.loop = this.n > 1;
    if (!this.loop) return;
    const clone = (s) => { const c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.setAttribute('inert', ''); c.classList.add('is-clone'); c.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id')); return c; };
    const before = this.originals.map(clone), after = this.originals.map(clone);
    this.track.prepend(...before);
    this.track.append(...after);
    this.slides = $$('.carousel__slide', this.track);
    // Clone thẻ nhạc vẫn bật/tắt vinyl khi bấm
    this.slides.filter((s) => s.classList.contains('is-clone')).forEach((s) => {
      const card = $('.fcard--music', s);
      $('.vinyl-toggle', s)?.addEventListener('click', () => card.classList.toggle('is-open'));
    });
  }

  get total() { return this.loop ? this.n * 3 : this.n; }
  real(i) { return ((i % this.n) + this.n) % this.n; }

  measure() {
    const s = (this.slides || this.originals)[0];
    const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
    this.step = s.getBoundingClientRect().width + gap || 1;
  }
  current() { return Math.round(this.track.scrollLeft / this.step); }
  jump(i) { this.target = i; this.track.scrollTo({ left: i * this.step, behavior: 'instant' }); }
  goTo(i, { user = true } = {}) {
    i = Math.max(0, Math.min(this.total - 1, i));
    this.target = i;
    this.track.scrollTo({ left: i * this.step, behavior: env.reducedMotion ? 'instant' : 'smooth' });
    this.p = 0;
    if (user) this.touch();
    this.updateUI(i);
  }
  next(user = true) { this.goTo(this.target + 1, { user }); }
  prev(user = true) { this.goTo(this.target - 1, { user }); }

  /* Sau khi cuộn dừng: đưa về bộ slide ở giữa (loop) */
  settle() {
    if (this.track.classList.contains('is-dragging')) return;
    let i = this.current();
    if (this.loop) {
      if (i < this.n) i += this.n;
      else if (i >= this.n * 2) i -= this.n;
      if (i !== this.current()) this.jump(i);
    }
    this.target = i;
    this.updateUI(i);
  }

  updateUI(i) {
    const r = this.real(i);
    if (this.countEl) this.countEl.textContent = String(r + 1).padStart(2, '0');
    this.dots.forEach((d, k) => d.setAttribute('aria-current', k === r ? 'true' : 'false'));
  }

  /* Hiệu ứng chiều sâu: thẻ ngoài khung mờ & nhỏ lại */
  update() {
    this.raf = 0;
    const tr = this.track.getBoundingClientRect();
    const cs = getComputedStyle(this.track);
    const left = tr.left + parseFloat(cs.paddingLeft) - 4, right = tr.right - parseFloat(cs.paddingRight) + 4;
    (this.slides || this.originals).forEach((s) => {
      const r = s.getBoundingClientRect();
      const c = r.left + r.width / 2;
      s.classList.toggle('is-far', c < left || c > right);
    });
  }
  requestUpdate() { if (!this.raf) this.raf = requestAnimationFrame(() => this.update()); }

  touch() {
    this.pause.interact = true;
    this.p = 0;
    clearTimeout(this.idleT);
    this.idleT = setTimeout(() => { this.pause.interact = false; this.kick(); }, IDLE_RESUME_MS);
  }
  get paused() { return Object.values(this.pause).some(Boolean); }

  /* Autoplay: rAF chỉ chạy khi thực sự cần */
  kick() {
    if (!this.autoplay || this.playing || this.paused) return;
    this.playing = true;
    let last = performance.now();
    const loop = (t) => {
      if (this.paused) { this.playing = false; return; }
      this.p += (t - last) / this.autoplayMs; last = t;
      if (this.p >= 1) { this.p = 0; this.next(false); }
      this.bar?.style.setProperty('--p', this.p.toFixed(4));
      this.nextBtn?.style.setProperty('--p', this.p.toFixed(4));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  setActive(active) {
    this.pause.inactive = !active;
    if (active) { this.measure(); this.jump(this.target || (this.loop ? this.n : 0)); this.update(); this.kick(); }
  }

  bind() {
    const t = this.track;
    this.nextBtn?.addEventListener('click', () => this.next());
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.dots.forEach((d) => d.addEventListener('click', () => {
      const base = this.loop ? this.n : 0;
      this.goTo(base + Number(d.dataset.dot));
    }));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
    });

    let st;
    const onScrollEnd = () => { clearTimeout(st); this.settle(); };
    t.addEventListener('scroll', () => {
      this.requestUpdate();
      clearTimeout(st);
      st = setTimeout(onScrollEnd, 160); // dự phòng cho trình duyệt chưa có 'scrollend'
    }, { passive: true });
    if ('onscrollend' in window) t.addEventListener('scrollend', onScrollEnd);

    // Tương tác → tạm dừng
    t.addEventListener('pointerdown', () => this.touch());
    t.addEventListener('touchstart', () => this.touch(), { passive: true });
    t.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) this.touch(); }, { passive: true });
    this.root.addEventListener('focusin', () => this.touch());
    if (env.finePointer) {
      this.root.addEventListener('pointerenter', () => { this.pause.hover = true; });
      this.root.addEventListener('pointerleave', () => { this.pause.hover = false; this.kick(); });
    }
    document.addEventListener('visibilitychange', () => { this.pause.hidden = document.hidden; this.kick(); });
    onVisible(this.root, (v) => { this.pause.offscreen = !v; if (v) this.kick(); }, { threshold: 0.25 });

    // Kéo bằng chuột (desktop)
    let down = false, sx = 0, sl = 0, moved = 0;
    t.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; sx = e.clientX; sl = t.scrollLeft; moved = 0;
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 5) { t.classList.add('is-dragging'); t.scrollLeft = sl - dx; }
    });
    addEventListener('pointerup', (e) => {
      if (!down) return;
      down = false;
      if (!t.classList.contains('is-dragging')) return;
      t.classList.remove('is-dragging');
      const dx = e.clientX - sx;
      const base = Math.round(sl / this.step);
      const delta = Math.abs(dx) > this.step * 0.18 ? (dx < 0 ? Math.max(1, Math.round(-dx / this.step)) : -Math.max(1, Math.round(dx / this.step))) : 0;
      this.goTo(base + delta);
    });
    t.addEventListener('click', (e) => { if (moved > 5) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);

    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const r = this.real(this.target); this.measure(); this.jump((this.loop ? this.n : 0) + r); this.update(); }, 150); });
  }
}

/* ——— Gõ chữ cho thẻ Ngôn ngữ ——— */
function initTyping(panel) {
  if (env.reducedMotion) return;
  $$('.lang__big', panel).forEach((el) => {
    const textEl = $('.lang__text', el);
    const full = [...el.dataset.greeting];
    let i = full.length, dir = -1, timer = 0, visible = false;
    const tick = () => {
      if (!visible) { timer = 0; return; }
      i += dir;
      textEl.textContent = full.slice(0, Math.max(0, i)).join('');
      let delay = dir > 0 ? 130 : 60;
      if (i >= full.length) { dir = -1; delay = 2600; }
      else if (i <= 0) { dir = 1; delay = 500; }
      timer = setTimeout(tick, delay);
    };
    onVisible(el, (v) => { visible = v; if (v && !timer) timer = setTimeout(tick, 1200); }, { threshold: 0.6 });
  });
}

export function initFavorites(cfg) {
  const tablist = $('#fav-tabs');
  const tabs = $$('[role="tab"]', tablist);
  const indicator = $('.tabs__indicator', tablist);
  const carousels = new Map();
  $$('.fav-panel').forEach((p) => {
    const c = new Carousel($('[data-carousel]', p), { autoplayMs: cfg.favorites.autoplayMs || 10000 });
    carousels.set(p.id, c);
    if (p.hidden) c.pause.inactive = true;
  });
  initTyping($('#panel-languages'));

  const moveIndicator = (tab) => {
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  function select(tab, focus = true) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      carousels.get(panel.id)?.setActive(on);
      if (on && !env.reducedMotion && panel.animate) {
        panel.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      }
    });
    moveIndicator(tab);
    if (focus) tab.focus();
    tab.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t, false));
    t.addEventListener('keydown', (e) => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j != null) { e.preventDefault(); select(tabs[j]); }
    });
  });
  const init = () => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  init();
  document.fonts?.ready.then(init);
  addEventListener('resize', init);
  const first = carousels.values().next().value;
  first?.setActive(true);
}
