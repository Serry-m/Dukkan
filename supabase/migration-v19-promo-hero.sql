-- ============================================================
-- PROMO HERO OVERLAY (merchant-controlled)
-- Run once in the Supabase SQL editor. Idempotent.
-- Optional headline + subtitle shown over the cover banner (a sale/launch
-- message), with a "shop now" button that jumps to the products.
-- ============================================================

alter table stores add column if not exists promo_enabled boolean not null default false;
alter table stores add column if not exists promo_title text;
alter table stores add column if not exists promo_subtitle text;

alter table stores drop constraint if exists stores_promo_title_len;
alter table stores add constraint stores_promo_title_len check (promo_title is null or char_length(promo_title) <= 60);

alter table stores drop constraint if exists stores_promo_subtitle_len;
alter table stores add constraint stores_promo_subtitle_len check (promo_subtitle is null or char_length(promo_subtitle) <= 80);
