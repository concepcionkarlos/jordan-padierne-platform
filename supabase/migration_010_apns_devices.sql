-- APNs device tokens for the native iOS app's push notifications. Kept separate
-- from web push_subscriptions (different transport: APNs token vs Web Push endpoint).
-- The app upserts its token on launch; the server sends through these.
create table if not exists public.apns_devices (
  id uuid primary key default uuid_generate_v4(),
  token text not null unique,
  platform text not null default 'ios',
  label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apns_devices_token_idx on public.apns_devices(token);

alter table public.apns_devices enable row level security;

create policy "apns_devices accessible by authenticated users"
  on public.apns_devices for all
  using (auth.role() = 'authenticated');
