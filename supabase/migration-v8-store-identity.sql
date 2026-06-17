-- ============================================================
-- STORE IDENTITY (about, location, hours, social links)
-- Run once in the Supabase SQL editor. Idempotent.
-- Gives the storefront a real shop identity. All FREE.
-- ============================================================

alter table stores add column if not exists about text;
alter table stores add column if not exists location text;
alter table stores add column if not exists working_hours text;
alter table stores add column if not exists instagram text;
alter table stores add column if not exists facebook text;
alter table stores add column if not exists tiktok text;
