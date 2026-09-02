-- LUMINA — мэдэгдлийг Realtime-аар шууд хүргэх.
-- Supabase SQL Editor дээр 0021-ийн дараа ажиллуулна.
--
-- 0021 нь утас руу түлхэх push-ыг нэмсэн ч тэр нь iOS дээр Apple-ийн
-- төлбөртэй бүртгэл шаарддаг. Түүнээс үл хамааран, апп НЭЭЛТТЭЙ байх үед
-- хэрэглэгч шинэ захиалга ирснийг мэдэх ёстой — одоо бол дэлгэцээ дахин
-- нээж байж л шинэчлэгддэг.
--
-- Шийдэл: `notifications` хүснэгтийг Realtime-ийн publication-д нэмнэ.
-- Ингэснээр клиент өөрийн мөр орох агшинд шууд мэдэгдэл авах бөгөөд
-- дэлгэц дээр Messenger маягийн жижиг самбар гарч ирнэ.
--
-- ⚠️ RLS хэвээрээ үйлчилнэ: `notifications_select_own` нь хүн зөвхөн
-- өөрийн мөрөө харахыг зөвшөөрдөг тул Realtime ч мөн адил зөвхөн
-- өөрийнхийг нь дамжуулна. Publication-д нэмэх нь өгөгдлийг нээхгүй.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;
end
$$;
