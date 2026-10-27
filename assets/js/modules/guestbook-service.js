/* Guestbook service — interface chung: list(page), create(entry), subscribe(cb)
 * 2 implementation: Supabase (thật) và localStorage (chế độ demo).
 * Muốn đổi backend khác: viết thêm 1 hàm trả về object cùng interface. */
import { store } from './utils.js';

const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.116.0/dist/umd/supabase.js';
const TABLE = 'guestbook_entries';
const COLUMNS = 'id, created_at, name, message, mood, is_pinned';

/* Chấp nhận cả khi lỡ dán kèm "/rest/v1/" hay dấu "/" cuối — supabase-js tự thêm phần đó */
const normalizeUrl = (u) => String(u || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '').replace(/\/+$/, '');

export function createGuestbookService(cfg) {
  const url = normalizeUrl(cfg.supabaseUrl);
  const ready = url && cfg.supabaseKey && /^https:\/\//.test(url);
  return ready ? supabaseService({ ...cfg, supabaseUrl: url }) : demoService(cfg);
}

/* ———————————————— Supabase ———————————————— */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = resolve; s.onerror = () => reject(new Error('Không tải được thư viện Supabase'));
    document.head.append(s);
  });
}

function friendlyError(err) {
  // Ghi lỗi gốc ra Console (F12) để dễ tìm nguyên nhân; khách chỉ thấy câu thân thiện
  console.warn('[Sổ lưu bút] Supabase lỗi:', err);
  const msg = String(err?.message || err || '');
  if (/PGRST205|Could not find the table|relation .* does not exist/i.test(msg)) return 'Sổ lưu bút chưa được cài đặt xong (thiếu bảng dữ liệu).';
  if (/Invalid API key|JWT|apikey|No API key/i.test(msg)) return 'Khoá kết nối sổ lưu bút chưa đúng.';
  if (/permission denied|row-level security/i.test(msg)) return 'Sổ lưu bút chưa được cấp quyền đúng.';
  if (/flood|too many/i.test(msg)) return 'Sổ lưu bút đang hơi đông, bạn thử lại sau ít phút nhé.';
  if (/check constraint|violates/i.test(msg)) return 'Nội dung chưa hợp lệ, bạn kiểm tra lại giúp mình nhé.';
  if (/fetch|network|Failed|timeout/i.test(msg)) return 'Mất kết nối mạng, bạn thử lại nhé.';
  return 'Có lỗi xảy ra, bạn thử lại sau nhé.';
}

function supabaseService(cfg) {
  let clientP = null;
  const client = () => (clientP ||= (window.supabase?.createClient ? Promise.resolve() : loadScript(SUPABASE_CDN))
    .then(() => window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })));

  return {
    mode: 'supabase',
    async list(page = 0) {
      const sb = await client();
      const size = cfg.pageSize;
      const { data, error, count } = await sb.from(TABLE)
        .select(COLUMNS, { count: 'exact' })
        .eq('is_visible', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(page * size, page * size + size - 1);
      if (error) throw new Error(friendlyError(error));
      return { items: data || [], total: count ?? (data || []).length, hasMore: (page + 1) * size < (count || 0) };
    },
    async create({ name, message, mood }) {
      const sb = await client();
      const { data, error } = await sb.from(TABLE).insert({ name, message, mood: mood || null }).select(COLUMNS).single();
      if (error) throw new Error(friendlyError(error));
      return data;
    },
    subscribe(cb) {
      let channel = null, stopped = false;
      client().then((sb) => {
        if (stopped) return;
        channel = sb.channel('guestbook-inserts')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: TABLE }, (payload) => {
            const row = payload.new;
            if (row && row.is_visible !== false) cb(row);
          })
          .subscribe();
      }).catch(() => {});
      return () => { stopped = true; channel?.unsubscribe(); };
    },
  };
}

/* ———————————————— Demo (localStorage) ———————————————— */
function demoService(cfg) {
  const KEY = 'hub:guestbook:demo';
  const all = () => (store.get(KEY, []) || []).sort((a, b) => (b.is_pinned - a.is_pinned) || (new Date(b.created_at) - new Date(a.created_at)));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  return {
    mode: 'demo',
    async list(page = 0) {
      await wait(450);
      const rows = all();
      const size = cfg.pageSize;
      return { items: rows.slice(page * size, page * size + size), total: rows.length, hasMore: (page + 1) * size < rows.length };
    },
    async create({ name, message, mood }) {
      await wait(700);
      const row = { id: uid(), created_at: new Date().toISOString(), name, message, mood: mood || null, is_pinned: false };
      store.set(KEY, [row, ...(store.get(KEY, []) || [])].slice(0, 300));
      return row;
    },
    subscribe(cb) {
      // Mô phỏng realtime giữa các tab của cùng trình duyệt
      const onStorage = (e) => {
        if (e.key !== KEY || !e.newValue) return;
        try {
          const rows = JSON.parse(e.newValue);
          const old = new Set((JSON.parse(e.oldValue || '[]')).map((r) => r.id));
          rows.filter((r) => !old.has(r.id)).forEach(cb);
        } catch { /* bỏ qua */ }
      };
      addEventListener('storage', onStorage);
      return () => removeEventListener('storage', onStorage);
    },
  };
}
