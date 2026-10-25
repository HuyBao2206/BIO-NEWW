/* Preloader: monogram + % tải thật (font + ảnh hero) → "Chạm để bước vào" */
import { $, store, env, loadImage } from './utils.js';

const KEY_VISITED = 'hub:visited';
const KEY_MUSIC = 'hub:music'; // 'on' | 'off'

export function runPreloader({ avatar, hasMusic }) {
  const root = $('#preloader');
  const pct = $('#preloader-pct');
  const actions = $('#preloader-actions');
  const enterBtn = $('#enter-btn');
  const silentBtn = $('#enter-silent');
  const returning = !!store.get(KEY_VISITED);
  const maxWait = returning ? 900 : 2500;
  const start = performance.now();

  return new Promise((resolve) => {
    if (!root || !document.documentElement.classList.contains('is-loading')) {
      return resolve({ withMusic: false, gesture: false });
    }

    // Các tác vụ cần chờ: font + avatar
    const tasks = [
      document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve(),
      loadImage(avatar),
    ];
    let done = 0;
    let shown = 0;
    tasks.forEach((p) => p.then(() => { done++; }));

    const allDone = Promise.all(tasks);
    const timeout = new Promise((r) => setTimeout(r, maxWait));
    let finished = false;
    Promise.race([allDone, timeout]).then(() => { finished = true; });

    const tick = () => {
      const real = finished ? 100 : (done / tasks.length) * 100;
      // không vượt quá tiến độ thật; tăng mượt
      const elapsed = performance.now() - start;
      const timeCap = Math.min(99, (elapsed / maxWait) * 100);
      const target = finished ? 100 : Math.min(real, Math.max(timeCap, real * 0.9));
      shown += (target - shown) * 0.18;
      if (target - shown < 0.6) shown = target;
      pct.textContent = Math.round(shown);
      if (shown >= 100) return ready();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    function ready() {
      store.set(KEY_VISITED, 1);
      root.classList.add('is-ready');
      const pref = store.get(KEY_MUSIC);
      // Lần sau: nếu không có nhạc hoặc đã chọn tắt nhạc → vào thẳng, không cần chạm
      if (returning && (!hasMusic || pref === 'off')) return leave(false, false);
      actions.hidden = false;
      silentBtn.hidden = !hasMusic;
      enterBtn.focus({ preventScroll: true });
      enterBtn.addEventListener('click', () => leave(hasMusic, true), { once: true });
      silentBtn.addEventListener('click', () => leave(false, true), { once: true });
    }

    function leave(withMusic, gesture) {
      if (hasMusic && gesture) store.set(KEY_MUSIC, withMusic ? 'on' : 'off');
      window.__hubReady = true;
      const done = () => {
        document.documentElement.classList.remove('is-loading');
        root.remove();
      };
      // Curtain: thu vòng tròn về phía nút bấm
      const r = gesture ? enterBtn.getBoundingClientRect() : null;
      const cx = r ? r.left + r.width / 2 : innerWidth / 2, cy = r ? r.top + r.height / 2 : innerHeight / 2;
      if (env.reducedMotion || !root.animate) {
        root.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
        setTimeout(done, 300);
      } else {
        const a = root.animate([
          { clipPath: `circle(150% at ${cx}px ${cy}px)` },
          { clipPath: `circle(0% at ${cx}px ${cy}px)` },
        ], { duration: 1100, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' });
        a.onfinish = done;
        setTimeout(done, 1400);
      }
      resolve({ withMusic, gesture });
    }
  });
}
