-- ============================================================
-- BILLING / SUBSCRIPTION MIGRATION (Paymob)
-- Run once in the Supabase SQL editor. Idempotent.
-- ============================================================

-- Plan state on the store.
alter table stores add column if not exists plan text not null default 'free';        -- 'free' | 'pro'
alter table stores add column if not exists plan_expires_at timestamptz;               -- when Pro access ends

-- Payment log (one row per Paymob attempt). Used for records + webhook idempotency.
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid references stores(id) on delete cascade not null,
  amount          numeric(10,2) not null,
  paymob_order_id text,
  status          text not null default 'pending',   -- 'pending' | 'paid' | 'failed'
  created_at      timestamptz default now()
);

alter table payments enable row level security;

-- Owner can read their own payment history.
drop policy if exists "Owner can view their payments" on payments;
create policy "Owner can view their payments"
  on payments for select
  using (
    exists (
      select 1 from stores
      where stores.id = payments.store_id
        and stores.owner_id = auth.uid()
    )
  );

-- NOTE: the Paymob callback writes to payments + stores using the Supabase
-- SERVICE ROLE key (server-only), which bypasses RLS — so no public
-- insert/update policy is needed here.
