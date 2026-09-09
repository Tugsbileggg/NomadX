-- LUMINA — захиалгын урсгалыг "хаагдсан" төлвөөр төгсгөв.
-- Supabase SQL Editor дээр 0027-ийн дараа ажиллуулна.
--
-- Урсгал өмнө нь `completed` дээр зогсдог байв: артист "Дууссан" гэж
-- тэмдэглээд, дараа нь нэхэмжлэх үүсгэж, төлбөр төлөгдсөн ч захиалга
-- "Дууссан" хэвээр үлдэнэ. Өөрөөр хэлбэл "ажил дууссан" ба "тооцоо
-- дууссан" хоёр нэг л төлөв дотор нийлж, артист аль захиалгын тооцоо
-- үлдсэнийг жагсаалтаас ялгаж чаддаггүй байсан.
--
--   pending → confirmed → completed → closed
--                         (ажил)      (тооцоо)
--
-- ⚠️ Мөнгө ШИЛЖИХГҮЙ (0011, 0023). `closed` нь нэхэмжлэх `paid` гэсэн
-- ТЭМДЭГЛЭЛ авсныг л илэрхийлнэ.
--
-- ⚠️ `alter type ... add value` нь шинэ утгыг ЯГ ТЭР ГҮЙЛГЭЭН ДОТОР
-- ашиглахыг зөвшөөрдөггүй. plpgsql функцийн бие нь үүсгэх үедээ
-- задлан шинжлэгддэггүй тул тэнд асуудалгүй; харин policy-ийн
-- илэрхийлэл нь ШУУД задлагддаг учир доор `status::text` болгож
-- харьцуулав (доорх тайлбарыг үзнэ үү).

alter type booking_status add value if not exists 'closed';

-- ==================================================================
-- 1. Шилжилтийн дүрэм
-- ==================================================================
-- 0019-ийн хувилбарыг бүтнээр нь давтаж, ГАНЦ шинэ салаа нэмэв
-- (`create or replace` нь биеийг бүхэлд нь солино).
--
-- `completed → closed` нь СИСТЕМИЙН шилжилт: үүнийг доорх
-- `close_paid_booking()` триггер нэхэмжлэх `paid` болсны дараа өөрөө
-- хийнэ. Тиймээс "хэн дуудсан" гэдгээр биш, "нэхэмжлэх төлөгдсөн үү"
-- гэдгээр зөвшөөрөв — төлөгдөөгүй захиалгыг хэн ч (эзэн ч, захиалагч ч)
-- хааж чадахгүй.
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

  -- ↓ 0028-д нэмэгдсэн ганц салаа.
  if old.status = 'completed' and new.status = 'closed'
     and exists (
       select 1 from invoices i where i.booking_id = old.id and i.status = 'paid'
     )
  then
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

-- ==================================================================
-- 2. Төлбөр төлөгдөхөд захиалгыг автоматаар хаах
-- ==================================================================
-- Клиент дээр биш ЭНД хийж байгаа шалтгаан нь 0020-ийнхтэй ижил:
-- нэхэмжлэхийг төлөгдсөн болгох гурван зам байдаг (апп дахь "Төлбөр
-- төлөх" товч, бизнесийн вэб панел, SQL Editor) тул хаалтыг нэг л
-- газар барих нь цорын ганц найдвартай арга.
--
-- `completed` биш захиалгыг хөндөхгүй: нэхэмжлэхийг гараар эрт
-- төлөгдсөн болгосон тохиолдолд ажлыг дуусгалгүй хаах ёсгүй.
create function close_paid_booking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.status = new.status or new.status <> 'paid' then
    return new;
  end if;

  update bookings
  set status = 'closed'
  where id = new.booking_id and status = 'completed';

  return new;
end;
$$;

-- Нэрийн эхний үсгээр 0027-ийн `invoices_notify_paid`-аас ӨМНӨ ажиллана
-- (Postgres триггерүүдийг нэрээр нь эрэмбэлдэг). Дараалал нь үр дүнд
-- нөлөөлөхгүй — `notify_booking_status` (0020) нь `closed`-д мэдэгдэл
-- үүсгэдэггүй тул төлбөрийн мэдэгдэл давхардахгүй.
create trigger invoices_close_booking
  after update on invoices
  for each row execute function close_paid_booking();

-- ==================================================================
-- 3. Сэтгэгдэл бичих эрх
-- ==================================================================
-- 0017 нь `bookings.status = 'completed'`-ыг шаарддаг байв. Хаагдсан
-- захиалга бол ажил нь бүрэн дууссан гэсэн үг тул үүнийг хасвал
-- төлбөрөө төлсөн хүн сэтгэгдэл бичих эрхээ АЛДАНА.
--
-- `status::text` болгосон шалтгаан: policy-ийн илэрхийлэл нь үүсгэх
-- үедээ задлагддаг тул `status in ('completed', 'closed')` гэвэл дээрх
-- `alter type`-тай нэг гүйлгээнд "unsafe use of new value" алдаа өгнө.
-- Текстээр харьцуулбал enum-ийн шинэ утгыг хөндөхгүй.
drop policy reviews_insert_own on reviews;

create policy reviews_insert_own on reviews
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from businesses
      where id = reviews.business_id and status = 'approved'
    )
    and exists (
      select 1 from bookings
      where bookings.customer_id = auth.uid()
        and bookings.business_id = reviews.business_id
        and bookings.status::text in ('completed', 'closed')
    )
  );
