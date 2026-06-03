-- Migration 006: Web push subscriptions (Jordan's devices)
-- Run in Supabase SQL Editor

create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  endpoint text not null unique,
  subscription jsonb not null,
  label text
);

alter table public.push_subscriptions enable row level security;

create policy "Push subs accessible by authenticated users"
  on public.push_subscriptions for all
  using (auth.role() = 'authenticated');
