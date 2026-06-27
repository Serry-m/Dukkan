-- ============================================================
-- v22: COUPON EXPIRY + USAGE LIMIT
-- Run once in the Supabase SQL editor. Idempotent.
-- Adds an optional expiry date and usage cap to coupons, and teaches the
-- checkout validator (get_coupon) to refuse expired / used-up codes.
-- ============================================================

alter table coupons add column if not exists expires_at timestamptz;
alter table coupons add column if not exists usage_limit integer;

create or replace function get_coupon(p_store_id uuid, p_code text)
returns table(type text, value numeric)
language sql
security definer
set search_path = public
as $$
  select c.type, c.value
  from coupons c
  join stores s on s.id = c.store_id
  where c.store_id = p_store_id
    and lower(c.code) = lower(p_code)
    and c.active = true
    and s.plan = 'pro'
    and s.plan_expires_at is not null
    and s.plan_expires_at > now()
    -- not expired
    and (c.expires_at is null or c.expires_at > now())
    -- under the usage cap (counts orders that already used this code)
    and (c.usage_limit is null or (
      select count(*) from orders o
      where o.store_id = c.store_id and lower(o.coupon_code) = lower(c.code)
    ) < c.usage_limit)
  limit 1;
$$;

grant execute on function get_coupon(uuid, text) to anon, authenticated;
