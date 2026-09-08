-- LUMINA — захиалга үйлчилгээ авах байршил.
-- Supabase SQL Editor дээр 0025_lock_down_functions.sql-ийн дараа ажиллуулна.
--
-- Хувиараа ажиллах артист үйлчлүүлэгч рүү нь очдог тул "хаана очих вэ"
-- гэдгийг мэдэх шаардлагатай. Өмнө нь захиалгад зөвхөн чөлөөт бичвэр
-- `note` байсан — "3-р хороолол, хойд талын орц" гэх мэт бичвэрээс газрын
-- зураг дээр цэг тавих боломжгүй.
--
-- Бизнесийн өөрийн `businesses.lat/lng`-ээс ТУСДАА багана: салон нэг
-- байрлалд байхад үйлчилгээ өөр газар үзүүлэгддэг.

alter table bookings
  add column service_lat     double precision,
  add column service_lng     double precision,
  add column service_address text;

-- Байгаа захиалгууд байршилгүй тул багана null зөвшөөрнө. Гэхдээ хагас
-- дутуу мөр үүсгэхийг хориглоно: өргөрөг байгаад уртраг байхгүй бол
-- газрын зураг дээр юу ч хийж чадахгүй.
alter table bookings
  add constraint bookings_service_coords_pair check (
    (service_lat is null) = (service_lng is null)
  );

-- Хүрээнээс гарсан утга нь газрын зургийг эвдэх (эсвэл өөр тивд аваачих)
-- тул DB түвшинд таслана — клиент талын шалгалт алдаж болно.
alter table bookings
  add constraint bookings_service_coords_range check (
    service_lat is null
    or (service_lat between -90 and 90 and service_lng between -180 and 180)
  );

-- RLS нэмэлт policy шаардахгүй: 0006-ийн `bookings_select` нь бизнесийн
-- эзэнд өөрийн захиалгуудыг бүтнээр нь уншуулдаг тул шинэ багана
-- артистад шууд харагдана. `bookings_insert` (0019) нь зөвхөн
-- `customer_id`, бизнесийн төлвийг шалгадаг тул хөндөгдөхгүй.
