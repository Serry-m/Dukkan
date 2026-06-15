-- ============================================================
-- DELIVERY FEE MIGRATION
-- Run once in the Supabase SQL editor. Idempotent.
-- Flat per-store delivery fee, added to the cart total and the
-- WhatsApp order message.
-- ============================================================

alter table stores add column if not exists delivery_fee numeric(10,2) not null default 0;
