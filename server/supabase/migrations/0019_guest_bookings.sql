-- LUMINA — салон/артист өөрөө захиалга үүсгэх (утсаар, ирсэн газраас).
-- Supabase SQL Editor дээр 0018-ийн дараа ажиллуулна.
--
-- Панелийн "+ Шинэ захиалга" товч эхнээсээ байсан ч ард нь юу ч байгаагүй:
-- `bookings.customer_id` нь `profiles`-ийг заавал заадаг тул апп суулгаагүй,
-- утсаар залгасан хүний захиалгыг бүртгэх боломжгүй байв.
--
-- Шийдэл: захиалга нь бүртгэлтэй хэрэглэгчийнх ЭСВЭЛ зочны нэр/утсаар
-- бүртгэгдэнэ. Хоёулангийнх нь аль нэг заавал байна.

alter table bookings
  alter column customer_id drop not null,
  -- Зочны нэр — бүртгэлтэй хэрэглэгч биш тул зөвхөн текст.
  add column guest_name  text,
  add column guest_phone text,
  add constraint bookings_customer_or_guest
    check (customer_id is not null or nullif(btrim(guest_name), '') is not null);

-- ------------------------------------------------------------------- RLS
-- 0006-ийн insert policy нь зөвхөн "өөрийн нэрээр" гэсэн дүрэмтэй байсан.
-- Одоо бизнесийн эзэн өөрийн бизнест зочны захиалга үүсгэж болно.
drop policy bookings_insert on bookings;

create policy bookings_insert on bookings
  for insert with check (
    -- Үйлчлүүлэгч өөрөө: зөвхөн өөрийн нэрээр, зөвшөөрөгдсөн бизнес рүү.
    (
      customer_id = auth.uid()
      and exists (select 1 from businesses where id = business_id and status = 'approved')
    )
    -- Эсвэл бизнесийн эзэн: зөвхөн зочны захиалга, зөвхөн өөрийн бизнест.
    or (
      customer_id is null
      and nullif(btrim(guest_name), '') is not null
      and owns_business(business_id)
    )
  );

-- -------------------------------------------------- триггерийн засварууд
-- `<>` нь NULL-тай харьцуулахад NULL буцаадаг тул зочин (customer_id = null)
-- байх үед шалгалт чимээгүй алдагдана. `is distinct from` нь NULL-ийг зөв
-- харьцуулна. Мөн зочны мэдээллийг захиалагч тал өөрчилж чадахгүй байх ёстой.
create or replace function enforce_booking_update() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_owner boolean;
begin
  if auth.uid() is null then
    return new;
  end if;

  if is_super_admin() then
    return new;
  end if;

  select exists (
    select 1 from businesses where id = old.business_id and owner_id = auth.uid()
  ) into is_owner;

  if new.business_id is distinct from old.business_id
     or new.customer_id is distinct from old.customer_id then
    raise exception 'Захиалгын эзэн эсвэл бизнесийг өөрчилж болохгүй.';
  end if;

  if new.scheduled_at is distinct from old.scheduled_at
     or new.note is distinct from old.note then
    raise exception 'Захиалгын цаг, тайлбарыг өөрчилж болохгүй.';
  end if;

  -- Зочны нэр/утсыг зөвхөн захиалгыг үүсгэсэн бизнес засна (алдаа засах).
  if (new.guest_name is distinct from old.guest_name
      or new.guest_phone is distinct from old.guest_phone)
     and not is_owner then
    raise exception 'Зочны мэдээллийг өөрчлөх эрхгүй байна.';
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
    if new.status = 'cancelled' and old.status in ('pending', 'confirmed') then
      return new;
    end if;

    raise exception 'Захиалгаа зөвхөн цуцлах боломжтой.';
  end if;

  raise exception 'Энэ захиалгыг өөрчлөх эрхгүй байна.';
end;
$$;
