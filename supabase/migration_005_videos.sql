-- Migration 005: YouTube videos (managed by Jordan, shown on the site)
-- Run in Supabase SQL Editor

create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  youtube_id text not null,
  title text,
  featured boolean not null default true,
  sort_order integer default 0
);

alter table public.videos enable row level security;

create policy "Videos readable by all"
  on public.videos for select using (true);

create policy "Videos writable by authenticated users"
  on public.videos for all using (auth.role() = 'authenticated');
