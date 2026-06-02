-- Migration 002: Appointments + Deal/Commission tracking
-- Run this in Supabase SQL Editor (after migration 001)

-- ─── Deal & commission fields on leads ──────────────────────
alter table public.leads add column if not exists deal_value numeric;
alter table public.leads add column if not exists commission_rate numeric default 3;
alter table public.leads add column if not exists expected_close date;
alter table public.leads add column if not exists close_probability integer default 50 check (close_probability between 0 and 100);
alter table public.leads add column if not exists closed_at timestamptz;

-- ─── Appointments ───────────────────────────────────────────
create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references public.leads(id) on delete set null,
  title text not null,
  type text not null default 'showing',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  notes text,
  status text not null default 'scheduled'
);

alter table public.appointments enable row level security;

create policy "Appointments accessible by authenticated users"
  on public.appointments for all
  using (auth.role() = 'authenticated');

create index if not exists appointments_starts_idx on public.appointments(starts_at);
create index if not exists appointments_lead_idx on public.appointments(lead_id);
create index if not exists appointments_status_idx on public.appointments(status);

create trigger appointments_updated_at
  before update on public.appointments
  for each row execute procedure public.handle_updated_at();

-- ─── Goal settings (seed) ───────────────────────────────────
insert into public.settings (key, value) values
  ('monthly_close_goal', '2'),
  ('daily_activity_goal', '5'),
  ('default_commission_rate', '3'),
  ('avg_deal_value', '650000')
on conflict (key) do nothing;
