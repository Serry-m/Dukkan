-- v21: product visibility (publish / hide on the storefront)
-- A hidden product stays in the dashboard but is removed from the public store.
alter table products add column if not exists hidden boolean not null default false;
