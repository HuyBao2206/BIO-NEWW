/* Điểm khởi động — ghép các module lại với nhau */
import { CONFIG } from './config.js';
import { $, hydrateMedia } from './modules/utils.js';
import { renderAll } from './modules/render.js';
import { initSky } from './modules/sky.js';
import { initHero, initEmailCopy, prepareHeroIntro } from './modules/hero.js';
import { initScroll, initScrollMotion } from './modules/motion.js';
import { initNav } from './modules/nav.js';
import { initGallery } from './modules/gallery.js';
import { initFavorites } from './modules/favorites.js';
import { initFaq, copyPhone } from './modules/services.js';
import { initGuestbook } from './modules/guestbook.js';
import { createPlayer } from './modules/music-player.js';
import { initMagnetic, initTilt, initCursor } from './modules/fx.js';
import { runPreloader } from './modules/preloader.js';

/* Mỗi module chạy độc lập: một lỗi không làm hỏng phần còn lại */
const safe = (name, fn) => { try { return fn(); } catch (err) { console.warn(`[HUB] ${name} lỗi:`, err); return undefined; } };

const libs = {
  gsap: window.gsap,
  ScrollTrigger: window.ScrollTrigger,
  SplitText: window.SplitText,
  Lenis: window.Lenis,
};
if (libs.gsap) {
  const plugins = [libs.ScrollTrigger, libs.SplitText].filter(Boolean);
  if (plugins.length) libs.gsap.registerPlugin(...plugins);
  document.documentElement.classList.add('has-gsap');
}

safe('render', () => renderAll(CONFIG, { copyPhone }));
safe('sky', () => initSky($('#sky')));
safe('hero', () => initHero(CONFIG));
safe('email', () => initEmailCopy());
safe('faq', () => initFaq());
safe('favorites', () => initFavorites(CONFIG));
const scroll = safe('scroll', () => initScroll(libs)) || { scrollTo: (t) => (t === 0 ? scrollTo(0, 0) : t.scrollIntoView()), stop() {}, start() {} };
safe('nav', () => initNav({ scrollTo: scroll.scrollTo, stopScroll: scroll.stop, startScroll: scroll.start }));
safe('gallery', () => initGallery(CONFIG.gallery, scroll));
safe('guestbook', () => initGuestbook(CONFIG));
const player = safe('player', () => createPlayer(CONFIG));
safe('fx', () => { initMagnetic(); initTilt(); initCursor(); });
safe('media', () => hydrateMedia());

const playIntro = safe('intro', () => prepareHeroIntro(libs.gsap, libs.SplitText)) || (() => {});
safe('scroll-motion', () => initScrollMotion(libs));

scroll.stop();
runPreloader({ avatar: CONFIG.profile.avatar, hasMusic: !!player })
  .then(({ withMusic, gesture }) => {
    scroll.start();
    window.__hubReady = true;
    safe('intro-play', () => playIntro());
    if (withMusic && gesture && player) player.play();
    libs.ScrollTrigger?.refresh();
  })
  .catch((err) => {
    console.warn('[HUB] preloader lỗi:', err);
    document.documentElement.classList.remove('is-loading');
    scroll.start();
  });
