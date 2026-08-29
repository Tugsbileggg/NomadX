-- LUMINA — захиалгын цагийн бодит логик.
-- Supabase SQL Editor дээр 0013-ийн дараа ажиллуулна.
--
-- Одоог хүртэл захиалга нь бүрэн хамгаалалтгүй байсан:
--   1. Хоёр хүн яг ижил цагт захиалж болдог байсан (хязгаар байхгүй).
--   2. Салон амарч байгаа өдөр, ажлын цагаас гадуур ч захиалж болдог
--      байсан — аппын цагийн жагсаалт 09:00–19:00 гэж кодод бичигдсэн,
--      `business_hours`-ыг огт үздэггүй байв.
--   3. `bookings_update` (0006) нь захиалагчид ямар ч төлөв тавихыг
--      зөвшөөрдөг байсан — апп зөвхөн цуцалдаг ч API нээлттэй байсан
--      тул захиалагч өөрийн захиалгаа "confirmed"/"completed" болгож
--      чадна. Панелийн server action дээрх шалгалт үүнээс хамгаалдаггүй.
--
-- Гурвуулангийн шалгалтыг өгөгдлийн сангийн түвшинд хийнэ — үйлчлүүлэгчийн
-- апп Supabase рүү шууд ханддаг тул клиент дээрх шалгалт хангалтгүй.

-- ------------------------------------------------- бизнесийн цагийн тохиргоо
alter table businesses
  -- Нэг цагийн нүдний урт, минутаар. Аппын цагийн жагсаалт үүнээс үүснэ.
  add column slot_minutes  smallint not null default 60
    check (slot_minutes between 15 and 240),
  -- Нэг цагт зэрэг үйлчилж чадах хүний тоо. Ганцаараа ажилладаг артист = 1,
  -- 5 мастертай салон = 5. Багтаамжийг эзэн өөрөө "Хуваарь" хуудсанд тавина.
  add column slot_capacity smallint not null default 1
    check (slot_capacity between 1 and 50);

-- ------------------------------------------------------------ туслах функц
-- Захиалгын цагийг Улаанбаатарын цагаар. `business_hours` нь `time` төрөлтэй
-- тул харьцуулахын өмнө timestamptz-ийг локал цаг руу буулгана.
create function booking_local_ts(ts timestamptz) returns timestamp
language sql immutable set search_path = public as $$
  select ts at time zone 'Asia/Ulaanbaatar';
$$;

-- ------------------------------------------------------ шалгалтын триггер
-- Захиалга үүсэх/өөрчлөгдөх бүрд ажлын цаг болон багтаамжийг шалгана.
--
-- security definer: захиалагч `businesses`/`business_hours`-ийн бүх мөрийг
-- уншиж чаддаггүй бөгөөд бусдын захиалгыг ч харахгүй тул дуудагчийн эрхээр
-- тоолвол багтаамж үргэлж 0 гарна.
create function validate_booking() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  local_ts timestamp := booking_local_ts(new.scheduled_at);
  hours    record;
  biz      record;
  taken    integer;
begin
  -- Цуцлагдсан захиалга цаг эзэлдэггүй тул шалгах шаардлагагүй.
  if new.status = 'cancelled' then
    return new;
  end if;

  -- Цаг/бизнес нь өөрчлөгдөөгүй бөгөөд өмнө нь ч идэвхтэй байсан бол
  -- (жишээ нь зүгээр л pending → confirmed болсон) дахин шалгах нь илүүц.
  --
  -- INSERT үед OLD оноогддоггүй тул давхар if — нэг мөрөнд AND-аар
  -- шалгавал PL/pgSQL нь заавал зүүнээс баруун тийш богиносгож
  -- үнэлдэггүй бөгөөд "record old is not assigned yet" гарч болзошгүй.
  if tg_op = 'UPDATE' then
    if old.scheduled_at = new.scheduled_at
       and old.business_id = new.business_id
       and old.status <> 'cancelled'
    then
      return new;
    end if;
  end if;

  select slot_minutes, slot_capacity into biz
  from businesses where id = new.business_id;

  -- ------------------------------------------------------------ ажлын цаг
  -- business_hours дээр 0 = Даваа, isodow дээр 1 = Даваа.
  select open_time, close_time, is_closed into hours
  from business_hours
  where business_id = new.business_id
    and weekday = extract(isodow from local_ts)::int - 1;

  -- Ажлын цагаа огт бүртгээгүй бизнесийг хааж болохгүй — хуучин бүртгэлүүд
  -- цагаа оруулаагүй байж магадгүй тул зөвхөн бүртгэсэн үед нь шалгана.
  if found and hours.open_time is not null and hours.close_time is not null then
    if hours.is_closed then
      raise exception 'Тухайн өдөр амарна.' using errcode = 'P0001';
    end if;

    if local_ts::time < hours.open_time
       or local_ts::time >= hours.close_time then
      raise exception 'Сонгосон цаг ажлын цагийн гадна байна.' using errcode = 'P0001';
    end if;

    -- Цагийн нүд нь нээх цагаас эхэлж тоологдоно: 09:30-д нээдэг, 60
    -- минутын алхамтай бизнесийн цагууд нь 09:30, 10:30 … байх ёстой.
    -- Шөнө дундаас тоолвол эдгээр нь бүгд няцаагдана.
    if (extract(epoch from local_ts::time)::int
        - extract(epoch from hours.open_time)::int)
       % (coalesce(biz.slot_minutes, 60) * 60) <> 0 then
      raise exception 'Сонгосон цаг цагийн хуваарьт таарахгүй байна.' using errcode = 'P0001';
    end if;
  end if;

  -- ----------------------------------------------------------- багтаамж
  select count(*) into taken
  from bookings
  where business_id = new.business_id
    and scheduled_at = new.scheduled_at
    and status <> 'cancelled'
    and id <> new.id;

  if taken >= coalesce(biz.slot_capacity, 1) then
    raise exception 'Энэ цаг дүүрсэн байна. Өөр цаг сонгоно уу.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger bookings_validate
  before insert or update on bookings
  for each row execute function validate_booking();

-- --------------------------------------------------- төлвийн шилжилт
-- Хэн юу өөрчилж болохыг тодорхойлно. RLS нь "мөрийг өөрчилж болох уу"
-- гэдгийг л шалгадаг, "аль баганыг, аль утга руу" гэдгийг шалгаж чаддаггүй.
create function enforce_booking_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_owner boolean;
  admin    boolean := is_super_admin();
begin
  if admin then
    return new;
  end if;

  select exists (
    select 1 from businesses where id = old.business_id and owner_id = auth.uid()
  ) into is_owner;

  -- Захиалагч, бизнес аль аль нь захиалгыг өөр бизнес рүү шилжүүлэх,
  -- өөр хүний нэр дээр болгох эрхгүй.
  if new.business_id <> old.business_id or new.customer_id <> old.customer_id then
    raise exception 'Захиалгын эзэн эсвэл бизнесийг өөрчилж болохгүй.';
  end if;

  if is_owner then
    -- Бизнес нь цаг, тайлбарыг хөндөхгүй — зөвхөн төлөв ахиулна.
    if new.scheduled_at <> old.scheduled_at
       or new.note is distinct from old.note then
      raise exception 'Бизнес нь захиалгын цаг, тайлбарыг өөрчилж болохгүй.';
    end if;

    if old.status = new.status then
      return new;
    end if;

    if (old.status = 'pending'   and new.status in ('confirmed', 'cancelled'))
       or (old.status = 'confirmed' and new.status in ('completed', 'cancelled'))
    then
      return new;
    end if;

    raise exception 'Одоогийн төлвөөс энэ үйлдлийг хийх боломжгүй.';
  end if;

  if old.customer_id = auth.uid() then
    -- Захиалагчийн цорын ганц эрх: хүлээгдэж буй/баталгаажсан захиалгаа цуцлах.
    if old.status = new.status then
      return new;
    end if;

    if new.status = 'cancelled' and old.status in ('pending', 'confirmed') then
      return new;
    end if;

    raise exception 'Захиалгаа зөвхөн цуцлах боломжтой.';
  end if;

  raise exception 'Энэ захиалгыг өөрчлөх эрхгүй байна.';
end;
$$;

create trigger bookings_enforce_update
  before update on bookings
  for each row execute function enforce_booking_update();

-- --------------------------------------------------------- эзэлсэн цагууд
-- Үйлчлүүлэгчид аль цаг дүүрснийг харуулна. `bookings`-ийн RLS нь бусдын
-- захиалгыг уншуулдаггүй тул (зөв) энэ функцээр зөвхөн ЦАГ болон ТООГ
-- гаргана — хэн захиалсан нь гарахгүй.
create function booking_slot_load(bid uuid, from_ts timestamptz, to_ts timestamptz)
returns table (slot timestamptz, taken integer)
language sql security definer stable set search_path = public as $$
  select b.scheduled_at, count(*)::int
  from bookings b
  join businesses z on z.id = b.business_id
  where b.business_id = bid
    and z.status = 'approved'
    and b.status <> 'cancelled'
    and b.scheduled_at >= from_ts
    and b.scheduled_at <  to_ts
  group by b.scheduled_at;
$$;

grant execute on function booking_slot_load(uuid, timestamptz, timestamptz)
  to anon, authenticated;
