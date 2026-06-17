-- ============================================================
-- COUPONS / PROMO CODES (Pro)
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================

create table if not exists coupons (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid references stores(id) on delete cascade not null,
  code        text not null,
  type        text not null default 'percent',   -- 'percent' | 'fixed'
  value       numeric(10,2) not null,
  active      boolean not null default true,
  created_at  timestamptz default now(),
  unique (store_id, code)
);

alter table coupons enable row level security;

-- Only the store owner can read/write their coupons (the public never lists them).
drop policy if exists "Owner manages coupons" on coupons;
create policy "Owner manages coupons"
  on coupons for all
  using (exists (select 1 from stores where stores.id = coupons.store_id and stores.owner_id = auth.uid()))
  with check (exists (select 1 from stores where stores.id = coupons.store_id and stores.owner_id = auth.uid()));

-- Validate a code without exposing the coupon list to the public.
create or replace function get_coupon(p_store_id uuid, p_code text)
returns table(type text, value numeric)
language sql
security definer
set search_path = public
as $$
  select c.type, c.value
  from coupons c
  where c.store_id = p_store_id
    and lower(c.code) = lower(p_code)
    and c.active = true
  limit 1;
$$;

grant execute on function get_coupon(uuid, text) to anon, authenticated;

-- Record the coupon used on an order.
alter table orders add column if not exists coupon_code text;
