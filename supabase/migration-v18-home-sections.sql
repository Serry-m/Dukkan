-- ============================================================
-- HOME SECTIONS (merchant-controlled storefront blocks) + store type
-- Run once in the Supabase SQL editor. Idempotent.
-- Optional, toggleable home-page sections so each merchant composes a
-- storefront that fits what they sell. store_type just drives sensible
-- defaults in the settings UI.
-- ============================================================

alter table stores add column if not exists store_type text;                                   -- 'fashion' | 'food' | 'electronics' | 'home' | 'other' | null
alter table stores add column if not exists announcement_enabled boolean not null default false;
alter table stores add column if not exists announcement_text text;
alter table stores add column if not exists show_collection_tiles boolean not null default false;

alter table stores drop constraint if exists stores_announcement_len;
alter table stores add constraint stores_announcement_len check (announcement_text is null or char_length(announcement_text) <= 120);
