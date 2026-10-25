/* Dịch vụ: FAQ accordion (ARIA) + copy số điện thoại */
import { $$, copyText, isPending } from './utils.js';
import { toast } from './toast.js';

export async function copyPhone(phone) {
  if (isPending(phone)) return;
  const ok = await copyText(String(phone).trim());
  toast(ok ? 'Đã copy số điện thoại ✓' : 'Không copy được, bạn chép tay giúp mình nhé', { type: ok ? 'info' : 'error' });
}

export function initFaq() {
  $$('.faq__item').forEach((item) => {
    const btn = item.querySelector('.faq__q');
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
}
