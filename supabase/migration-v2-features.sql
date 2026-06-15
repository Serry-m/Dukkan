-- ============================================================
-- دكان v2 FEATURE MIGRATION
-- Run this once in the Supabase SQL editor.
-- Adds: delivery info on orders, store open/closed + custom message
-- template + view counter, product categories + variants.
-- All statements are idempotent (safe to re-run).
-- ============================================================

-- ----- ORDERS: delivery address + notes -----
alter table orders add column if not exists customer_address text;
alter table orders add column if not exists notes text;

-- ----- STORES: open/closed, custom WhatsApp message, view counter -----
alter table stores add column if not exists is_open boolean not null default true;
alter table stores add column if not exists message_template text;
alter table stores add column if not exists view_count integer not null default 0;

-- ----- PRODUCTS: category + variants -----
-- category is a free-text label the owner types (e.g. "أقراط").
alter table products add column if not exists category text;
-- options is a jsonb array of { name, values[] } option groups, e.g.
-- [{ "name": "المقاس", "values": ["S","M","L"] }, { "name": "اللون", "values": ["أحمر","أزرق"] }]
alter table products add column if not exists options jsonb not null default '[]'::jsonb;

-- ----- ANALYTICS: atomic view-count increment -----
-- Called from the storefront to bump the counter without a read-modify-write race.
create or replace function increment_store_views(store_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update stores set view_count = view_count + 1 where slug = store_slug;
$$;

-- Allow anonymous storefront visitors to call it.
grant execute on function increment_store_views(text) to anon, authenticated;
