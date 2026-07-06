-- ============================================================
-- v24: PENDING PRO GRANTS (activate a subscription BEFORE a store exists)
-- Run once in the Supabase SQL editor. Idempotent.
-- Lets an admin grant Pro to an account that hasn't created a store yet.
-- The grant is parked here and auto-applied by a trigger the moment that
-- owner creates their store — no orphan/placeholder store needed.
-- ============================================================

create table if not exists pending_pro (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_expires_at timestamptz not null,
  granted_by text,
  created_at timestamptz not null default now()
);

-- Admin-only surface: RLS on with no policies → only the service role reaches it.
alter table pending_pro enable row level security;

-- When the owner finally creates their store, apply any pending Pro grant to it.
create or replace function apply_pending_pro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exp timestamptz;
begin
  select plan_expires_at into v_exp from pending_pro where user_id = new.owner_id;
  if v_exp is not null and v_exp > now() then
    new.plan := 'pro';
    new.plan_expires_at := v_exp;
    delete from pending_pro where user_id = new.owner_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_apply_pending_pro on stores;
create trigger trg_apply_pending_pro
  before insert on stores
  for each row execute function apply_pending_pro();
