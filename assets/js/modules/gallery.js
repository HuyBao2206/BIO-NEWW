/* Lightbox ảnh: vuốt (mobile), ←/→/Esc (desktop), bộ đếm, preload ảnh kế, khoá cuộn nền */
import { $, h, svg, trapFocus, env } from './utils.js';
import { ICONS } from './icons.js';

export function initGallery(items, scroll) {
  const grid = $('#gallery-grid');
  if (!grid || !items?.length) return;
  let index = 0, box = null, release = null, imgEl, countEl, capEl;

  const preload = (i) => { const it = items[(i + items.length) % items.length]; if (it) { const im = new Image(); im.src = it.src; } };

  function show(i, dir = 0) {
    index = (i + items.length) % items.length;
    const it = items[index];
    const swap = () => {
      imgEl.src = it.src;
      imgEl.alt = it.alt || `Ảnh ${index + 1}`;
      countEl.textContent = `${index + 1} / ${items.length}`;
      capEl.textContent = it.caption || it.alt || '';
      imgEl.style.transform = '';
      imgEl.style.opacity = '1';
    };
    if (dir && !env.reducedMotion) {
      imgEl.style.opacity = '0';
      imgEl.style.transform = `translateX(${dir * -40}px)`;
      setTimeout(swap, 180);
    } else swap();
    preload(index + 1); preload(index - 1);
  }

  function open(i) {
    box = h('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Xem ảnh' });
    countEl = h('p', { class: 'lightbox__count', 'aria-live': 'polite' });
    const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Đóng (Esc)' }, svg(ICONS.close));
    imgEl = h('img', { alt: '', draggable: 'false' });
    capEl = h('p', { class: 'lightbox__caption' });
    const prev = h('button', { class: 'icon-btn lightbox__nav lightbox__nav--prev', type: 'button', 'aria-label': 'Ảnh trước' }, svg(ICONS.prev));
    const next = h('button', { class: 'icon-btn lightbox__nav lightbox__nav--next', type: 'button', 'aria-label': 'Ảnh kế tiếp' }, svg(ICONS.next));
    const stage = h('div', { class: 'lightbox__stage' }, imgEl, items.length > 1 ? prev : null, items.length > 1 ? next : null);
    box.append(h('div', { class: 'lightbox__bar' }, countEl, close), stage, capEl);
    document.body.append(box);
    document.documentElement.style.overflow = 'hidden';
    scroll?.stop();
    close.addEventListener('click', shut);
    prev.addEventListener('click', () => show(index - 1, -1));
    next.addEventListener('click', () => show(index + 1, 1));
    stage.addEventListener('click', (e) => { if (e.target === stage) shut(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(index + 1, 1);
      if (e.key === 'ArrowLeft') show(index - 1, -1);
    });
    // Vuốt
    let sx = 0, sy = 0, dx = 0, dragging = false;
    stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; dragging = true; sx = e.clientX; sy = e.clientY; dx = 0; imgEl.style.transition = 'none'; });
    stage.addEventListener('pointermove', (e) => { if (!dragging) return; dx = e.clientX - sx; if (Math.abs(dx) > Math.abs(e.clientY - sy)) imgEl.style.transform = `translateX(${dx}px)`; });
    const end = () => {
      if (!dragging) return; dragging = false; imgEl.style.transition = '';
      if (dx > 60) show(index - 1, -1); else if (dx < -60) show(index + 1, 1); else imgEl.style.transform = '';
    };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);

    release = trapFocus(box, shut);
    show(i);
    requestAnimationFrame(() => box.classList.add('is-open'));
    close.focus();
  }

  function shut() {
    if (!box) return;
    const b = box; box = null;
    b.classList.remove('is-open');
    setTimeout(() => b.remove(), env.reducedMotion ? 0 : 400);
    document.documentElement.style.overflow = '';
    scroll?.start();
    release?.();
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.bento__btn');
    if (btn) open(Number(btn.dataset.index));
  });
}
