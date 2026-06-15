-- ============================================================
-- MULTI-PHOTO PRODUCTS MIGRATION
-- Run once in the Supabase SQL editor. Idempotent.
-- Adds an images array (up to 3 used by the app). image_url stays as the
-- primary/thumbnail (= images[0]) for backward compatibility.
-- ============================================================

alter table products add column if not exists images text[] not null default '{}';

-- Backfill: existing single-image products get their image_url as images[0].
update products
set images = array[image_url]
where image_url is not null
  and (images is null or array_length(images, 1) is null);
