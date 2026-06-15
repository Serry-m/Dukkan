-- ============================================================
-- CATEGORY ORDER + STORE CUSTOMIZATION MIGRATION
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================

-- Owner-defined order of category chips on the storefront.
alter table stores add column if not exists category_order text[] not null default '{}';

-- Extra storefront design controls.
-- layout: 'grid' (2-col cards) or 'list' (stacked rows)
alter table stores add column if not exists layout text not null default 'grid';
-- font: 'cairo' (default) | 'tajawal' | 'almarai'
alter table stores add column if not exists font text not null default 'cairo';
-- optional wide banner image shown at the top of the storefront
alter table stores add column if not exists banner_url text;
-- rounded corners style: 'rounded' | 'sharp'
alter table stores add column if not exists card_style text not null default 'rounded';
