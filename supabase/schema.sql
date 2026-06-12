-- Run this in the Supabase SQL editor to create your database.
-- Supabase already provides an "auth.users" table for free — we just
-- reference it with owner_id so we know which store belongs to whom.

-- ============================================================
-- STORES TABLE
-- One row per business owner. The "slug" is the unique URL path
-- customers will visit, e.g. /store/mahmoud-gadgets
-- ============================================================
create table stores (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references auth.users(id) on delete cascade not null,
  slug             text unique not null,
  name             text not null,
  description      text,
  logo_url         text,
  whatsapp_number  text not null,
  currency         text not null default 'EGP',
  created_at       timestamptz default now()
);

-- Owners can only read/write their own store
alter table stores enable row level security;

create policy "Owner can manage their store"
  on stores for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Customers (anonymous) can read any store by slug
create policy "Anyone can view stores"
  on stores for select
  using (true);

-- ============================================================
-- PRODUCTS TABLE
-- Each product belongs to a store. sort_order lets the owner
-- reorder products on their storefront.
-- ============================================================
create table products (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid references stores(id) on delete cascade not null,
  name         text not null,
  description  text,
  price        numeric(10,2) not null,
  image_url    text,
  in_stock     boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz default now()
);

alter table products enable row level security;

-- Owners manage products through their store
create policy "Owner can manage their products"
  on products for all
  using (
    exists (
      select 1 from stores
      where stores.id = products.store_id
        and stores.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from stores
      where stores.id = products.store_id
        and stores.owner_id = auth.uid()
    )
  );

-- Customers can read products of any store
create policy "Anyone can view products"
  on products for select
  using (true);

-- ============================================================
-- STORAGE BUCKET
-- Run this separately or create it in the Supabase dashboard:
-- Storage > New Bucket > name: "store-assets" > Public: true
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('store-assets', 'store-assets', true);
