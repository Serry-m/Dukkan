-- ============================================================
-- PAYMENT METHODS (display-only)
-- Run once in the Supabase SQL editor. Idempotent.
-- Dukkan never processes money — these just tell the customer HOW to pay
-- the merchant (InstaPay / Vodafone Cash / cash on delivery), shown on the
-- storefront + added to the WhatsApp order message. Answers the buyer's #1
-- question and reinforces the 0%-commission model.
-- ============================================================

alter table stores add column if not exists payment_instapay text;
alter table stores add column if not exists payment_vodafone text;
alter table stores add column if not exists payment_cod boolean not null default false;

-- Length guards (consistent with migration-v12).
alter table stores drop constraint if exists stores_pay_instapay_len;
alter table stores add constraint stores_pay_instapay_len check (payment_instapay is null or char_length(payment_instapay) <= 60);

alter table stores drop constraint if exists stores_pay_vodafone_len;
alter table stores add constraint stores_pay_vodafone_len check (payment_vodafone is null or char_length(payment_vodafone) <= 30);
