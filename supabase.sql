-- Run this in Supabase SQL Editor to enable optional shared dashboard sync.
create table if not exists public.dashboard_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.dashboard_state enable row level security;

-- This deliberately allows anonymous visitors to read and update the single
-- shared dashboard record. Anyone with the public site URL can change it.
-- Use only for non-sensitive bookmarks/preferences.
create policy "Public can read dashboard"
on public.dashboard_state for select
to anon, authenticated
using (id = 'main');

create policy "Public can insert dashboard"
on public.dashboard_state for insert
to anon, authenticated
with check (id = 'main');

create policy "Public can update dashboard"
on public.dashboard_state for update
to anon, authenticated
using (id = 'main')
with check (id = 'main');

grant select, insert, update on public.dashboard_state to anon, authenticated;
