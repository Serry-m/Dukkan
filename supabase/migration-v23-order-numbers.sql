-- ============================================================
-- v23: SEQUENTIAL PER-STORE ORDER NUMBERS
-- Run once in the Supabase SQL editor. Idempotent.
-- Orders get a human number (#1001, #1002 …) that restarts per store,
-- instead of a code derived from the internal id.
-- ============================================================

alter table orders add column if not exists order_number integer;

-- Backfill existing orders: number them per store by creation time, from 1001.
with numbered as (
  select id, 1000 + row_number() over (partition by store_id order by created_at) as n
  from orders
  where order_number is null
)
update orders o set order_number = numbered.n
from numbered where o.id = numbered.id;

-- Place an order with the next per-store number and return it. Runs as definer
-- so the anonymous storefront can both write the order and read back its number
-- (orders are owner-only on SELECT). An advisory lock serializes numbering per
-- store so two simultaneous orders can't collide.
create or replace function place_order(
  p_store_id uuid,
  p_items jsonb,
  p_total numeric,
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_notes text,
  p_coupon_code text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_num integer;
begin
  perform pg_advisory_xact_lock(hashtext(p_store_id::text));
  select coalesce(max(order_number), 1000) + 1 into v_num from orders where store_id = p_store_id;
  insert into orders (store_id, order_number, items, total, customer_name, customer_phone, customer_address, notes, coupon_code, status)
  values (
    p_store_id, v_num, p_items, p_total,
    nullif(btrim(p_customer_name), ''),
    nullif(btrim(p_customer_phone), ''),
    nullif(btrim(p_customer_address), ''),
    nullif(btrim(p_notes), ''),
    nullif(btrim(p_coupon_code), ''),
    'pending'
  );
  return v_num;
end $$;

grant execute on function place_order(uuid, jsonb, numeric, text, text, text, text, text) to anon, authenticated;
