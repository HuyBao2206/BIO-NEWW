-- =====================================================================
--  SỔ LƯU BÚT — Supabase schema (chạy 1 lần trong SQL Editor)
--  An toàn khi chạy lại nhiều lần.
-- =====================================================================

create extension if not exists pgcrypto;

create table if not exists public.guestbook_entries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  message     text not null,
  mood        text null,
  is_visible  boolean not null default true,
  is_pinned   boolean not null default false,
  constraint guestbook_name_len    check (char_length(btrim(name)) between 1 and 40),
  constraint guestbook_message_len check (char_length(btrim(message)) between 1 and 500),
  -- Danh sách sticker phải khớp với CONFIG.guestbook.moods trong assets/js/config.js
  constraint guestbook_mood_valid  check (mood is null or mood in ('🌙', '✨', '🌊', '🌸', '🎧', '💌'))
);

create index if not exists guestbook_entries_list_idx
  on public.guestbook_entries (is_pinned desc, created_at desc)
  where is_visible;

-- ---------------------------------------------------------------------
--  Trigger trước khi insert: ép created_at = now(), trim dữ liệu, chặn flood
-- ---------------------------------------------------------------------
create or replace function public.guestbook_before_insert()
returns trigger
language plpgsql
security definer           -- để đếm được cả các lời nhắn đã ẩn
set search_path = public
as $$
declare
  max_per_window int := 20;                    -- ngưỡng: tối đa 20 lời nhắn…
  window_size    interval := interval '10 minutes'; -- …trong 10 phút (toàn bảng)
  recent int;
begin
  new.created_at := now();
  new.name := btrim(regexp_replace(new.name, '\s+', ' ', 'g'));
  new.message := btrim(new.message);
  new.is_visible := true;
  new.is_pinned := false;

  select count(*) into recent
  from public.guestbook_entries
  where created_at > now() - window_size;

  if recent >= max_per_window then
    raise exception 'flood: too many guestbook entries, try again later'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists guestbook_before_insert on public.guestbook_entries;
create trigger guestbook_before_insert
  before insert on public.guestbook_entries
  for each row execute function public.guestbook_before_insert();

-- ---------------------------------------------------------------------
--  Bảo mật: RLS + quyền tối thiểu cho anon
-- ---------------------------------------------------------------------
alter table public.guestbook_entries enable row level security;

revoke all on public.guestbook_entries from anon, authenticated;
grant select on public.guestbook_entries to anon, authenticated;
-- chỉ cho phép ghi 3 cột này; các cột còn lại do default/trigger quyết định
grant insert (name, message, mood) on public.guestbook_entries to anon, authenticated;

drop policy if exists "guestbook_select_visible" on public.guestbook_entries;
create policy "guestbook_select_visible"
  on public.guestbook_entries for select
  to anon, authenticated
  using (is_visible = true);

drop policy if exists "guestbook_insert_anon" on public.guestbook_entries;
create policy "guestbook_insert_anon"
  on public.guestbook_entries for insert
  to anon, authenticated
  with check (is_visible = true and is_pinned = false);

-- KHÔNG có policy update/delete → khách không sửa/xoá được.
-- Chủ site kiểm duyệt trong Table Editor (tắt is_visible hoặc xoá dòng).

-- ---------------------------------------------------------------------
--  Realtime: lời nhắn mới hiện ngay cho người đang xem
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guestbook_entries'
  ) then
    alter publication supabase_realtime add table public.guestbook_entries;
  end if;
end $$;
