-- LUMINA — эрх өсгөх (privilege escalation) хоёр цоорхойг хаав.
-- Supabase SQL Editor дээр 0017-ийн дараа ЯАРАЛТАЙ ажиллуулна.
--
-- Бодит туршилтаар хоёр зам илэрсэн:
--
-- 1. `profiles_update_own` (0001) нь "өөрийн мөрөө засаж болно" гэдэг ч
--    RLS нь БАГАНААР хязгаарлаж чаддаггүй. Тиймээс нэвтэрсэн ямар ч
--    хэрэглэгч нэг дуудлагаар өөрийгөө super_admin болгож чадна:
--        supabase.from("profiles").update({ role: "super_admin" })
--    Туршилтаар demo хэрэглэгч ингэж эрхээ өсгөж чадсан.
--
-- 2. `handle_new_user` (0001) нь `raw_user_meta_data ->> 'role'`-ыг шууд
--    авдаг. Энэ талбарыг КЛИЕНТ бүрдүүлдэг:
--        supabase.auth.signUp({ …, options: { data: { role: "super_admin" } } })
--    Өөрөөр хэлбэл нэвтрэхээс ч өмнө, эхний хүсэлтээрээ админ болно.
--    Туршилтаар metadata-гаас `super_admin` шууд profiles руу орсон.
--
-- Хоёулаа `proxy.ts`-ийн `/admin` шалгалт, `is_super_admin()`-д тулгуурласан
-- бүх RLS дүрмийг бүхэлд нь тойрч гарна.

-- ------------------------------------------------- 1. бүртгүүлэх үеийн role
-- Өөрөө сонгож болох гурван role. `super_admin`-ийг зөвхөн одоо байгаа
-- админ гараар олгоно (доорх триггер үүнийг мөрдүүлнэ).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested text := new.raw_user_meta_data ->> 'role';
begin
  insert into profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    -- Жагсаалтад байхгүй бол (super_admin, хог утга, null) анхны утга.
    case
      when requested in ('salon', 'artist', 'customer') then requested::user_role
      else 'salon'::user_role
    end
  );
  return new;
end;
$$;

-- ---------------------------------------------------- 2. role-ыг хамгаалах
-- RLS баганаар хязгаарлаж чаддаггүй тул триггерээр шалгана — захиалгын
-- төлөвт (0014/0015) хэрэглэсэнтэй ижил арга.
create function enforce_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.id <> old.id then
    raise exception 'Профайлын дугаарыг өөрчилж болохгүй.';
  end if;

  if new.role = old.role then
    return new;
  end if;

  -- Service role / шууд SQL — RLS-ийг угаасаа тойрдог итгэмжлэгдсэн зам.
  if auth.uid() is null then
    return new;
  end if;

  -- Зөвхөн одоо байгаа админ role олгоно.
  if is_super_admin() then
    return new;
  end if;

  raise exception 'Эрхээ өөрчлөх боломжгүй.';
end;
$$;

create trigger profiles_enforce_update
  before update on profiles
  for each row execute function enforce_profile_update();
