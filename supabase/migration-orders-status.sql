-- ============================================================
-- ORDER MANAGEMENT MIGRATION
-- Run this in the Supabase SQL editor.
-- Adds a "status" column so owners can track each order, and the
-- RLS policies that let an owner UPDATE / DELETE their own orders.
-- ============================================================

-- 1. Status column: pending (جديد) -> confirmed (تم التأكيد) -> delivered (تم التسليم)
alter table orders add column if not exists status text not null default 'pending';

-- 2. Allow the store owner to update their own orders (change status)
drop policy if exists "Owner can update their orders" on orders;
create policy "Owner can update their orders"
  on orders for update
  using (
    exists (
      select 1 from stores
      where stores.id = orders.store_id
        and stores.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from stores
      where stores.id = orders.store_id
        and stores.owner_id = auth.uid()
    )
  );

-- 3. Allow the store owner to delete their own orders
drop policy if exists "Owner can delete their orders" on orders;
create policy "Owner can delete their orders"
  on orders for delete
  using (
    exists (
      select 1 from stores
      where stores.id = orders.store_id
        and stores.owner_id = auth.uid()
    )
  );
