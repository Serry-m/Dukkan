-- ============================================================
-- ORDER INSERT HARDENING
-- Run once in the Supabase SQL editor. Idempotent.
-- Anonymous customers can insert orders (needed for checkout), and the client
-- supplies the row. This trigger forces every NEW order to status='pending'
-- regardless of what the client sends, so a malicious request can't insert an
-- order pre-marked 'delivered' (which would inflate the revenue dashboard).
-- The owner still advances status normally via an authenticated UPDATE.
-- ============================================================

create or replace function force_order_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.status := 'pending';
  return new;
end;
$$;

drop trigger if exists trg_force_order_defaults on orders;
create trigger trg_force_order_defaults
  before insert on orders
  for each row execute function force_order_defaults();
