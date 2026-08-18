-- LUMINA — захиалгын (bookings) хүснэгт.
-- Хэрэглэгч бизнесийн профайлаас цаг захиалж, "Захиалга" tab дээрээ
-- харах боломжтой болно.

create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table bookings (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references profiles on delete cascade,
  business_id  uuid not null references businesses on delete cascade,
  status       booking_status not null default 'pending',
  scheduled_at timestamptz not null,
  note         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index bookings_customer_idx on bookings (customer_id, scheduled_at desc);
create index bookings_business_idx on bookings (business_id, scheduled_at desc);

create trigger bookings_touch
  before update on bookings
  for each row execute function touch_updated_at();

alter table bookings enable row level security;

-- Захиалагч өөрийн захиалгаа, бизнесийн эзэн өөрийн бизнес рүү ирсэн
-- захиалгуудыг, супер админ бүгдийг харна.
create policy bookings_select on bookings
  for select using (
    customer_id = auth.uid()
    or exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
    or is_super_admin()
  );

-- Зөвхөн өөрийн нэрээр захиалга үүсгэнэ, зөвшөөрөгдсөн бизнес рүү л.
create policy bookings_insert on bookings
  for insert with check (
    customer_id = auth.uid()
    and exists (select 1 from businesses where id = business_id and status = 'approved')
  );

-- Захиалагч (цуцлах) болон бизнесийн эзэн (баталгаажуулах/дуусгах) хоёулаа
-- өөрт хамаатай захиалгыг шинэчилж болно.
create policy bookings_update on bookings
  for update using (
    customer_id = auth.uid()
    or exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
  )
  with check (
    customer_id = auth.uid()
    or exists (select 1 from businesses where id = business_id and owner_id = auth.uid())
  );
