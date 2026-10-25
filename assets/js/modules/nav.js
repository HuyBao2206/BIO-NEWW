/* Điều hướng: thanh tiến độ, dock highlight, menu mobile, lên đầu trang */
import { $, $$, env } from './utils.js';

export function initNav({ scrollTo, stopScroll, startScroll }) {
  const bar = $('.scroll-progress span');
  const toTop = $('#to-top');
  const ring = $('.to-top__ring');
  const pill = $('.dock__pill');
  const links = $$('#nav-list a');

  /* ——— Tiến độ cuộn ——— */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      bar.style.transform = `scaleX(${p})`;
      ring.style.strokeDashoffset = String(1 - p);
      toTop.classList.toggle('is-visible', scrollY > innerHeight * 0.9);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => { scrollTo(0); $('.brand')?.focus({ preventScroll: true }); });

  /* ——— Link nội trang dùng chung một kiểu cuộn ——— */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    if (menuOpen) closeMenu(false);
    scrollTo(target);
    history.replaceState(null, '', `#${id}`);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ——— Highlight mục đang xem ——— */
  const movePill = (a) => {
    if (!a || !pill) { if (pill) pill.style.opacity = '0'; return; }
    pill.style.opacity = '1';
    pill.style.width = `${a.offsetWidth}px`;
    pill.style.transform = `translateX(${a.offsetLeft + 6}px)`;
  };
  let current = null;
  const setActive = (key) => {
    if (key === current) return;
    current = key;
    links.forEach((l) => l.setAttribute('aria-current', l.dataset.nav === key ? 'true' : 'false'));
    movePill(links.find((l) => l.dataset.nav === key));
  };
  const sections = $$('main > section[data-nav]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.dataset.nav); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
  addEventListener('resize', () => movePill(links.find((l) => l.dataset.nav === current)));

  /* ——— Menu mobile ——— */
  const btn = $('#menu-btn');
  const overlay = $('#menu-overlay');
  let menuOpen = false;
  const focusables = () => [btn, ...$$('a', overlay)];
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    const items = focusables();
    const i = items.indexOf(document.activeElement);
    e.preventDefault();
    const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i === items.length - 1 ? 0 : i + 1);
    items[next].focus();
  };
  function openMenu() {
    menuOpen = true;
    overlay.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    btn.querySelector('.sr-only').textContent = 'Đóng menu';
    stopScroll?.();
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.addEventListener('keydown', onKey);
    setTimeout(() => overlay.querySelector('a')?.focus({ preventScroll: true }), 60);
  }
  function closeMenu(restoreFocus = true) {
    menuOpen = false;
    overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.querySelector('.sr-only').textContent = 'Mở menu';
    document.body.style.overflow = '';
    startScroll?.();
    document.removeEventListener('keydown', onKey);
    if (restoreFocus) btn.focus({ preventScroll: true });
    setTimeout(() => { if (!menuOpen) overlay.hidden = true; }, env.reducedMotion ? 0 : 450);
  }
  btn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches && menuOpen) closeMenu(false); });
}
