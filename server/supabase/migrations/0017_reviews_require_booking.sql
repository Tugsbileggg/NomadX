-- LUMINA — сэтгэгдлийг бодит үйлчилгээтэй холбов.
-- Supabase SQL Editor дээр 0016-ийн дараа ажиллуулна.
--
-- 0007-ийн `reviews_insert_own` нь зөвшөөрөгдсөн бизнест **хэн ч**
-- сэтгэгдэл бичихийг зөвшөөрдөг байсан — хэзээ ч үйлчилгээ аваагүй
-- хэрэглэгч, тэр байтугай өрсөлдөгч ч оноо тавьж болно гэсэн үг.
-- `reviews.booking_id` багана нь 0007-оос хойш байсан ч хоосон байв.
--
-- Гар утасны аппад сэтгэгдэл бичих боломж нэмэгдэж байгаа тул энэ
-- дүрмийг өгөгдлийн сангийн түвшинд тогтооно: аппын шалгалт нь зөвхөн
-- UI-г цэгцлэх зорилготой, Supabase рүү шууд ханддаг клиентийг зогсоохгүй.
--
-- Дэд асуулга нь дуудагчийн эрхээр ажиллана: 0006-ийн `bookings_select`
-- нь хэрэглэгчид өөрийн захиалгыг уншуулдаг тул энэ хангалттай бөгөөд
-- security definer шаардахгүй (бусдын захиалгыг харах эрх нээхгүй).
--
-- Анхаар: service role нь RLS-ийг тойрдог тул seed script хэвээр ажиллана.
-- Одоо байгаа 12 сэтгэгдэл ч хөндөгдөхгүй — policy зөвхөн шинэ мөрөнд.

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
        and bookings.status = 'completed'
    )
  );
