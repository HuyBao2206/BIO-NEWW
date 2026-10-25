/* Sổ lưu bút — form, danh sách, realtime, optimistic UI. Dữ liệu người dùng LUÔN render bằng textContent. */
import { $, h, hues, initial, timeAgo, fullDate, store, cleanInput, env } from './utils.js';
import { createGuestbookService } from './guestbook-service.js';
import { toast } from './toast.js';

const KEY_NAME = 'hub:gb:name';
const KEY_LAST = 'hub:gb:last';
const LINK_RE = /(https?:\/\/|www\.)/i;

export function initGuestbook(cfg) {
  const g = cfg.guestbook;
  const svc = createGuestbookService(g);
  const form = $('#gb-form');
  const nameIn = $('#gb-name'), msgIn = $('#gb-msg'), hp = $('#gb-website');
  const nameErr = $('#gb-name-err'), msgErr = $('#gb-msg-err'), count = $('#gb-msg-count');
  const submit = $('#gb-submit'), status = $('#gb-status');
  const list = $('#gb-list'), more = $('#gb-more'), totalEl = $('#gb-total');
  const seen = new Set();
  let page = 0, total = 0, startedAt = 0, sending = false;

  if (svc.mode === 'demo') $('#gb-demo').hidden = false;
  nameIn.maxLength = g.maxName;
  msgIn.maxLength = g.maxMessage;
  nameIn.value = store.get(KEY_NAME, '') || '';

  /* —— Sticker —— */
  const moods = $('#gb-moods');
  g.moods.forEach((m) => moods.append(h('label', { class: 'mood' },
    h('input', { type: 'radio', name: 'mood', value: m, 'aria-label': `Sticker ${m}` }),
    h('span', { 'aria-hidden': 'true', text: m }))));
  // bấm lại sticker đang chọn để bỏ chọn
  let wasChecked = null;
  moods.addEventListener('pointerdown', (e) => { wasChecked = e.target.closest('.mood')?.querySelector('input')?.checked ?? null; });
  moods.addEventListener('click', (e) => {
    if (e.target.tagName !== 'INPUT') return;
    if (wasChecked) e.target.checked = false;
    wasChecked = null;
  });

  /* —— Bộ đếm ký tự —— */
  const updateCount = () => {
    const n = [...msgIn.value].length;
    count.textContent = `${n} / ${g.maxMessage}`;
    count.classList.toggle('is-near', n > g.maxMessage * 0.85);
    count.classList.toggle('is-over', n > g.maxMessage);
  };
  msgIn.addEventListener('input', () => { updateCount(); if (msgIn.getAttribute('aria-invalid') === 'true') validate('msg'); });
  nameIn.addEventListener('input', () => { if (nameIn.getAttribute('aria-invalid') === 'true') validate('name'); });
  form.addEventListener('focusin', () => { if (!startedAt) startedAt = Date.now(); }, { once: true });
  updateCount();

  /* —— Validation tiếng Việt —— */
  function validate(only) {
    const name = cleanInput(nameIn.value);
    const message = cleanInput(msgIn.value, { multiline: true });
    let ok = true;
    if (!only || only === 'name') {
      let err = '';
      const len = [...name].length;
      if (!len) err = 'Bạn cho mình xin tên nhé.';
      else if (len < g.minName) err = `Tên cần ít nhất ${g.minName} ký tự.`;
      else if (len > g.maxName) err = `Tên tối đa ${g.maxName} ký tự.`;
      else if (g.blockLinks && LINK_RE.test(name)) err = 'Tên không được chứa đường link.';
      nameErr.textContent = err; nameIn.setAttribute('aria-invalid', String(!!err)); ok = ok && !err;
    }
    if (!only || only === 'msg') {
      let err = '';
      const len = [...message].length;
      if (!len) err = 'Bạn chưa viết lời nhắn nào.';
      else if (len > g.maxMessage) err = `Lời nhắn tối đa ${g.maxMessage} ký tự.`;
      else if (g.blockLinks && LINK_RE.test(message)) err = 'Lời nhắn không được chứa đường link (http, www).';
      msgErr.textContent = err; msgIn.setAttribute('aria-invalid', String(!!err)); ok = ok && !err;
    }
    return ok ? { name, message } : null;
  }

  const setStatus = (text, kind = '') => { status.textContent = text; status.className = `gb-status${kind ? ` is-${kind}` : ''}`; };

  /* —— Thẻ lời nhắn —— */
  function noteEl(row, { isNew = false, pending = false } = {}) {
    const el = h('li', { class: `note${isNew ? ' is-new' : ''}${pending ? ' is-pending' : ''}${row.is_pinned ? ' is-pinned' : ''}` });
    for (const [k, v] of Object.entries(hues(row.name))) el.style.setProperty(k, v);
    const time = h('time', { class: 'note__time', datetime: row.created_at, title: fullDate(row.created_at), text: pending ? 'đang gửi…' : timeAgo(row.created_at) });
    const nameNode = h('p', { class: 'note__name' });
    nameNode.textContent = row.name; // textContent: không bao giờ thực thi HTML
    if (row.is_pinned) nameNode.append(h('span', { class: 'note__pin', text: '· đã ghim' }));
    const msg = h('p', { class: 'note__msg' });
    msg.textContent = row.message;
    el.append(h('span', { class: 'note__avatar', 'aria-hidden': 'true', text: initial(row.name) }), nameNode, time, msg);
    if (row.mood && g.moods.includes(row.mood)) el.append(h('span', { class: 'note__mood', 'aria-label': `Sticker ${row.mood}`, text: row.mood }));
    el.dataset.id = row.id || '';
    el.__time = time;
    return el;
  }

  const setTotal = () => {
    totalEl.replaceChildren(total ? h('b', { text: total }) : '', total ? 'lời nhắn đã ghé lại' : '');
  };
  const clearState = () => list.querySelectorAll('.gb-skel, .gb-empty, .gb-error').forEach((x) => x.remove());
  const showEmpty = () => { if (!list.querySelector('.note')) list.append(h('li', { class: 'gb-empty' }, h('p', {}, h('span', { class: 'big', text: 'Hãy là người đầu tiên để lại dấu chân ✦' }), 'Một lời chào, một kỷ niệm, hay đơn giản là “mình đã ghé qua”.'))); };
  const skeleton = () => { for (let i = 0; i < 4; i++) list.append(h('li', { class: 'gb-skel', 'aria-hidden': 'true' })); };

  function insertTop(el) {
    const firstUnpinned = [...list.querySelectorAll('.note')].find((n) => !n.classList.contains('is-pinned'));
    if (firstUnpinned) list.insertBefore(el, firstUnpinned); else list.append(el);
  }

  async function load() {
    list.setAttribute('aria-busy', 'true');
    if (page === 0) { clearState(); skeleton(); }
    more.disabled = true;
    try {
      const res = await svc.list(page);
      clearState();
      total = res.total;
      res.items.forEach((r) => { if (seen.has(r.id)) return; seen.add(r.id); list.append(noteEl(r)); });
      if (!list.querySelector('.note')) showEmpty();
      more.hidden = !res.hasMore;
      setTotal();
      page++;
    } catch (err) {
      clearState();
      const retry = h('button', { class: 'btn btn--ghost', type: 'button', text: 'Thử lại' });
      retry.addEventListener('click', () => { retry.closest('.gb-error')?.remove(); load(); });
      list.append(h('li', { class: 'gb-error' }, h('p', { text: err.message || 'Không tải được lời nhắn.' }), retry));
    } finally {
      more.disabled = false;
      list.setAttribute('aria-busy', 'false');
    }
  }
  more.addEventListener('click', load);

  /* —— Gửi —— */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    setStatus('');
    if (hp.value) { setStatus('Đã gửi, cảm ơn bạn!', 'ok'); form.reset(); return; } // bot
    const data = validate();
    if (!data) { (nameIn.getAttribute('aria-invalid') === 'true' ? nameIn : msgIn).focus(); return; }
    const last = Number(store.get(KEY_LAST, 0)) || 0;
    const wait = Math.ceil(g.cooldownSeconds - (Date.now() - last) / 1000);
    if (wait > 0) { setStatus(`Bạn vừa gửi rồi — đợi ${wait} giây nữa nhé.`, 'error'); return; }
    if (!startedAt || (Date.now() - startedAt) / 1000 < g.minFillSeconds) { setStatus('Bạn viết nhanh quá! Đợi vài giây rồi gửi lại nhé.', 'error'); return; }

    const mood = form.querySelector('input[name="mood"]:checked')?.value || null;
    sending = true;
    submit.classList.add('is-loading');
    submit.setAttribute('aria-busy', 'true');
    // Optimistic UI
    const temp = { id: `temp-${Date.now()}`, created_at: new Date().toISOString(), name: data.name, message: data.message, mood, is_pinned: false };
    clearState();
    const tempEl = noteEl(temp, { isNew: true, pending: true });
    insertTop(tempEl);
    try {
      const row = await svc.create({ ...data, mood });
      seen.add(row.id);
      // cập nhật thẻ tạm thành thẻ thật (giữ hiệu ứng highlight)
      tempEl.classList.remove('is-pending');
      tempEl.dataset.id = row.id;
      tempEl.__time.setAttribute('datetime', row.created_at);
      tempEl.__time.title = fullDate(row.created_at);
      tempEl.__time.textContent = timeAgo(row.created_at);
      total++; setTotal();
      store.set(KEY_NAME, data.name);
      store.set(KEY_LAST, Date.now());
      flyPlane();
      msgIn.value = ''; updateCount();
      form.querySelectorAll('input[name="mood"]').forEach((x) => { x.checked = false; });
      startedAt = Date.now();
      setStatus('Đã gửi! Cảm ơn bạn đã ghé qua ✦', 'ok');
      toast('Lời nhắn đã bay đi ✦');
    } catch (err) {
      tempEl.remove();
      showEmptyIfNeeded();
      setStatus(err.message || 'Gửi chưa được, bạn thử lại nhé.', 'error');
    } finally {
      sending = false;
      submit.classList.remove('is-loading');
      submit.removeAttribute('aria-busy');
    }
  });
  const showEmptyIfNeeded = () => { if (!list.querySelector('.note')) showEmpty(); };

  /* —— Máy bay giấy —— */
  function flyPlane() {
    if (env.reducedMotion) return;
    const icon = submit.querySelector('.gb-plane');
    const r = icon.getBoundingClientRect();
    const plane = icon.cloneNode(true);
    plane.classList.add('plane-fly');
    plane.style.left = `${r.left}px`; plane.style.top = `${r.top}px`;
    document.body.append(plane);
    icon.style.opacity = '0';
    const dx = Math.min(innerWidth - r.left - 40, 520), dy = -Math.min(r.top + 40, 420);
    const a = plane.animate([
      { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.25}px, ${dy * 0.05}px) rotate(-8deg) scale(1.3)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.55}px) rotate(-28deg) scale(1.1)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) rotate(-40deg) scale(.6)`, opacity: 0 },
    ], { duration: 1500, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' });
    a.onfinish = () => { plane.remove(); icon.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 400, fill: 'forwards' }); icon.style.opacity = ''; };
  }

  /* —— Realtime —— */
  svc.subscribe((row) => {
    if (seen.has(row.id)) return;
    seen.add(row.id);
    clearState();
    insertTop(noteEl(row, { isNew: true }));
    total++; setTotal();
  });

  /* —— Cập nhật "x phút trước" —— */
  setInterval(() => list.querySelectorAll('.note').forEach((n) => {
    if (n.__time && !n.classList.contains('is-pending')) n.__time.textContent = timeAgo(n.__time.getAttribute('datetime'));
  }), 60000);

  // Chỉ tải khi gần tới section (tiết kiệm request)
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '600px' });
  io.observe($('#luu-but'));
}
