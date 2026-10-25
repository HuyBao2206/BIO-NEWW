/* Hero: chòm sao Cự Giải, thẻ cung lật, đếm ngược sinh nhật, copy email, parallax chuột, intro */
import { $, $$, h, env, nfc, copyText } from './utils.js';
import { toast } from './toast.js';

const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };

/* ——— Chòm sao Cự Giải (Cancer): ι – γ – δ – α, δ – β ——— */
const STARS = { iota: [196, 26, 2.4], gamma: [200, 104, 2], delta: [210, 150, 2.4], alpha: [262, 240, 2.2], beta: [140, 226, 2.8] };
const LINES = [['iota', 'gamma'], ['gamma', 'delta'], ['delta', 'alpha'], ['delta', 'beta']];

export function buildConstellation(svgEl) {
  if (!svgEl) return;
  const g = S('g', {});
  LINES.forEach(([a, b]) => {
    const [x1, y1] = STARS[a], [x2, y2] = STARS[b];
    g.append(S('line', { x1, y1, x2, y2, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 0, class: 'c-line' }));
  });
  Object.values(STARS).forEach(([x, y, r]) => {
    const s = S('g', { class: 'c-star' });
    s.append(S('circle', { cx: x, cy: y, r: r * 3.2, class: 'c-halo' }), S('circle', { cx: x, cy: y, r }));
    g.append(s);
  });
  // vài ngôi sao phụ mờ
  [[130, 70, .8], [300, 90, .7], [176, 180, .6], [320, 190, .9], [90, 140, .6], [240, 286, .7]].forEach(([x, y, r]) => g.append(S('circle', { cx: x, cy: y, r, opacity: .5 })));
  const label = S('text', { x: 200, y: 278, 'text-anchor': 'middle' });
  label.textContent = 'CANCER · CỰ GIẢI';
  g.append(label);
  svgEl.append(g);
}

/* ——— Thẻ cung hoàng đạo lật (hover/tap/focus) ——— */
function initZodiac() {
  const z = $('#zodiac');
  if (!z) return;
  const btn = $('.zodiac__btn', z);
  const set = (open) => { z.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); };
  if (env.finePointer) {
    z.addEventListener('pointerenter', () => set(true));
    z.addEventListener('pointerleave', () => set(false));
  }
  btn.addEventListener('click', () => set(!z.classList.contains('is-open')));
  btn.addEventListener('blur', () => set(false));
  btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  document.addEventListener('pointerdown', (e) => { if (!z.contains(e.target)) set(false); });
}

/* ——— Đếm ngược sinh nhật ——— */
function initCountdown(profile) {
  const el = $('#hero-countdown');
  const [, m, d] = profile.birthday.split('-').map(Number);
  const nick = profile.nickname;
  const render = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (now.getMonth() + 1 === m && now.getDate() === d) {
      el.classList.add('is-birthday');
      el.textContent = `Hôm nay là sinh nhật ${nick} 🎂`;
      const k = `hub:confetti:${now.getFullYear()}`;
      let seen = false;
      try { seen = !!sessionStorage.getItem(k); sessionStorage.setItem(k, '1'); } catch { /* bị chặn storage */ }
      if (!seen) setTimeout(confetti, 1600);
      return;
    }
    let next = new Date(now.getFullYear(), m - 1, d);
    if (next < today) next = new Date(now.getFullYear() + 1, m - 1, d);
    const days = Math.round((next - today) / 86400000);
    el.classList.remove('is-birthday');
    el.replaceChildren('Còn ', h('b', { text: days }), ` ngày nữa là sinh nhật ${nick}`);
  };
  render();
  // cập nhật khi qua nửa đêm
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now + 1000;
  setTimeout(() => { render(); setInterval(render, 86400000); }, msToMidnight);
}

export function confetti() {
  if (env.reducedMotion) return;
  const c = h('canvas', { class: 'confetti', 'aria-hidden': 'true' });
  document.body.append(c);
  const ctx = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const colors = ['#E8C27A', '#F3DDAB', '#EDE9E3', '#9C7FCB', '#F2B45A'];
  const n = env.mobile ? 70 : 130;
  const parts = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.3, y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4, r: 3 + Math.random() * 4,
    rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  (function frame(t) {
    const life = (t - t0) / 3200;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - life); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
    }
    if (life < 1) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

/* ——— Copy email khi bấm Gmail ——— */
export function initEmailCopy() {
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('a[data-email]');
    if (!a) return;
    const ok = await copyText(a.dataset.email);
    if (ok) toast('Đã copy email ✓');
  });
}

/* ——— Parallax nhiều lớp theo chuột (desktop) ——— */
function initParallax() {
  if (!env.finePointer || env.reducedMotion || env.lowPower) return;
  const hero = $('#gioi-thieu');
  const layers = [...$$('[data-depth]', hero), $('.moon')].filter(Boolean).map((el) => ({ el, d: parseFloat(el.dataset.depth) || 0.2, x: 0, y: 0 }));
  let tx = 0, ty = 0, raf = 0, active = true;
  const loop = () => {
    raf = 0;
    let moving = false;
    for (const l of layers) {
      l.x += (tx * l.d - l.x) * 0.08; l.y += (ty * l.d - l.y) * 0.08;
      l.el.style.translate = `${l.x.toFixed(2)}px ${l.y.toFixed(2)}px`;
      if (Math.abs(tx * l.d - l.x) > 0.05) moving = true;
    }
    if (moving) raf = requestAnimationFrame(loop);
  };
  addEventListener('pointermove', (e) => {
    if (!active || e.pointerType !== 'mouse') return;
    tx = (e.clientX / innerWidth - 0.5) * -40;
    ty = (e.clientY / innerHeight - 0.5) * -30;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  new IntersectionObserver(([e]) => { active = e.isIntersecting; }).observe(hero);
}

/* ——— Intro sau preloader ——— */
export function prepareHeroIntro(gsap, SplitText) {
  const name = $('#hero-name');
  name.textContent = nfc(name.textContent); // NFC trước khi tách chữ → dấu tiếng Việt không vỡ
  if (!gsap || env.reducedMotion) return () => {};
  let chars = [];
  if (SplitText) {
    const split = SplitText.create(name, { type: 'chars', charsClass: 'char', aria: 'auto' });
    chars = split.chars;
  }
  const q = (k) => $(`[data-hero="${k}"]`);
  const lines = $$('#constellation .c-line');
  const stars = $$('#constellation .c-star');
  gsap.set([q('hello'), q('meta'), q('countdown'), q('hint')], { autoAlpha: 0, y: 18 });
  gsap.set($$('#hero-socials li'), { autoAlpha: 0, y: 20, scale: 0.9 });
  gsap.set('.hero__avatar', { autoAlpha: 0, scale: 0.82 });
  gsap.set('.badge-mono', { autoAlpha: 0, scale: 0.4, rotate: -20 });
  if (chars.length) gsap.set(chars, { autoAlpha: 0, yPercent: 55, rotateX: -75, transformOrigin: '50% 100%' });
  else gsap.set(name, { autoAlpha: 0, y: 30 });
  gsap.set(lines, { strokeDashoffset: 1 });
  gsap.set(stars, { autoAlpha: 0, scale: 0, transformOrigin: 'center', transformBox: 'fill-box' });

  return () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });
    tl.to('.hero__avatar', { autoAlpha: 1, scale: 1, duration: 1.6 }, 0.1)
      .to(q('hello'), { autoAlpha: 1, y: 0 }, 0.35)
      .to(chars.length ? chars : name, { autoAlpha: 1, yPercent: 0, y: 0, rotateX: 0, stagger: 0.055, duration: 1.3 }, 0.45)
      .to('.badge-mono', { autoAlpha: 1, scale: 1, rotate: 0, ease: 'back.out(2.2)', duration: .8 }, 0.9)
      .to(q('meta'), { autoAlpha: 1, y: 0 }, 0.95)
      .to(q('countdown'), { autoAlpha: 1, y: 0 }, 1.05)
      .to($$('#hero-socials li'), { autoAlpha: 1, y: 0, scale: 1, stagger: 0.08, ease: 'back.out(1.8)', duration: .9 }, 1.1)
      .to(q('hint'), { autoAlpha: 1, y: 0 }, 1.5)
      .to(stars, { autoAlpha: 1, scale: 1, stagger: 0.12, ease: 'back.out(3)', duration: .6 }, 0.6)
      .to(lines, { strokeDashoffset: 0, stagger: 0.22, ease: 'power2.inOut', duration: 1 }, 0.9);
    return tl;
  };
}

export function initHero(cfg) {
  buildConstellation($('#constellation'));
  initZodiac();
  initCountdown(cfg.profile);
  initParallax();
}
