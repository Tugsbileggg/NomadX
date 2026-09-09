-- LUMINA — нэхэмжлэх төлөгдөхөд нөгөө талд нь мэдэгдэх.
-- Supabase SQL Editor дээр 0026-ийн дараа ажиллуулна.
--
-- ⚠️ 0011 болон 0023-ын анхааруулга ХЭВЭЭРЭЭ: энэ систем БОДИТ ТӨЛБӨР
-- ТООЦОО хийдэггүй. Мөнгө шилжихгүй, банк холбогдоогүй. Энэ migration
-- нь зөвхөн "төлөгдлөө" гэсэн ТЭМДЭГЛЭЛ үүсэхэд нөгөө талдаа мэдэгдэл
-- илгээнэ. Жинхэнэ төлбөр нэмэхэд энэ триггер хэвээрээ үлдэж болно —
-- түүнийг асаах эх сурвалж нь клиентийн дуудлага биш, төлбөрийн
-- системийн webhook болох ёстой (0023-ын тайлбарыг үзнэ үү).
--
-- Яагаад хэрэгтэй вэ: 0023 нь нэхэмжлэхийг `paid` болгодог ч энэ тухай
-- хэн ч мэдэхгүй байв. Артист аппаа онгойлгож, захиалгаа олж, дүн нь
-- төлөгдсөн эсэхийг өөрөө шалгах ёстой байсан.
--
-- ⚠️ `alter type ... add value` нь тухайн шинэ утгыг ЯГ ТЭР ГҮЙЛГЭЭН
-- ДОТОР ашиглахыг зөвшөөрдөггүй. Доорх функцийн бие нь plpgsql тул
-- үүсгэх үед задлан шинжлэгддэггүй — асуудал гарахгүй. Гэхдээ энэ
-- файлыг `begin/commit`-д зориудаар ОРУУЛААГҮЙ.

alter type notification_kind add value if not exists 'invoice_paid';

/**
 * `issued → paid` шилжилтэд хоёр талд нь мэдэгдэнэ.
 *
 * Тэмдэглэлийг хоёр зам дамжин хийж болдог: үйлчлүүлэгч аппаас
 * (`mark_invoice_paid`, 0023) эсвэл бизнес өөрөө панелаас
 * (`invoices_write`, 0011). Тиймээс "хэнд мэдэгдэх" гэдгийг хатуу
 * бичихийн оронд ҮЙЛДЭЛ ХИЙСЭН ХҮНЭЭС нь хамааруулав — 0020-ийн
 * `notify_booking_status` дэх "өөрийнхөө үйлдлийг өөрт нь мэдэгдэхгүй"
 * зарчим энд ч мөн адил.
 *
 * `mark_invoice_paid` нь security definer ч `auth.uid()` нь дуудсан
 * хэрэглэгчийнхээ JWT-ээс уншигддаг тул энд зөв утга ирнэ.
 */
create function notify_invoice_paid() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner    uuid;
  customer uuid;
  biz      text;
  who      text;
  money    text;
begin
  if old.status = new.status or new.status <> 'paid' then
    return new;
  end if;

  select z.owner_id, coalesce(nullif(btrim(z.name), ''), 'Бизнес')
    into owner, biz
  from businesses z where z.id = new.business_id;

  select b.customer_id into customer from bookings b where b.id = new.booking_id;

  select coalesce(nullif(btrim(p.full_name), ''), 'Үйлчлүүлэгч') into who
  from profiles p where p.id = customer;

  money := to_char(new.amount, 'FM999G999G999') || '₮ (туршилтын)';

  -- Бизнест: хэн төлснийг хэлнэ.
  if owner is distinct from auth.uid() then
    perform notify(
      owner, 'invoice_paid',
      'Төлбөр амжилттай төлөгдлөө',
      who || ' · ' || money,
      new.booking_id, new.business_id
    );
  end if;

  -- Үйлчлүүлэгчид: хаана төлөгдсөнийг хэлнэ. Зочны захиалгад
  -- `customer` нь null — `notify()` өөрөө чимээгүй алгасна (0020).
  if customer is distinct from auth.uid() then
    perform notify(
      customer, 'invoice_paid',
      'Төлбөр амжилттай төлөгдлөө',
      biz || ' · ' || money,
      new.booking_id, new.business_id
    );
  end if;

  return new;
end;
$$;

create trigger invoices_notify_paid
  after update on invoices
  for each row execute function notify_invoice_paid();

-- 0025-ийн зарчмаар: триггер функцийн EXECUTE эрхийг хөндөхгүй
-- (PostgREST нь `returns trigger`-ийг schema cache-даа оруулдаггүй тул
-- API-аар хүрэх зам байхгүй — тэндэх "ЗОРИУДААР ХӨНДӨӨГҮЙ №2"-ыг үзнэ үү).
