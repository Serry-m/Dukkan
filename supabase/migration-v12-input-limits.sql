-- ============================================================
-- INPUT LENGTH LIMITS (defense-in-depth)
-- Run once in the Supabase SQL editor. Idempotent.
--
-- The forms already cap these via maxLength, but that's only a UI
-- hint — a request sent directly to the API bypasses it. These CHECK
-- constraints enforce the same caps at the database level, the real
-- trust boundary. Limits are generous; tighten if needed.
--
-- NOTE: if any existing row already exceeds a limit, that ALTER will
-- fail — shorten the offending value first, then re-run.
-- ============================================================

-- ----- STORES -----
alter table stores drop constraint if exists stores_name_len;
alter table stores add constraint stores_name_len check (char_length(name) <= 60);

alter table stores drop constraint if exists stores_slug_len;
alter table stores add constraint stores_slug_len check (char_length(slug) <= 40);

alter table stores drop constraint if exists stores_description_len;
alter table stores add constraint stores_description_len check (description is null or char_length(description) <= 200);

alter table stores drop constraint if exists stores_whatsapp_len;
alter table stores add constraint stores_whatsapp_len check (char_length(whatsapp_number) <= 15);

alter table stores drop constraint if exists stores_about_len;
alter table stores add constraint stores_about_len check (about is null or char_length(about) <= 500);

alter table stores drop constraint if exists stores_location_len;
alter table stores add constraint stores_location_len check (location is null or char_length(location) <= 120);

alter table stores drop constraint if exists stores_hours_len;
alter table stores add constraint stores_hours_len check (working_hours is null or char_length(working_hours) <= 120);

alter table stores drop constraint if exists stores_template_len;
alter table stores add constraint stores_template_len check (message_template is null or char_length(message_template) <= 300);

alter table stores drop constraint if exists stores_instagram_len;
alter table stores add constraint stores_instagram_len check (instagram is null or char_length(instagram) <= 150);

alter table stores drop constraint if exists stores_facebook_len;
alter table stores add constraint stores_facebook_len check (facebook is null or char_length(facebook) <= 150);

alter table stores drop constraint if exists stores_tiktok_len;
alter table stores add constraint stores_tiktok_len check (tiktok is null or char_length(tiktok) <= 150);

-- ----- PRODUCTS -----
alter table products drop constraint if exists products_name_len;
alter table products add constraint products_name_len check (char_length(name) <= 80);

alter table products drop constraint if exists products_description_len;
alter table products add constraint products_description_len check (description is null or char_length(description) <= 500);

alter table products drop constraint if exists products_category_len;
alter table products add constraint products_category_len check (category is null or char_length(category) <= 40);

-- ----- ORDERS (customer-supplied, anonymous) -----
alter table orders drop constraint if exists orders_customer_name_len;
alter table orders add constraint orders_customer_name_len check (customer_name is null or char_length(customer_name) <= 60);

alter table orders drop constraint if exists orders_customer_phone_len;
alter table orders add constraint orders_customer_phone_len check (customer_phone is null or char_length(customer_phone) <= 15);

alter table orders drop constraint if exists orders_customer_address_len;
alter table orders add constraint orders_customer_address_len check (customer_address is null or char_length(customer_address) <= 300);

alter table orders drop constraint if exists orders_notes_len;
alter table orders add constraint orders_notes_len check (notes is null or char_length(notes) <= 200);

alter table orders drop constraint if exists orders_coupon_len;
alter table orders add constraint orders_coupon_len check (coupon_code is null or char_length(coupon_code) <= 30);

-- ----- COUPONS -----
alter table coupons drop constraint if exists coupons_code_len;
alter table coupons add constraint coupons_code_len check (char_length(code) <= 30);
