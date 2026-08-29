-- LUMINA — нийтийн зургаа устгах эрх.
-- Supabase SQL Editor дээр 0015-ийн дараа ажиллуулна.
--
-- 0001 нь `business-public` bucket-д зөвхөн read болон insert policy
-- үүсгэсэн байсан — устгах policy огт байхгүй. Тухайн үед лого/ковер
-- хоёрыг зөвхөн дарж бичдэг байсан тул мэдрэгдээгүй.
--
-- Одоо галерейд зураг нэмэх/хасах боломж нэмэгдсэн тул устгах эрх
-- хэрэгтэй болов: эс бөгөөс `business_media`-ийн мөр устсан ч файл нь
-- bucket-д үлдэж, хаана ч холбоогүй мөртлөө нийтэд нээлттэй хэвээр
-- хуримтлагдана.
--
-- Зам нь `<business_id>/…` хэлбэртэй — insert policy-той ижил дүрмээр
-- эзнийг таана.

create policy public_assets_delete on storage.objects
  for delete using (
    bucket_id = 'business-public'
    and owns_business((storage.foldername(name))[1]::uuid)
  );
