-- ============================================================
-- Jordan Padierne Platform — Supabase Schema
-- ============================================================
-- Run this in your Supabase SQL Editor to set up the database.

-- ─── Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users / Auth ───────────────────────────────────────────
-- Supabase Auth handles users (auth.users table).
-- We extend it with a profiles table for admin metadata.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'admin',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── Leads ──────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  client_type text not null default 'Buyer',
  source text not null default 'Website',
  status text not null default 'new',
  pipeline_stage text not null default 'NEW',
  preferred_area text,
  budget_min numeric,
  budget_max numeric,
  timeline text,
  property_interest text,
  financing_status text,
  message text,
  notes text,
  assigned_to uuid references auth.users(id),
  last_contact timestamptz,
  next_followup timestamptz,
  metadata jsonb
);

alter table public.leads enable row level security;

create policy "Leads accessible by authenticated users"
  on public.leads for all
  using (auth.role() = 'authenticated');

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_pipeline_idx on public.leads(pipeline_stage);
create index if not exists leads_created_idx on public.leads(created_at desc);

-- ─── Contacts ───────────────────────────────────────────────
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text not null,
  client_type text,
  preferred_area text,
  budget_min numeric,
  budget_max numeric,
  notes text,
  lead_id uuid references public.leads(id) on delete set null
);

alter table public.contacts enable row level security;

create policy "Contacts accessible by authenticated users"
  on public.contacts for all
  using (auth.role() = 'authenticated');

-- ─── Properties ─────────────────────────────────────────────
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text,
  price numeric not null,
  bedrooms integer,
  bathrooms numeric,
  sqft integer,
  address text not null,
  city text not null,
  state text not null default 'FL',
  zip text,
  status text not null default 'available',
  type text not null default 'condo',
  is_pre_construction boolean not null default false,
  is_luxury boolean not null default false,
  featured boolean not null default false,
  images text[] default '{}',
  mls_number text,
  year_built integer,
  hoa_fee numeric,
  parking integer,
  pool boolean default false,
  waterfront boolean default false,
  metadata jsonb
);

alter table public.properties enable row level security;

create policy "Properties readable by all"
  on public.properties for select
  using (true);

create policy "Properties writable by authenticated users"
  on public.properties for all
  using (auth.role() = 'authenticated');

create index if not exists properties_status_idx on public.properties(status);
create index if not exists properties_featured_idx on public.properties(featured);
create index if not exists properties_pre_construction_idx on public.properties(is_pre_construction);

-- ─── Messages ───────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null default 'contact',
  full_name text not null,
  email text not null,
  phone text,
  subject text,
  body text not null,
  status text not null default 'unread',
  lead_id uuid references public.leads(id) on delete set null,
  metadata jsonb
);

alter table public.messages enable row level security;

-- Allow anonymous inserts (website form submissions)
create policy "Anyone can submit a message"
  on public.messages for insert
  with check (true);

create policy "Messages readable by authenticated users"
  on public.messages for select
  using (auth.role() = 'authenticated');

create policy "Messages updatable by authenticated users"
  on public.messages for update
  using (auth.role() = 'authenticated');

create index if not exists messages_status_idx on public.messages(status);
create index if not exists messages_type_idx on public.messages(type);
create index if not exists messages_created_idx on public.messages(created_at desc);

-- ─── Notes ──────────────────────────────────────────────────
create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  content text not null,
  author text not null default 'Jordan',
  lead_id uuid references public.leads(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade
);

alter table public.notes enable row level security;

create policy "Notes accessible by authenticated users"
  on public.notes for all
  using (auth.role() = 'authenticated');

-- ─── Tasks ──────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date timestamptz,
  lead_id uuid references public.leads(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  assigned_to uuid references auth.users(id),
  completed_at timestamptz
);

alter table public.tasks enable row level security;

create policy "Tasks accessible by authenticated users"
  on public.tasks for all
  using (auth.role() = 'authenticated');

create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- ─── Pipeline ───────────────────────────────────────────────
create table if not exists public.pipeline_entries (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  stage text not null default 'NEW',
  notes text,
  expected_close timestamptz,
  deal_value numeric,
  moved_at timestamptz default now()
);

alter table public.pipeline_entries enable row level security;

create policy "Pipeline accessible by authenticated users"
  on public.pipeline_entries for all
  using (auth.role() = 'authenticated');

-- ─── Settings ───────────────────────────────────────────────
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "Settings accessible by authenticated users"
  on public.settings for all
  using (auth.role() = 'authenticated');

-- ─── Form Submissions ───────────────────────────────────────
-- Archive table for all raw form submissions (audit trail)
create table if not exists public.form_submissions (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  form_type text not null,
  data jsonb not null,
  lead_id uuid references public.leads(id) on delete set null,
  ip_address text,
  user_agent text
);

alter table public.form_submissions enable row level security;

create policy "Anyone can submit a form"
  on public.form_submissions for insert
  with check (true);

create policy "Form submissions readable by authenticated users"
  on public.form_submissions for select
  using (auth.role() = 'authenticated');

-- ─── Updated_at Trigger ─────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute procedure public.handle_updated_at();

create trigger contacts_updated_at
  before update on public.contacts
  for each row execute procedure public.handle_updated_at();

create trigger properties_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

create trigger messages_updated_at
  before update on public.messages
  for each row execute procedure public.handle_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

create trigger pipeline_entries_updated_at
  before update on public.pipeline_entries
  for each row execute procedure public.handle_updated_at();

-- ─── Seed Default Settings ──────────────────────────────────
insert into public.settings (key, value) values
  ('site_name', '"Jordan Padierne Real Estate"'),
  ('contact_email', '"info@jordanpadierne.com"'),
  ('contact_phone', '"305-799-6973"'),
  ('license_number', '"SL3641062"'),
  ('broker_name', '"eXp Realty"'),
  ('notification_email', '"info@jordanpadierne.com"'),
  ('email_integration_active', 'false'),
  ('whatsapp_integration_active', 'false')
on conflict (key) do nothing;
