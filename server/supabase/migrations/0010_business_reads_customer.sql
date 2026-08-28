-- LUMINA — бизнес өөрт нь захиалга өгсөн үйлчлүүлэгчийн нэрийг харна.
-- Supabase SQL Editor дээр 0009-ийн дараа ажиллуулна.
--
-- `profiles_select_own` нь зөвхөн өөрийн мөрийг уншуулдаг тул салон/артист
-- панел дээр захиалга харуулах гэхэд "хэн захиалсан" нь хоосон гарна.
-- Сэтгэгдэл дээр үүнийг нэрийг хуулж хадгалснаар шийдсэн ч захиалгын
-- хувьд утасны дугаар хэрэгтэй бөгөөд хамгийн сүүлийн үеийнх нь байх
-- ёстой тул энд бодит холбоо руу нь эрх нээв.
--
-- Функц нь security definer: policy доторх дэд асуулга RLS-тэй хүснэгт
-- рүү (businesses → is_super_admin() → profiles) орвол рекурс үүсгэнэ.

create or replace function is_my_booking_customer(pid uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from bookings b
    join businesses z on z.id = b.business_id
    where b.customer_id = pid
      and z.owner_id = auth.uid()
  );
$$;

-- Зөвхөн захиалга өгсөн хүнийх, зөвхөн захиалгыг нь хүлээн авсан бизнест.
--
-- ⚠️ Амьд өгөгдлийн сан дээр үүнтэй ижил үйлчилдэг policy аль хэдийн
-- байгааг илрүүлсэн (migration-д нь ороогүй — dashboard-аас нэмсэн бололтой).
-- Тиймээс энэ файл нь юуны түрүүнд шинээр тохируулах хүнд зориулагдана.
-- Permissive policy-ууд OR-оор нийлдэг тул давхарлах нь эрхийг өргөтгөхгүй,
-- гэхдээ дэмий давхардуулахгүйн тулд нэрээр нь шалгав.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_select_booking_customer'
  ) then
    create policy profiles_select_booking_customer on profiles
      for select using (is_my_booking_customer(id));
  end if;
end $$;
