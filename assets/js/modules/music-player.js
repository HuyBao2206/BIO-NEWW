/* Mini music player — chỉ nhạc không bản quyền từ config.music.playlist.
 * Chỉ tạo <audio> & phát sau khi người dùng chạm. Web Audio cho visualizer + fade âm lượng. */
import { $, h, svg, store, env } from './utils.js';
import { ICONS } from './icons.js';

const KEY = 'hub:player';
const FADE_MS = 600;

export function createPlayer(cfg) {
  const list = cfg.music?.playlist || [];
  const root = $('#player');
  if (!list.length || !root) return null; // playlist trống → ẩn hoàn toàn

  const saved = store.get(KEY, { volume: 0.6, muted: false }) || {};
  let volume = typeof saved.volume === 'number' ? saved.volume : 0.6;
  let muted = !!saved.muted;
  let index = 0, audio = null, actx = null, gain = null, analyser = null, data = null, playing = false, panelOpen = false, vizRaf = 0;

  /* —— UI —— */
  const disc = h('span', { class: 'player__disc', 'aria-hidden': 'true' });
  const title = h('span', { class: 'player__title' });
  const meta = h('div', { class: 'player__meta' }, title);
  const vizCanvas = h('canvas', { class: 'player__viz', width: 68, height: 44, 'aria-hidden': 'true' });
  const vizCss = h('span', { class: 'player__viz-css', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'));
  const playBtn = h('button', { class: 'pbtn pbtn--main', type: 'button', 'aria-label': 'Phát nhạc' }, svg(ICONS.play));
  const nextBtn = h('button', { class: 'pbtn', type: 'button', 'aria-label': 'Bài kế tiếp' }, svg(ICONS.skip));
  const muteBtn = h('button', { class: 'pbtn', type: 'button', 'aria-label': 'Tắt tiếng (phím M)', 'aria-pressed': 'false' }, svg(ICONS.volume));
  const vol = h('input', { class: 'player__vol', type: 'range', min: '0', max: '1', step: '0.01', value: String(volume), 'aria-label': 'Âm lượng' });
  const listBtn = h('button', { class: 'pbtn', type: 'button', 'aria-label': 'Danh sách bài & nguồn nhạc', 'aria-expanded': 'false', 'aria-controls': 'player-panel' }, svg(ICONS.list));
  const pill = h('div', { class: 'player__pill', role: 'region', 'aria-label': 'Trình phát nhạc nền' }, disc, meta, vizCss, playBtn, nextBtn, muteBtn, vol, listBtn);
  const panel = h('div', { class: 'player__panel', id: 'player-panel', hidden: true },
    h('h3', { text: 'Nhạc nền' }),
    h('ul', { class: 'player__list' }, list.map((t, i) => h('li', {}, h('button', { type: 'button', 'data-i': i },
      h('span', { class: 'n', text: String(i + 1).padStart(2, '0') }), h('span', { text: t.title }), h('small', { text: t.artist }))))),
    h('p', { class: 'player__credits' }, 'Nhạc không bản quyền: ', ...list.flatMap((t, i) => [
      i ? ' · ' : '', `${t.title} — ${t.artist}`, t.source ? ' (' : '',
      t.source ? (t.sourceUrl ? h('a', { href: t.sourceUrl, target: '_blank', rel: 'noopener noreferrer', text: t.source }) : t.source) : '', t.source ? ')' : ''])));
  root.replaceChildren(panel, pill);
  root.hidden = false;

  const setTitle = () => {
    const t = list[index];
    title.replaceChildren(t.title, ' ', h('small', { text: `— ${t.artist}` }));
    title.classList.remove('is-marquee');
    requestAnimationFrame(() => title.classList.toggle('is-marquee', !env.reducedMotion && title.scrollWidth > meta.clientWidth + 4));
    panel.querySelectorAll('[data-i]').forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.i) === index)));
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: 'HUB · Moonlit Journey' });
    }
  };
  const renderState = () => {
    root.classList.toggle('is-playing', playing);
    playBtn.replaceChildren(svg(playing ? ICONS.pause : ICONS.play));
    playBtn.setAttribute('aria-label', playing ? 'Tạm dừng' : 'Phát nhạc');
    muteBtn.replaceChildren(svg(muted ? ICONS.mute : ICONS.volume));
    muteBtn.setAttribute('aria-pressed', String(muted));
    muteBtn.setAttribute('aria-label', muted ? 'Bật tiếng (phím M)' : 'Tắt tiếng (phím M)');
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  };
  const save = () => store.set(KEY, { volume, muted });
  setTitle(); renderState();

  /* —— Audio (tạo khi người dùng chạm lần đầu) —— */
  function ensureAudio() {
    if (audio) return;
    audio = new Audio();
    audio.preload = 'none';
    audio.addEventListener('ended', () => next());
    audio.addEventListener('error', () => { if (playing) next(); });
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      try {
        actx = new AC();
        const src = actx.createMediaElementSource(audio);
        gain = actx.createGain();
        analyser = actx.createAnalyser();
        analyser.fftSize = 64;
        data = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser); analyser.connect(gain); gain.connect(actx.destination);
        gain.gain.value = 0;
        vizCss.replaceWith(vizCanvas);
      } catch { actx = null; gain = null; }
    }
    if (!gain) audio.volume = 0;
    load(index);
  }
  function load(i) { index = (i + list.length) % list.length; audio.src = list[index].src; setTitle(); }

  const targetVol = () => (muted ? 0 : volume);
  let fadeRaf = 0;
  function fadeTo(v, ms = FADE_MS) {
    cancelAnimationFrame(fadeRaf);
    if (gain && actx) {
      const now = actx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(v, now + ms / 1000);
      return new Promise((r) => setTimeout(r, ms));
    }
    // Fallback (iOS bỏ qua audio.volume, nhưng vẫn phát bình thường)
    const from = audio.volume, t0 = performance.now();
    return new Promise((r) => {
      const step = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        audio.volume = Math.max(0, Math.min(1, from + (v - from) * k));
        if (k < 1) fadeRaf = requestAnimationFrame(step); else r();
      };
      fadeRaf = requestAnimationFrame(step);
    });
  }

  async function play() {
    ensureAudio();
    try {
      await actx?.resume();
      await audio.play();
      playing = true; renderState(); fadeTo(targetVol()); startViz();
    } catch { playing = false; renderState(); }
  }
  async function pause() {
    if (!audio) return;
    playing = false; renderState();
    await fadeTo(0);
    if (!playing) audio.pause();
  }
  async function next() {
    ensureAudio();
    const was = playing || audio.paused === false;
    if (was) await fadeTo(0, 300);
    load(index + 1);
    if (was || playing) play();
  }
  function toggleMute() {
    muted = !muted; save(); renderState();
    if (audio && playing) fadeTo(targetVol(), 250);
  }

  /* —— Visualizer —— */
  function startViz() {
    if (!analyser || vizRaf || env.reducedMotion) return;
    const ctx = vizCanvas.getContext('2d');
    const draw = () => {
      if (!playing || document.hidden) { vizRaf = 0; ctx.clearRect(0, 0, 68, 44); return; }
      vizRaf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, 68, 44);
      const bars = 7, bw = 6, gap = 3.6;
      for (let i = 0; i < bars; i++) {
        const v = data[Math.min(data.length - 1, 1 + i * 2)] / 255;
        const bh = Math.max(4, v * 40);
        const g = ctx.createLinearGradient(0, 44, 0, 44 - bh);
        g.addColorStop(0, '#C99A4B'); g.addColorStop(1, '#F3DDAB');
        ctx.fillStyle = g;
        ctx.fillRect(i * (bw + gap) + 2, 44 - bh, bw, bh);
      }
    };
    draw();
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && playing) startViz(); });

  /* —— Sự kiện —— */
  playBtn.addEventListener('click', () => (playing ? pause() : play()));
  nextBtn.addEventListener('click', () => next());
  muteBtn.addEventListener('click', toggleMute);
  vol.addEventListener('input', () => {
    volume = Number(vol.value);
    if (volume > 0 && muted) muted = false;
    save(); renderState();
    if (audio && playing) fadeTo(targetVol(), 80);
  });
  listBtn.addEventListener('click', () => {
    panelOpen = !panelOpen;
    panel.hidden = !panelOpen;
    listBtn.setAttribute('aria-expanded', String(panelOpen));
  });
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    ensureAudio(); load(Number(b.dataset.i)); play();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) { listBtn.click(); listBtn.focus(); }
    if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      toggleMute();
    }
  });
  document.addEventListener('pointerdown', (e) => { if (panelOpen && !root.contains(e.target)) listBtn.click(); });
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('nexttrack', next);
    } catch { /* trình duyệt không hỗ trợ */ }
  }

  return { play, pause };
}
