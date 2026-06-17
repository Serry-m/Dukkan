-- ============================================================
-- SALE / DISCOUNT PRICING
-- Run once in the Supabase SQL editor. Idempotent.
-- sale_price is the discounted price; it applies only when it is set,
-- greater than 0, and lower than the regular price.
-- ============================================================

alter table products add column if not exists sale_price numeric(10,2);
