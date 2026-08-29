-- LUMINA — мэдэгдлийн төв.
-- Supabase SQL Editor дээр 0019-ийн дараа ажиллуулна.
--
-- Аппын толгой дээрх хонхны товч эхнээсээ байсан ч юу ч хийдэггүй байв:
-- захиалга баталгаажсан, цуцлагдсан, нэхэмжлэх ирсэн, сэтгэгдэлд хариу
-- бичигдсэн — хэрэглэгч эдгээрийн аль нь ч мэдэхгүй, өөрөө орж шалгах
-- ёстой байсан.
--
-- Мэдэгдлийг клиент биш, ӨГӨГДЛИЙН САН өөрөө үүсгэнэ. Шалтгаан: төлөв
-- солих үйлдэл нь вэб панел, гар утас, SQL Editor гурван замаар явдаг тул
-- нэг л газар (триггер) дээр барих нь цорын ганц найдвартай арга.
--
-- ⚠️ Энэ нь апп доторх мэдэгдэл. Утас руу түлхэх (push) мэдэгдэл ЭНД
-- ОРООГҮЙ — түүнд төхөөрөмжийн token хадгалах, Expo push руу илгээх
-- backend хэрэгтэй. Энэ хүснэгт нь түүний суурь болно.

create type notification_kind as enum (
  'booking_created',    -- бизнест: шинэ захиалга ирлээ
  'booking_confirmed',  -- үйлчлүүлэгчид
  'booking_cancelled',
  'booking_completed',
  'invoice_issued',     -- ⚠️ туршилтын нэхэмжлэх
  'review_replied',
  'business_status'     -- эзэнд: бүртгэлийн шийдвэр
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  -- Хүлээн авагч.
  profile_id  uuid not null references profiles on delete cascade,
  kind        notification_kind not null,
  title       text not null,
  body        text,
  -- Дарахад аль дэлгэц рүү очихыг заана — аль нэг нь л дүүрнэ.
  booking_id  uuid references bookings on delete cascade,
  business_id uuid references businesses on delete cascade,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index notifications_profile_idx on notifications (profile_id, created_at desc);
-- Хонхны тоолуур зөвхөн уншаагүйг тоолдог тул тусад нь индекс.
create index notifications_unread_idx on notifications (profile_id) where read_at is null;

-- -------------------------------------------------------------------- RLS
alter table notifications enable row level security;

-- Зөвхөн өөрийнхөө мэдэгдлийг харна, уншсан болгоно, устгана.
-- INSERT policy ЗОРИУДААР байхгүй: мэдэгдлийг зөвхөн доорх триггерүүд
-- (security definer) үүсгэнэ, клиентээс өөртөө эсвэл бусдад мэдэгдэл
-- зохиох боломжгүй.
create policy notifications_select_own on notifications
  for select using (profile_id = auth.uid());

create policy notifications_update_own on notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy notifications_delete_own on notifications
  for delete using (profile_id = auth.uid());

-- --------------------------------------------------------------- туслах
create function notify(
  recipient uuid,
  kind notification_kind,
  title text,
  body text default null,
  booking uuid default null,
  business uuid default null
) returns void
language sql security definer set search_path = public as $$
  insert into notifications (profile_id, kind, title, body, booking_id, business_id)
  -- Хүлээн авагч тодорхойгүй бол (зочны захиалга) чимээгүй алгасна.
  select recipient, kind, title, body, booking, business
  where recipient is not null;
$$;

/** "1 сарын 5, 14:00" — mn-MN locale энэ орчинд найдваргүй тул гараар. */
create function mn_datetime(ts timestamptz) returns text
language sql immutable set search_path = public as $$
  select to_char(ts at time zone 'Asia/Ulaanbaatar', 'FMMM') || ' сарын '
      || to_char(ts at time zone 'Asia/Ulaanbaatar', 'FMDD') || ', '
      || to_char(ts at time zone 'Asia/Ulaanbaatar', 'HH24:MI');
$$;

-- ------------------------------------------------------ захиалга үүсэхэд
-- Бизнесийн эзэнд. Зочны захиалгыг эзэн өөрөө үүсгэдэг тул мэдэгдэхгүй.
create function notify_booking_created() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
  who   text;
begin
  if new.customer_id is null then
    return new;
  end if;

  select z.owner_id into owner from businesses z where z.id = new.business_id;
  select coalesce(nullif(btrim(p.full_name), ''), 'Хэрэглэгч') into who
  from profiles p where p.id = new.customer_id;

  perform notify(
    owner, 'booking_created',
    'Шинэ захиалга ирлээ',
    who || ' · ' || mn_datetime(new.scheduled_at),
    new.id, new.business_id
  );
  return new;
end;
$$;

create trigger bookings_notify_created
  after insert on bookings
  for each row execute function notify_booking_created();

-- ------------------------------------------------- захиалгын төлөв солиход
-- Үйлчлүүлэгчид. Зочны захиалгад хүлээн авагч байхгүй тул notify() алгасна.
create function notify_booking_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  biz  text;
  kind notification_kind;
  head text;
begin
  if old.status = new.status then
    return new;
  end if;

  select coalesce(nullif(btrim(z.name), ''), 'Бизнес') into biz
  from businesses z where z.id = new.business_id;

  if new.status = 'confirmed' then
    kind := 'booking_confirmed'; head := 'Захиалга баталгаажлаа';
  elsif new.status = 'cancelled' then
    kind := 'booking_cancelled'; head := 'Захиалга цуцлагдлаа';
  elsif new.status = 'completed' then
    kind := 'booking_completed'; head := 'Үйлчилгээ дууслаа';
  else
    return new;
  end if;

  -- Өөрийнхөө хийсэн үйлдлийг өөрт нь мэдэгдэх нь илүүц.
  if new.customer_id = auth.uid() then
    return new;
  end if;

  perform notify(
    new.customer_id, kind, head,
    biz || ' · ' || mn_datetime(new.scheduled_at),
    new.id, new.business_id
  );
  return new;
end;
$$;

create trigger bookings_notify_status
  after update on bookings
  for each row execute function notify_booking_status();

-- ------------------------------------------------------------ нэхэмжлэх
create function notify_invoice() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  customer uuid;
  biz      text;
begin
  select b.customer_id into customer from bookings b where b.id = new.booking_id;
  select coalesce(nullif(btrim(z.name), ''), 'Бизнес') into biz
  from businesses z where z.id = new.business_id;

  perform notify(
    customer, 'invoice_issued',
    'Нэхэмжлэх ирлээ',
    biz || ' · ' || to_char(new.amount, 'FM999G999G999') || '₮ (туршилтын)',
    new.booking_id, new.business_id
  );
  return new;
end;
$$;

create trigger invoices_notify
  after insert on invoices
  for each row execute function notify_invoice();

-- ------------------------------------------------ сэтгэгдэлд хариу бичихэд
create function notify_review_reply() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  biz text;
begin
  -- Зөвхөн хариу шинээр нэмэгдсэн эсвэл өөрчлөгдсөн үед.
  if new.reply is null or new.reply is not distinct from old.reply then
    return new;
  end if;

  select coalesce(nullif(btrim(z.name), ''), 'Бизнес') into biz
  from businesses z where z.id = new.business_id;

  perform notify(
    new.author_id, 'review_replied',
    'Сэтгэгдэлд тань хариу бичлээ',
    biz, null, new.business_id
  );
  return new;
end;
$$;

create trigger reviews_notify_reply
  after update on reviews
  for each row execute function notify_review_reply();

-- ------------------------------------------------- бүртгэлийн шийдвэр
create function notify_business_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  head text;
  msg  text;
begin
  if old.status = new.status then
    return new;
  end if;

  if new.status = 'approved' then
    head := 'Бүртгэл баталгаажлаа';
    msg  := 'Танай бизнес одооноос үйлчлүүлэгчдэд харагдана.';
  elsif new.status = 'rejected' then
    head := 'Бүртгэл татгалзагдлаа';
    msg  := coalesce(new.reject_reason, 'Шалтгааныг панелаас харна уу.');
  elsif new.status = 'needs_info' then
    head := 'Нэмэлт мэдээлэл шаардлагатай';
    msg  := coalesce(new.reject_reason, 'Панелаас дэлгэрэнгүйг харна уу.');
  else
    return new;
  end if;

  perform notify(new.owner_id, 'business_status', head, msg, null, new.id);
  return new;
end;
$$;

create trigger businesses_notify_status
  after update on businesses
  for each row execute function notify_business_status();
