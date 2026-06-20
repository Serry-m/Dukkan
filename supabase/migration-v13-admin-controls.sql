-- ============================================================
-- ADMIN CONTROLS (pre-launch operator safety)
-- Run once in the Supabase SQL editor. Idempotent.
-- Adds: store suspend kill-switch, one-store-per-owner constraint,
-- and an admin audit log.
-- ============================================================

-- 1) Suspend kill-switch — a suspended store is hidden from the public
--    storefront (data preserved) until an admin un-suspends it.
alter table stores add column if not exists suspended boolean not null default false;

-- 2) One store per owner. The dashboard assumes this (queries with .single()),
--    so enforce it at the DB level. NOTE: if any owner already has 2+ stores,
--    this ALTER fails — remove the duplicates first, then re-run.
alter table stores drop constraint if exists stores_owner_unique;
alter table stores add constraint stores_owner_unique unique (owner_id);

-- 3) Admin audit log — every admin action (plan change, suspend, delete) is
--    recorded. Written/read only via the service-role admin client (RLS on,
--    no public policies = locked to service role, which bypasses RLS).
create table if not exists admin_actions (
  id              bigint generated always as identity primary key,
  admin_email     text not null,
  action          text not null,         -- 'grant' | 'extend' | 'revoke' | 'suspend' | 'unsuspend' | 'delete_store' | 'delete_account'
  target_store_id uuid,
  target_email    text,
  detail          text,
  created_at      timestamptz default now()
);

alter table admin_actions enable row level security;
