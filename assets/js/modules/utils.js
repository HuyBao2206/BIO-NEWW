/* Tiện ích dùng chung — không phụ thuộc thư viện ngoài */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Tạo phần tử DOM an toàn: chữ luôn đi qua textContent. */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style' && typeof v === 'object') {
      // biến CSS (--x) phải đặt bằng setProperty; Object.assign sẽ bỏ qua chúng
      for (const [sk, sv] of Object.entries(v)) sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv);
    }
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

/** Chèn SVG tĩnh do chính site định nghĩa (KHÔNG dùng cho dữ liệu người dùng). */
export function svg(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

export const nfc = (s) => String(s ?? '').normalize('NFC');
export const isPending = (v) => v == null || String(v).trim() === '' || String(v).trim() === '...';

export function hash(str) {
  let x = 2166136261;
  for (const ch of nfc(str)) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619); }
  return x >>> 0;
}
/** Hai màu hue sinh từ tên — dùng cho avatar chữ & ảnh fallback */
export function hues(str) {
  const n = hash(str);
  const h1 = n % 360;
  const h2 = (h1 + 40 + ((n >>> 9) % 80)) % 360;
  return { '--h1': h1, '--h2': h2 };
}
export function initial(str) {
  const s = nfc(str).trim();
  const first = [...s][0] || '?';
  return first.toLocaleUpperCase('vi');
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export function debounce(fn, ms = 150) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

const mq = (q) => window.matchMedia(q);
export const env = {
  get reducedMotion() { return mq('(prefers-reduced-motion: reduce)').matches; },
  get finePointer() { return mq('(hover: hover) and (pointer: fine)').matches; },
  get touch() { return mq('(hover: none), (pointer: coarse)').matches; },
  get lowPower() {
    const c = navigator.connection;
    return (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || !!(c && c.saveData);
  },
  get mobile() { return mq('(max-width: 767px)').matches; },
};

/** localStorage an toàn (private mode / bị chặn vẫn không lỗi) */
export const store = {
  get(k, fallback = null) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua */ } },
  remove(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } },
};

/** Tải ảnh; resolve true/false, không bao giờ reject. Có cache → mỗi file chỉ request 1 lần. */
const imgCache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(false);
  if (!imgCache.has(src)) {
    imgCache.set(src, new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    }));
  }
  return imgCache.get(src);
}

/** Ảnh có fallback chữ: luôn có thẻ chữ bên dưới, ảnh thật mờ dần lên khi tải được.
 *  Ảnh chỉ được tải khi gần vào màn hình (xem hydrateMedia). */
export function mediaWithFallback({ src, alt = '', name = '', className = '', width, height, cjk = false }) {
  const wrap = h('div', { class: `media ${className}`.trim() });
  const fb = h('div', { class: 'fallback', 'aria-hidden': 'true' },
    h('span', { class: `fallback__initial${cjk ? ' cjk' : ''}`, text: initial(name) }),
    h('span', { class: `fallback__name${cjk ? ' cjk' : ''}`, text: nfc(name) }));
  for (const [k, v] of Object.entries(hues(name))) fb.style.setProperty(k, v);
  wrap.append(fb);
  if (src) {
    wrap.append(h('img', { alt, 'data-src': src, decoding: 'async', width: width || 800, height: height || 1000 }));
  } else if (alt) {
    wrap.setAttribute('role', 'img');
    wrap.setAttribute('aria-label', alt);
  }
  return wrap;
}

let mediaIO;
/** Gắn ảnh thật cho mọi img[data-src] trong root khi chúng gần viewport */
export function hydrateMedia(root = document) {
  mediaIO ||= new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    mediaIO.unobserve(e.target);
    const img = e.target.querySelector('img[data-src]');
    if (!img) return;
    const src = img.dataset.src;
    img.removeAttribute('data-src');
    loadImage(src).then((ok) => {
      if (!ok) return img.remove();
      img.addEventListener('load', () => { img.classList.add('is-loaded'); img.parentElement?.querySelector('.fallback')?.setAttribute('hidden', ''); }, { once: true });
      img.src = src;
    });
  }), { rootMargin: '300px 300px' });
  root.querySelectorAll('.media').forEach((m) => { if (m.querySelector('img[data-src]')) mediaIO.observe(m); });
}

/** Thời gian tương đối tiếng Việt */
export function timeAgo(date, now = Date.now()) {
  const d = new Date(date).getTime();
  const s = Math.max(0, Math.round((now - d) / 1000));
  if (s < 45) return 'vừa xong';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} phút trước`;
  const hr = Math.round(m / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'hôm qua';
  if (day < 7) return `${day} ngày trước`;
  if (day < 30) return `${Math.round(day / 7)} tuần trước`;
  if (day < 365) return `${Math.round(day / 30)} tháng trước`;
  return `${Math.round(day / 365)} năm trước`;
}
export function fullDate(date) {
  return new Date(date).toLocaleString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } });
    ta.value = text; document.body.append(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove(); return ok;
  }
}

/** Gọi cb(true/false) khi phần tử vào/ra viewport */
export function onVisible(el, cb, options = { rootMargin: '100px' }) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e)), options);
  io.observe(el);
  return () => io.disconnect();
}

/** Bẫy focus trong một vùng (lightbox, menu) */
export function trapFocus(container, onEscape) {
  const sel = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
  const prev = document.activeElement;
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); onEscape?.(); return; }
    if (e.key !== 'Tab') return;
    const items = $$(sel, container).filter((x) => x.offsetParent !== null || x === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKey);
  return () => { container.removeEventListener('keydown', onKey); prev?.focus?.({ preventScroll: true }); };
}

/** Chuẩn hoá chuỗi nhập: NFC, trim, gộp khoảng trắng thừa (giữ xuống dòng) */
export function cleanInput(s, { multiline = false } = {}) {
  let t = nfc(s).replace(/\r\n?/g, '\n');
  if (multiline) {
    t = t.split('\n').map((l) => l.replace(/[ \t ]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n');
  } else {
    t = t.replace(/\s+/g, ' ');
  }
  return t.trim();
}
