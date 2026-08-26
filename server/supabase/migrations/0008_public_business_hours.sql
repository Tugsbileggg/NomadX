-- LUMINA — ажлын цагийг үйлчлүүлэгчид харуулна.
-- Supabase SQL Editor дээр 0007-ийн дараа ажиллуулна.
--
-- 0004 нь зөвхөн `businesses` болон `business_categories`-ийг нийтэд
-- нээсэн байсан. `business_hours` нь 0001-ийн `can_read_business()`
-- дүрмээр эзэн/админд л харагддаг хэвээр үлдсэн тул гар утасны аппын
-- профайл дээр "Нээлттэй · 20:00 хүртэл" гэж харуулах гэхэд RLS хоосон
-- буцааж, салон бүр "Өнөөдөр амарна" гэж буруу харагдаж байв.

create policy business_hours_select_public on business_hours
  for select using (
    exists (select 1 from businesses where id = business_id and status = 'approved')
  );
