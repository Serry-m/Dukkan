-- ============================================================
-- COUPON PLAN ENFORCEMENT
-- Run once in the Supabase SQL editor. Idempotent.
-- Coupons are a Pro feature — make the checkout validator refuse codes for
-- free / lapsed-Pro stores, so a downgrade actually disables coupons.
-- ============================================================

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
  limit 1;
$$;

grant execute on function get_coupon(uuid, text) to anon, authenticated;
