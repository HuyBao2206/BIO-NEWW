/* Mini game "This or That" — chạy hoàn toàn trên trình duyệt, không lưu trạng thái (tải lại = chơi lại) */
import { $, $$, h, env, onVisible } from './utils.js';
import { confetti } from './hero.js';

export function initThisOrThat(cfg) {
  const data = cfg.thisOrThat;
  const root = $('#tot-game');
  if (!root || !data?.questions?.length) return;
  const qs = data.questions;
  const total = qs.length;
  const autoMs = data.autoNextMs ?? 2500;
  let index = 0, answers = [], answered = false, autoT = 0, inView = false;

  /* ——— Khung cố định ——— */
  const stepEl = h('p', { class: 'tot__step', 'aria-live': 'polite' });
  const bar = h('span');
  const progress = h('div', { class: 'tot__progress' }, stepEl, h('div', { class: 'tot__bar', 'aria-hidden': 'true' }, bar));
  const stage = h('div', { class: 'tot__stage' });
  root.replaceChildren(progress, stage);

  const pct = () => (Math.min(index + (answered ? 1 : 0), total) / total);
  const setProgress = () => {
    stepEl.replaceChildren('Câu ', h('b', { text: Math.min(index + 1, total) }), ` / ${total}`);
    bar.style.transform = `scaleX(${pct()})`;
  };

  const focusInside = () => root.contains(document.activeElement);
  const animateIn = (el) => {
    if (!el.animate) return;
    el.animate(env.reducedMotion
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [{ opacity: 0, transform: 'translateY(18px) scale(.98)' }, { opacity: 1, transform: 'none' }],
    { duration: env.reducedMotion ? 250 : 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
  };

  /* ——— Một câu hỏi ——— */
  function card(q, side) {
    const label = side === 'a' ? q.a : q.b;
    const emoji = side === 'a' ? q.emojiA : q.emojiB;
    const color = side === 'a' ? q.colorA : q.colorB;
    const face = (cls, extra) => h('span', { class: `tot-card__face ${cls}` },
      extra,
      emoji ? h('span', { class: 'tot-card__emoji', 'aria-hidden': 'true', text: emoji }) : h('span', { class: 'tot-card__swatch', 'aria-hidden': 'true' }),
      h('span', { class: 'tot-card__label', text: label }));
    const btn = h('button', {
      class: `tot-card${color ? ' tot-card--color' : ''}`, type: 'button', 'data-side': side,
      'aria-label': `${label}${side === 'a' ? ' (phím ←)' : ' (phím →)'}`,
      style: color ? { '--c': color, '--ink': isLight(color) ? '#1A1407' : '#FFF6EC' } : null,
    },
    h('span', { class: 'tot-card__tag', 'aria-hidden': 'true', text: 'Bạn chọn' }),
    h('span', { class: 'tot-card__inner' },
      face('tot-card__face--front'),
      face('tot-card__face--back', h('span', { class: 'tot-card__hub', text: 'HUB chọn ✦' }))));
    btn.addEventListener('click', () => pick(side));
    return btn;
  }

  function renderQuestion() {
    answered = false;
    clearTimeout(autoT);
    const q = qs[index];
    const a = card(q, 'a'), b = card(q, 'b');
    const fb = h('div', { class: 'tot__feedback', 'aria-live': 'polite' });
    const view = h('div', { class: 'tot__q' },
      h('p', { class: 'tot__ask', text: 'Bạn chọn bên nào?' }),
      h('div', { class: 'tot__cards', role: 'group', 'aria-label': `${q.a} hay ${q.b}` }, a, h('span', { class: 'tot__or', 'aria-hidden': 'true', text: 'hay' }), b),
      fb);
    stage.replaceChildren(view);
    setProgress();
    animateIn(view);
    return view;
  }

  function pick(side) {
    if (answered) return;
    answered = true;
    const q = qs[index];
    const same = side === q.hubPick;
    answers[index] = { side, same };
    const cards = $$('.tot-card', stage);
    cards.forEach((c) => {
      const s = c.dataset.side;
      c.disabled = true;
      c.classList.toggle('is-picked', s === side);
      c.classList.toggle('is-hub', s === q.hubPick);
      c.classList.toggle('is-dim', s !== side && s !== q.hubPick);
      c.setAttribute('aria-pressed', String(s === side));
    });
    setProgress();
    const last = index === total - 1;
    const next = h('button', { class: 'btn btn--gold tot__next', type: 'button', style: { '--auto': `${autoMs}ms` } },
      h('span', { text: last ? 'Xem kết quả' : 'Tiếp' }), h('span', { 'aria-hidden': 'true', text: ' →' }), h('i', { class: 'tot__auto', 'aria-hidden': 'true' }));
    next.addEventListener('click', goNext);
    const fb = $('.tot__feedback', stage);
    fb.classList.add(same ? 'is-same' : 'is-diff');
    fb.replaceChildren(
      h('p', { class: 'tot__verdict', text: same ? 'Giống nhau rồi! ✨' : 'HUB lại chọn bên kia 😝' }),
      q.hubNote ? h('p', { class: 'tot__note' }, h('b', { text: 'HUB: ' }), `“${q.hubNote}”`) : null,
      next);
    animateIn(fb);
    if (focusInside() || document.activeElement === document.body) next.focus({ preventScroll: true });
    autoT = setTimeout(goNext, autoMs);
  }

  function goNext() {
    clearTimeout(autoT);
    if (!answered) return;
    const hadFocus = focusInside();
    index++;
    if (index >= total) return renderResult(hadFocus);
    renderQuestion();
    if (hadFocus) $('.tot-card', stage)?.focus({ preventScroll: true });
  }

  /* ——— Kết quả ——— */
  function renderResult(hadFocus) {
    const score = answers.filter((x) => x.same).length;
    const ending = (data.endings || []).find((e) => score >= e.min && score <= e.max);
    const num = h('b', { class: 'tot__score-num', text: env.reducedMotion ? score : 0 });
    const chips = h('ul', { class: 'tot__chips', 'aria-label': 'Tóm tắt từng câu' }, qs.map((q, i) => {
      const ans = answers[i];
      const mine = ans.side === 'a' ? q.a : q.b;
      const hub = q.hubPick === 'a' ? q.a : q.b;
      return h('li', { class: `tot-chip ${ans.same ? 'is-same' : 'is-diff'}` },
        h('span', { class: 'tot-chip__mark', 'aria-hidden': 'true', text: ans.same ? '✓' : '✗' }),
        h('span', { class: 'sr-only', text: ans.same ? 'Giống: ' : 'Khác: ' }),
        ans.same ? mine : `${mine} · HUB: ${hub}`);
    }));
    const again = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Chơi lại' });
    again.addEventListener('click', () => { index = 0; answers = []; renderQuestion(); $('.tot-card', stage)?.focus({ preventScroll: true }); });
    const view = h('div', { class: 'tot__result' },
      h('p', { class: 'tot__score', 'aria-live': 'polite' }, 'Ta giống nhau ', num, h('span', { text: `/${total}` })),
      ending ? h('p', { class: 'tot__ending', text: ending.text }) : null,
      chips,
      h('div', { class: 'tot__actions' }, again, h('a', { class: 'btn btn--gold', href: '#luu-but', 'data-magnetic': '' }, 'Để lại lời nhắn cho HUB')));
    stage.replaceChildren(view);
    stepEl.replaceChildren('Hoàn thành ', h('b', { text: total }), ` / ${total}`);
    bar.style.transform = 'scaleX(1)';
    animateIn(view);
    if (hadFocus) again.focus({ preventScroll: true });
    // Đếm số
    if (!env.reducedMotion) {
      const t0 = performance.now(), dur = 900 + score * 80;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        num.textContent = Math.round(score * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    if (score === total) setTimeout(confetti, env.reducedMotion ? 0 : 700);
  }

  /* ——— Bàn phím: ← → chọn, Enter tiếp ——— */
  onVisible(root, (v) => { inView = v; }, { threshold: 0.35 });
  document.addEventListener('keydown', (e) => {
    if (!inView && !focusInside()) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (e.target.closest?.('.carousel__track, [role="tablist"]')) return;
    if (!answered && index < total && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      pick(e.key === 'ArrowLeft' ? 'a' : 'b');
    } else if (answered && index < total && e.key === 'Enter' && !(tag === 'button' || tag === 'a')) {
      e.preventDefault();
      goNext();
    }
  });

  renderQuestion();
}

function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
}
