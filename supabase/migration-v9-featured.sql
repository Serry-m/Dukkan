-- ============================================================
-- FEATURED / PINNED PRODUCTS (Pro)
-- Run once in the Supabase SQL editor. Idempotent.
-- Featured products surface first and carry a "مميز" badge.
-- ============================================================

alter table products add column if not exists featured boolean not null default false;
