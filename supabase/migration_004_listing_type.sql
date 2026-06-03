-- Migration 004: Listing purpose (sale / rent / investment)
-- Run in Supabase SQL Editor

alter table public.properties
  add column if not exists listing_type text not null default 'sale';
-- values: 'sale' (For Sale) · 'rent' (For Rent) · 'investment' (Investment)

create index if not exists properties_listing_type_idx on public.properties(listing_type);
