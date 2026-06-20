-- ============================================================
-- STOCK QUANTITY (optional inventory count)
-- Run once in the Supabase SQL editor. Idempotent.
-- Optional per-product quantity. When NULL, the product uses the simple
-- in_stock on/off toggle (existing behaviour). When set, it drives low-stock
-- urgency ("متبقّي N") and auto out-of-stock at 0. Manual count — never
-- auto-decremented (orders go out over WhatsApp and may not complete).
-- ============================================================

alter table products add column if not exists stock_quantity integer;

alter table products drop constraint if exists products_stock_qty_nonneg;
alter table products add constraint products_stock_qty_nonneg check (stock_quantity is null or stock_quantity >= 0);
