-- ============================================================
-- STOREFRONT THEMES
-- Run once in the Supabase SQL editor. Idempotent.
-- A theme is a cohesive look (font + surfaces + card treatment).
-- 'modern' and 'minimal' are free; 'elegant' and 'bold' are Pro.
-- ============================================================

alter table stores add column if not exists theme text not null default 'modern';
