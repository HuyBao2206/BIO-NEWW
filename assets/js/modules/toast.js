import { h } from './utils.js';

export function toast(message, { type = 'info', duration = 2600 } = {}) {
  const region = document.getElementById('toasts');
  if (!region) return;
  const t = h('div', { class: `toast${type === 'error' ? ' toast--error' : ''}`, text: message });
  region.append(t);
  while (region.children.length > 3) region.firstElementChild.remove();
  setTimeout(() => {
    t.classList.add('is-leaving');
    t.addEventListener('animationend', () => t.remove(), { once: true });
    setTimeout(() => t.remove(), 600);
  }, duration);
}
