/* Hệ thống chuyển động: Lenis + ScrollTrigger, reveal, con đường hành trình, quote, gallery, dịch vụ */
import { $, $$, env, nfc } from './utils.js';

export const EASE = 'expo.out';

/* ——— Cuộn mượt ——— */
export function initScroll({ gsap, ScrollTrigger, Lenis }) {
  let lenis = null;
  const smooth = Lenis && env.finePointer && !env.reducedMotion && !env.lowPower; // cảm ứng → native scroll
  if (smooth) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, autoRaf: false, anchors: false });
    if (gsap && ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  return {
    lenis,
    scrollTo(target) {
      const behavior = env.reducedMotion ? 'auto' : 'smooth';
      if (lenis) return lenis.scrollTo(target, { duration: 1.4 }); // Lenis tự tính scroll-padding-top
      if (target === 0) return window.scrollTo({ top: 0, behavior });
      target.scrollIntoView({ behavior, block: 'start' });
    },
    stop() { lenis?.stop(); },
    start() { lenis?.start(); },
  };
}

/* ——— Toàn bộ hiệu ứng theo scroll (cần GSAP + ScrollTrigger) ——— */
export function initScrollMotion({ gsap, ScrollTrigger, SplitText }) {
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  const reduced = env.reducedMotion;

  /* Tiêu đề section: reveal theo dòng bằng mask */
  $$('.section-title').forEach((el) => {
    el.innerHTML = el.innerHTML.normalize('NFC'); // chỉ chứa chữ tĩnh của site (không có dữ liệu người dùng)
    if (reduced || !SplitText) {
      gsap.from(el, { autoAlpha: 0, duration: 0.8, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      return;
    }
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }),
    });
  });

  /* Fade-up chung */
  const fadeUp = (targets, trigger, opts = {}) => {
    const els = typeof targets === 'string' ? $$(targets) : targets;
    if (!els.length) return;
    gsap.from(els, {
      autoAlpha: 0, y: reduced ? 0 : 36, duration: reduced ? 0.6 : 1, ease: reduced ? 'power1.out' : EASE, stagger: 0.08, ...opts,
      scrollTrigger: { trigger: trigger || els[0], start: 'top 86%', once: true },
    });
  };
  $$('.eyebrow').forEach((e) => fadeUp([e], e));
  $$('.section-head .lead, .boat__copy .lead').forEach((e) => fadeUp([e], e, { delay: 0.15 }));
  fadeUp('.tabs', '.tabs');
  fadeUp('#order-platforms li', '#order-platforms', { stagger: 0.05 });
  fadeUp('#order-cats li', '#order-cats', { stagger: 0.06 });
  fadeUp('#order-whys li', '#order-whys');
  fadeUp('#order-faq .faq__item', '#order-faq');
  $$('.contact-card').forEach((c) => fadeUp([c], c));
  fadeUp('.gb-form', '.gb');
  fadeUp('.gallery__note', '.gallery__note');

  if (reduced) return; // phần còn lại là chuyển động/parallax

  initJourney(gsap, ScrollTrigger);
  initQuote(gsap, SplitText);
  initGallery(gsap);
  initBoat(gsap);
  initOrderTimeline(gsap);

  /* Hero mờ dần khi cuộn qua */
  gsap.to('.hero__inner', { yPercent: -12, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.moon', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true } });

  /* Favorites: cards xuất hiện có chiều sâu */
  gsap.from('#yeu-thich .carousel', { autoAlpha: 0, y: 60, rotateX: -8, transformPerspective: 1200, duration: 1.4, ease: EASE, scrollTrigger: { trigger: '#fav-panels', start: 'top 85%', once: true } });

  /* Lưu bút: thẻ ghi chú */
  ScrollTrigger.batch('.note', { start: 'top 92%', once: true, onEnter: (b) => gsap.from(b, { autoAlpha: 0, y: 30, stagger: 0.06, duration: 0.9, ease: EASE }) });

  addEventListener('load', () => ScrollTrigger.refresh());
}

/* ——— Con đường hành trình chạy xuyên trang ——— */
function initJourney(gsap, ScrollTrigger) {
  const svgEl = $('#journey');
  const path = $('.journey__path', svgEl);
  const main = $('#noi-dung');
  if (!svgEl || !path || !main) return;
  path.setAttribute('pathLength', '1');
  const build = () => {
    const H = main.offsetHeight;
    const W = document.documentElement.clientWidth;
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.style.height = `${H}px`;
    const sections = $$('main > section');
    const edge = W < 768 ? 12 : Math.max(32, (W - 1240) / 2 - 8);
    // Đi dọc lề, chỉ băng ngang ở khoảng trống giữa hai section → không cắt qua chữ
    const pts = [[W / 2, sections[0].offsetHeight - 30]];
    sections.slice(1).forEach((s, i) => {
      const x = i % 2 ? edge : W - edge;
      const pad = Math.min(parseFloat(getComputedStyle(s).paddingTop) || 80, s.offsetHeight * 0.2) * 0.55;
      pts.push([x, s.offsetTop + pad], [x, s.offsetTop + s.offsetHeight - pad]);
    });
    pts.push([W / 2, H - 4]);
    // Catmull-Rom → Bézier để đường cong mềm
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    path.setAttribute('d', d);
  };
  build();
  svgEl.classList.add('is-drawable');
  ScrollTrigger.addEventListener('refreshInit', build);
  gsap.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
}

/* ——— Quote: từng từ sáng dần + con đường tự vẽ + đốm sáng chạy ——— */
function initQuote(gsap, SplitText) {
  const text = $('#quote-text');
  text.textContent = nfc(text.textContent);
  let words = [];
  if (SplitText) words = SplitText.create(text, { type: 'words', wordsClass: 'word', aria: 'auto' }).words;
  const line = $('#road-line');
  const spark = $('#road-spark');
  const len = line.getTotalLength();
  line.style.strokeDasharray = `${len}`;
  line.style.strokeDashoffset = `${len}`;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.quote', start: 'top 70%', end: 'bottom 60%', scrub: 0.8 } });
  if (words.length) tl.fromTo(words, { opacity: 0.15 }, { opacity: 1, stagger: 0.12, ease: 'none', duration: 0.6 }, 0);
  const state = { p: 0 };
  tl.to(state, {
    p: 1, ease: 'none', duration: words.length ? words.length * 0.12 + 0.6 : 2,
    onUpdate: () => {
      line.style.strokeDashoffset = `${len * (1 - state.p)}`;
      const pt = line.getPointAtLength(len * state.p);
      spark.setAttribute('cx', pt.x); spark.setAttribute('cy', pt.y);
      spark.style.opacity = state.p > 0.01 && state.p < 0.995 ? '1' : '0';
    },
  }, 0);
  tl.fromTo('#quote-sign', { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 }, { clipPath: 'inset(0 0% 0 0)', ease: 'power2.out', duration: 0.8 });
  gsap.from('.quote__mark', { autoAlpha: 0, scale: 0.6, duration: 1.4, ease: EASE, scrollTrigger: { trigger: '.quote', start: 'top 70%', once: true } });
}

/* ——— Gallery: clip-path reveal + parallax bên trong khung ——— */
function initGallery(gsap) {
  $$('.bento__item').forEach((item, i) => {
    gsap.fromTo(item, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.4, ease: EASE, delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: item, start: 'top 90%', once: true },
    });
    const img = $('img', item);
    if (img) gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ——— Thuyền Rồng: sóng parallax nhiều lớp ——— */
function initBoat(gsap) {
  const st = { trigger: '#boat-scene', start: 'top bottom', end: 'bottom top', scrub: true };
  gsap.fromTo('[data-wave="back"]', { y: 10 }, { y: -6, ease: 'none', scrollTrigger: st });
  gsap.fromTo('[data-wave="mid"]', { y: 22 }, { y: -12, ease: 'none', scrollTrigger: st });
  gsap.fromTo('[data-wave="front"]', { y: 36 }, { y: -20, ease: 'none', scrollTrigger: st });
  gsap.from('#boat-scene', { autoAlpha: 0, scale: 0.94, y: 40, duration: 1.6, ease: EASE, scrollTrigger: { trigger: '#boat-scene', start: 'top 85%', once: true } });
  gsap.from('#boat-cards > li', { autoAlpha: 0, y: 50, rotateZ: (i) => (i % 2 ? 2 : -2), stagger: 0.1, duration: 1.2, ease: EASE, scrollTrigger: { trigger: '#boat-cards', start: 'top 85%', once: true } });
}

/* ——— Order: đường nối tự vẽ + từng bước pop ——— */
function initOrderTimeline(gsap) {
  const line = $('.timeline__line i');
  const steps = $$('#order-steps .step');
  if (!line || !steps.length) return;
  const horizontal = matchMedia('(min-width: 1024px)').matches;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#order-steps', start: 'top 80%', end: horizontal ? 'top 40%' : 'bottom 60%', scrub: horizontal ? 0.6 : 0.8 } });
  tl.fromTo(line, horizontal ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 }, { scaleX: 1, scaleY: 1, ease: 'none', duration: steps.length }, 0);
  steps.forEach((s, i) => {
    tl.from(s, { autoAlpha: 0, y: 24, scale: 0.92, ease: 'back.out(1.8)', duration: 0.6 }, i * 0.9);
    tl.from($('.step__dot', s), { scale: 0, ease: 'back.out(3)', duration: 0.5 }, i * 0.9);
  });
}
