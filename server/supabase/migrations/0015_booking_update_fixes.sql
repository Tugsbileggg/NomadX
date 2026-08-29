-- LUMINA — 0014-ийн enforce_booking_update()-ийн хоёр засвар.
-- Supabase SQL Editor дээр 0014-ийн дараа ажиллуулна.
--
-- 0014-ийг бодитоор туршихад хоёр зүйл илрэв:
--
-- 1. Service role захиалгыг огт шинэчилж чадахгүй болсон. Түүний
--    `auth.uid()` нь null тул функц "эрхгүй" гэж үзээд татгалзана. Энэ нь
--    SQL Editor-оос гараар засах, цаашид backend script (жишээ нь ирээгүй
--    захиалгыг автоматаар цуцлах) бичих боломжийг хаана.
--
--    anon түлхүүрийн `auth.uid()` ч null боловч түүнд аюул байхгүй:
--    `bookings_update` RLS policy (0006) нь `customer_id = auth.uid()`
--    эсвэл эзэн эсэхийг шаарддаг тул анонимд нэг ч мөр тохирохгүй,
--    триггер хүртэл ер нь хүрэхгүй. Service role л RLS-ийг тойрдог —
--    тэр нь угаасаа итгэмжлэгдсэн дэд бүтэц.
--
-- 2. Захиалагч цагаа чөлөөтэй өөрчилж чаддаг цоорхой үлдсэн. Функц нь
--    "төлөв өөрчлөгдөөгүй бол зөвшөөрнө" гэж эрт гардаг байсан тул
--    `scheduled_at`-ыг (бүр дууссан захиалгынхыг ч) солиж болно. Аппад
--    цаг шилжүүлэх UI байхгүй тул одоохондоо бүрэн хаана — хожим
--    нэмэхдээ зориудаар сулруулна.

create or replace function enforce_booking_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_owner boolean;
begin
  -- Service role / шууд SQL — RLS-ийг угаасаа тойрдог итгэмжлэгдсэн зам.
  if auth.uid() is null then
    return new;
  end if;

  if is_super_admin() then
    return new;
  end if;

  select exists (
    select 1 from businesses where id = old.business_id and owner_id = auth.uid()
  ) into is_owner;

  -- Захиалгыг өөр бизнес рүү шилжүүлэх, өөр хүний нэр дээр болгохыг
  -- хэн ч хийж болохгүй.
  if new.business_id <> old.business_id or new.customer_id <> old.customer_id then
    raise exception 'Захиалгын эзэн эсвэл бизнесийг өөрчилж болохгүй.';
  end if;

  -- Цаг, тайлбар нь захиалагчийн бичсэн зүйл — аль аль тал нь хөндөхгүй.
  -- (Цаг шилжүүлэх боломж нэмэх бол энэ хязгаарлалтыг зориудаар сулруулна.)
  if new.scheduled_at <> old.scheduled_at
     or new.note is distinct from old.note then
    raise exception 'Захиалгын цаг, тайлбарыг өөрчилж болохгүй.';
  end if;

  if old.status = new.status then
    return new;
  end if;

  if is_owner then
    if (old.status = 'pending'   and new.status in ('confirmed', 'cancelled'))
       or (old.status = 'confirmed' and new.status in ('completed', 'cancelled'))
    then
      return new;
    end if;

    raise exception 'Одоогийн төлвөөс энэ үйлдлийг хийх боломжгүй.';
  end if;

  if old.customer_id = auth.uid() then
    -- Захиалагчийн цорын ганц эрх: хүлээгдэж буй/баталгаажсан захиалгаа цуцлах.
    if new.status = 'cancelled' and old.status in ('pending', 'confirmed') then
      return new;
    end if;

    raise exception 'Захиалгаа зөвхөн цуцлах боломжтой.';
  end if;

  raise exception 'Энэ захиалгыг өөрчлөх эрхгүй байна.';
end;
$$;
