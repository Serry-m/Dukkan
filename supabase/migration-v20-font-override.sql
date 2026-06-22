-- ============================================================
-- FONT OVERRIDE (storefront customization)
-- Run once in the Supabase SQL editor. Idempotent.
-- Lets a merchant pick a storefront font independent of the theme.
-- NULL = follow the theme's font (no regression for existing stores).
-- (card_style already exists from v3 and is reused for the card-shape picker.)
-- ============================================================

alter table stores add column if not exists font_override text;
