-- Migration 009: email verification (double opt-in) — pending registrations
-- A submission with a real email is held here until the person clicks the
-- verification link; only then is the lead created in the CRM. Run in Supabase.

create table if not exists public.pending_leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  token text not null unique,
  kind text not null default 'form',   -- 'form' | 'subscribe'
  email text not null,
  payload jsonb not null,
  expires_at timestamptz not null
);

alter table public.pending_leads enable row level security;

drop policy if exists "Pending leads service only" on public.pending_leads;
create policy "Pending leads service only"
  on public.pending_leads for all using (auth.role() = 'authenticated');

create index if not exists pending_leads_token_idx on public.pending_leads(token);
create index if not exists pending_leads_expires_idx on public.pending_leads(expires_at);
