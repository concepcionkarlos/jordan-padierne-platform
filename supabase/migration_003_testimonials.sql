-- Migration 003: Testimonials / client reviews
-- Run in Supabase SQL Editor

create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  client_name text not null,
  client_role text,
  rating integer not null default 5 check (rating between 1 and 5),
  quote text not null,
  location text,
  featured boolean not null default true,
  sort_order integer default 0
);

alter table public.testimonials enable row level security;

-- Public can read featured testimonials (shown on the website)
create policy "Testimonials readable by all"
  on public.testimonials for select
  using (true);

-- Only authenticated admin can manage
create policy "Testimonials writable by authenticated users"
  on public.testimonials for all
  using (auth.role() = 'authenticated');
