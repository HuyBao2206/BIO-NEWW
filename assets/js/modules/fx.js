/* Micro-interactions: nút magnetic, tilt 3D + glare, custom cursor */
import { $, $$, env, clamp } from './utils.js';

const fxEnabled = () => env.finePointer && !env.reducedMotion;

/* ——— Magnetic ——— */
export function initMagnetic(root = document) {
  if (!fxEnabled()) return;
  $$('[data-magnetic]', root).forEach((el) => {
    if (el.__mag) return;
    el.__mag = true;
    const strength = parseFloat(el.dataset.magnetic) || 0.32;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const tick = () => {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1) raf = requestAnimationFrame(tick);
      else { raf = 0; if (!tx && !ty) el.style.transform = ''; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      kick();
    });
    el.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  });
}

/* ——— Tilt 3D + glare ——— */
export function initTilt(root = document) {
  if (!fxEnabled()) return;
  $$('[data-tilt]', root).forEach((el) => {
    if (el.__tilt) return;
    el.__tilt = true;
    const max = parseFloat(el.dataset.tilt) || 8;
    let raf = 0, last;
    const apply = () => {
      raf = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const px = clamp((last.clientX - r.left) / r.width, 0, 1);
      const py = clamp((last.clientY - r.top) / r.height, 0, 1);
      el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateZ(0)`;
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    };
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') el.classList.add('is-tilting'); });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    el.addEventListener('pointerleave', () => { last = null; el.classList.remove('is-tilting'); el.style.transform = ''; });
  });
}

/* ——— Custom cursor ——— */
export function initCursor() {
  if (!fxEnabled() || env.lowPower) return;
  const c = $('.cursor');
  if (!c) return;
  const dot = $('.cursor__dot', c), ring = $('.cursor__ring', c);
  document.documentElement.classList.add('has-cursor');
  let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
  const loop = () => {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
    if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.2) raf = requestAnimationFrame(loop);
    else raf = 0;
  };
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    c.classList.remove('is-hidden');
    if (!raf) raf = requestAnimationFrame(loop);
    const t = e.target.closest?.('a, button, [role="tab"], label, [data-cursor], .carousel__track');
    c.classList.toggle('is-hover', !!t && !t.disabled);
  }, { passive: true });
  window.addEventListener('pointerdown', () => c.classList.add('is-down'));
  window.addEventListener('pointerup', () => c.classList.remove('is-down'));
  document.addEventListener('mouseleave', () => c.classList.add('is-hidden'));
}
