-- LUMINA — үйлчлүүлэгчид зөвшөөрөгдсөн (approved) бизнесүүдийг хайж,
-- үзэх боломжтой болгоно.
--
-- Одоогийн RLS нь зөвхөн эзэн/админ өөрийн бизнесээ харах боломжтой
-- байсан тул гар утасны апп дээрх нүүр хуудас/хайлт үргэлж хоосон гарч
-- байсан. documents/payout_accounts/contracts зэрэг хувийн мэдээллийг
-- ЭНЭ migration ил гаргахгүй — зөвхөн businesses/business_categories-ийн
-- нийтэд харагдах ёстой талбарууд (нэр, төрөл, хаяг, лого/ковер, ангилал).

create policy businesses_select_public on businesses
  for select using (status = 'approved');

create policy business_categories_select_public on business_categories
  for select using (
    exists (select 1 from businesses where id = business_id and status = 'approved')
  );
