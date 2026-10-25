/* Nền trời sao lấp lánh (canvas) — nhẹ, tự dừng khi tab ẩn */
import { env } from './utils.js';

export function initSky(canvas) {
  if (!canvas?.getContext) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = env.reducedMotion;
  const low = env.lowPower;
  let w = 0, h = 0, dpr = 1, stars = [], raf = 0, running = false, frame = 0, shoot = null, nextShoot = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, env.mobile ? 1.25 : 1.75);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const density = env.mobile ? 70 : 160;
    const count = Math.round(density * (low ? 0.6 : 1) * Math.min(1.4, (w * h) / (1440 * 900) + 0.4));
    stars = Array.from({ length: count }, () => {
      const layer = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: layer > 0.92 ? 1.3 + Math.random() * 0.6 : 0.4 + Math.random() * 0.8,
        a: 0.25 + Math.random() * 0.6,
        s: 0.4 + Math.random() * 1.4,
        p: Math.random() * Math.PI * 2,
        d: 0.02 + layer * 0.08, // độ sâu cho parallax cuộn
        gold: Math.random() < 0.12,
      };
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const sy = reduced ? 0 : window.scrollY;
    for (const st of stars) {
      const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(t * 0.001 * st.s + st.p);
      let y = (st.y - sy * st.d) % h;
      if (y < 0) y += h;
      ctx.globalAlpha = st.a * tw;
      ctx.fillStyle = st.gold ? '#F3DDAB' : '#EDE9E3';
      ctx.beginPath();
      ctx.arc(st.x, y, st.r, 0, 6.2832);
      ctx.fill();
      if (st.r > 1.3) {
        ctx.globalAlpha = st.a * tw * 0.18;
        ctx.beginPath(); ctx.arc(st.x, y, st.r * 3.2, 0, 6.2832); ctx.fill();
      }
    }
    // Sao băng thỉnh thoảng
    if (!reduced && !low) {
      if (!shoot && t > nextShoot) {
        shoot = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.35, vx: -(4 + Math.random() * 3), vy: 2 + Math.random() * 1.5, life: 1 };
        nextShoot = t + 7000 + Math.random() * 9000;
      }
      if (shoot) {
        const { x, y, vx, vy } = shoot;
        const g = ctx.createLinearGradient(x, y, x - vx * 18, y - vy * 18);
        g.addColorStop(0, `rgba(255,244,214,${shoot.life})`);
        g.addColorStop(1, 'rgba(255,244,214,0)');
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - vx * 18, y - vy * 18); ctx.stroke();
        shoot.x += vx; shoot.y += vy; shoot.life -= 0.012;
        if (shoot.life <= 0 || shoot.x < -50 || shoot.y > h + 50) shoot = null;
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    frame++;
    if (low && frame % 2) return; // máy yếu: ~30fps
    draw(t);
  }
  function start() { if (running || reduced) return; running = true; nextShoot = performance.now() + 4000; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  build();
  draw(performance.now());
  start();

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (Math.abs(innerWidth - w) > 40 || Math.abs(innerHeight - h) > 160) { build(); draw(performance.now()); } }, 200);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
