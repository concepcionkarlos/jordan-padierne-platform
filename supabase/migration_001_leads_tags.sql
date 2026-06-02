-- Migration 001: Add tags and priority to leads
-- Run this in Supabase SQL Editor

-- Add tags array column to leads
alter table public.leads
  add column if not exists tags text[] default '{}';

-- Add hot_score column (1=cold, 2=warm, 3=hot) - auto-managed
alter table public.leads
  add column if not exists hot_score integer default 1 check (hot_score between 1 and 3);

-- Add last_contact tracking (update when note is added)
-- Already exists in schema: last_contact timestamptz

-- Index for tags
create index if not exists leads_tags_idx on public.leads using gin(tags);

-- Index for hot_score
create index if not exists leads_hot_score_idx on public.leads(hot_score desc);
